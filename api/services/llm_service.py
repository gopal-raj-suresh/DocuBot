"""
LLM Service - Universal LLM client for multiple providers
Supports OpenAI, Groq, Ollama, OpenRouter, Custom APIs, and Enterprise Inference
"""

import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from config import settings
import httpx

logger = logging.getLogger(__name__)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True
)
def get_llm(model_name: Optional[str] = None, temperature: Optional[float] = None) -> ChatOpenAI:
    """
    Get universal LLM instance supporting multiple providers

    Supports:
    - OpenAI (gpt-4o, gpt-4-turbo, gpt-4o-mini)
    - Groq (llama models, fast inference)
    - Ollama (local models, qwen, llama)
    - OpenRouter (claude, gemini, multi-model access)
    - Custom OpenAI-compatible APIs
    - Enterprise Inference endpoints (backward compatibility)

    Args:
        model_name: Model name to use (defaults to agent-specific model or LLM_MODEL)
        temperature: Temperature for generation (defaults to TEMPERATURE setting)

    Returns:
        ChatOpenAI instance configured for the selected provider

    Raises:
        ValueError: If configuration is invalid or missing required fields
    """
    # Use defaults from settings
    if model_name is None:
        model_name = settings.LLM_MODEL
    if temperature is None:
        temperature = settings.TEMPERATURE

    if settings.INFERENCE_API_ENDPOINT and settings.INFERENCE_API_TOKEN:
        logger.info(f"Using enterprise inference endpoint for model: {model_name}")
        return _get_enterprise_inference_llm(model_name, temperature)

    # Use new multi-provider configuration
    if not settings.LLM_BASE_URL:
        raise ValueError(
            "LLM_BASE_URL is required. Set LLM_BASE_URL in your .env file.\n"
            "Examples:\n"
            "  OpenAI: https://api.openai.com/v1\n"
            "  Groq: https://api.groq.com/openai/v1\n"
            "  Ollama: http://localhost:11434/v1\n"
            "  OpenRouter: https://openrouter.ai/api/v1"
        )

    provider = settings.LLM_PROVIDER.lower()
    logger.info(f"Initializing {provider} LLM with model: {model_name}")

    # Validate API key requirement (Ollama doesn't need one)
    if provider != "ollama" and not settings.LLM_API_KEY:
        raise ValueError(
            f"LLM_API_KEY is required for {provider}. "
            f"Set LLM_API_KEY in your .env file or use provider=ollama for local deployment."
        )

    # Normalize base URL based on provider
    base_url = _normalize_base_url(settings.LLM_BASE_URL, provider)

    # Configure async httpx client with SSL verification and timeout
    http_async_client = httpx.AsyncClient(
        verify=settings.VERIFY_SSL,
        timeout=settings.REQUEST_TIMEOUT
    )

    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        openai_api_key=settings.LLM_API_KEY or "not-needed",  # Ollama doesn't need a key
        openai_api_base=base_url,
        max_tokens=settings.MAX_TOKENS,
        max_retries=settings.MAX_RETRIES,
        http_async_client=http_async_client
    )


def _normalize_base_url(base_url: str, provider: str) -> str:
    """
    Normalize base URL for different providers

    Args:
        base_url: Raw base URL from configuration
        provider: Provider name (openai, groq, ollama, etc.)

    Returns:
        Normalized base URL for OpenAI-compatible API
    """
    base_url = base_url.rstrip('/')

    # Ollama: Add /v1 if not present
    if provider == "ollama" and not base_url.endswith('/v1'):
        return f"{base_url}/v1"

    # Other providers: Use as-is (they should already have /v1 or correct path)
    return base_url


def _get_enterprise_inference_llm(model_name: str, temperature: float) -> ChatOpenAI:
    """
    Enterprise inference configuration

    Args:
        model_name: Model name
        temperature: Temperature setting

    Returns:
        ChatOpenAI instance for enterprise inference endpoint
    """
    if not settings.INFERENCE_API_ENDPOINT or not settings.INFERENCE_API_TOKEN:
        raise ValueError("INFERENCE_API_ENDPOINT and INFERENCE_API_TOKEN are required for enterprise inference")

    # Configure async httpx client
    http_async_client = httpx.AsyncClient(
        verify=settings.VERIFY_SSL,
        timeout=settings.REQUEST_TIMEOUT
    )

    # Enterprise inference endpoints typically need /v1 suffix
    endpoint = settings.INFERENCE_API_ENDPOINT.rstrip('/')
    if not endpoint.endswith('/v1'):
        endpoint = f"{endpoint}/v1"

    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        openai_api_key=settings.INFERENCE_API_TOKEN,
        openai_api_base=endpoint,
        max_tokens=settings.AGENT_MAX_TOKENS,
        http_async_client=http_async_client
    )
