"""
Configuration management for DocuBot AI
Supports GenAI Gateway and Keycloak authentication
"""

import os
from enum import Enum
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings with unified inference configuration"""

    # Application Info
    APP_TITLE: str = "DocuBot - AI Documentation Generator"
    APP_DESCRIPTION: str = "AI-powered documentation generation with specialized micro-agent system"
    APP_VERSION: str = "1.0.0"

    # Server Configuration
    API_PORT: int = 5001
    HOST: str = "0.0.0.0"

    # CORS Settings
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]

    # =================================================================
    # LLM Provider Configuration (RECOMMENDED - Universal Support)
    # =================================================================
    # Supports: openai, groq, ollama, openrouter, or custom
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o"  # Default model (can be overridden per agent)

    # Generation Parameters
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 1000
    MAX_RETRIES: int = 3
    REQUEST_TIMEOUT: int = 300  # 5 minutes

    # Security Configuration
    VERIFY_SSL: bool = True

    # =================================================================
    # Enterprise Inference Configuration
    # =================================================================
    # Use these if you're connecting to enterprise inference endpoints
    # If set, these will override LLM_PROVIDER settings above
    INFERENCE_API_ENDPOINT: Optional[str] = None
    INFERENCE_API_TOKEN: Optional[str] = None

    # Docker Network Configuration
    LOCAL_URL_ENDPOINT: str = "not-needed"

    # Micro-Agent Model Configuration (Using SLM - Qwen3-4B)
    CODE_EXPLORER_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    API_REFERENCE_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    CALL_GRAPH_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    ERROR_ANALYSIS_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    ENV_CONFIG_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    DEPENDENCY_ANALYZER_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    PLANNER_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    MERMAID_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    QA_VALIDATOR_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"
    WRITER_MODEL: str = "Qwen/Qwen3-4B-Instruct-2507"


    # Repository Settings
    TEMP_REPO_DIR: str = "./tmp/repos"
    MAX_REPO_SIZE: int = 10737418240  # 10GB in bytes
    MAX_FILE_SIZE: int = 1000000  # 1MB
    MAX_FILES_TO_SCAN: int = 500
    MAX_LINES_PER_FILE: int = 500  # Line budget per file (pattern_window extracts ~150-300 lines)

    # GitHub Integration (for MCP PR creation)
    GITHUB_TOKEN: Optional[str] = None

    # Agent Execution Settings
    AGENT_TEMPERATURE: float = 0.7
    AGENT_MAX_TOKENS: int = 1000
    AGENT_TIMEOUT: int = 300  # 5 minutes

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
