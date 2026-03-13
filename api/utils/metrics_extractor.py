"""
Utility for extracting metrics from LangGraph agent execution results
"""

from typing import Dict, List, Any
import time


def extract_agent_metrics(messages: List[Any]) -> Dict[str, Any]:
    """
    Extract token usage, call counts, and timing from LangGraph messages.

    Args:
        messages: List of messages from LangGraph agent execution

    Returns:
        Dict with total_input_tokens, total_output_tokens, tool_calls, llm_calls, total_duration_ms
    """
    import logging
    logger = logging.getLogger(__name__)

    input_tokens = 0
    output_tokens = 0
    tool_calls = 0
    llm_calls = 0

    # Track timing - measure from first to last message timestamp
    first_timestamp = None
    last_timestamp = None

    for msg in messages:
        # Track timestamps if available
        if hasattr(msg, 'additional_kwargs'):
            # Try to get timestamp from message
            timestamp = msg.additional_kwargs.get('timestamp')
            if timestamp:
                if first_timestamp is None:
                    first_timestamp = timestamp
                last_timestamp = timestamp

        # Count tool calls (messages with tool_calls attribute)
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            tool_calls += len(msg.tool_calls)

        # Count LLM calls and extract token usage from AIMessage responses ONLY
        # Check if this is an AIMessage by looking for response_metadata attribute
        if hasattr(msg, 'response_metadata') and msg.__class__.__name__ == 'AIMessage':
            llm_calls += 1
            metadata = msg.response_metadata

            # DEBUG: Log metadata structure for first AIMessage
            if llm_calls == 1:
                logger.info(f"[MetricsExtractor] First AIMessage metadata keys: {list(metadata.keys())}")

            # Try different token usage formats (different LLM providers use different keys)
            if 'usage_metadata' in metadata:
                # LangChain format
                usage = metadata['usage_metadata']
                input_tokens += usage.get('input_tokens', 0)
                output_tokens += usage.get('output_tokens', 0)
            elif 'token_usage' in metadata:
                # OpenAI format
                usage = metadata['token_usage']
                input_tokens += usage.get('prompt_tokens', 0)
                output_tokens += usage.get('completion_tokens', 0)
            elif 'usage' in metadata:
                # Alternative format
                usage = metadata['usage']
                input_tokens += usage.get('input_tokens', usage.get('prompt_tokens', 0))
                output_tokens += usage.get('output_tokens', usage.get('completion_tokens', 0))
            else:
                logger.warning(f"[MetricsExtractor] No token usage found in metadata keys: {list(metadata.keys())}")

    # Calculate duration in milliseconds
    duration_ms = 0
    if first_timestamp and last_timestamp:
        duration_ms = (last_timestamp - first_timestamp) * 1000

    return {
        "total_input_tokens": input_tokens,
        "total_output_tokens": output_tokens,
        "total_tokens": input_tokens + output_tokens,
        "tool_calls": tool_calls,
        "llm_calls": llm_calls,
        "total_duration_ms": duration_ms
    }
