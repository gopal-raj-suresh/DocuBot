"""
Mermaid Diagram Agent - SIMPLIFIED for 8K context models

Generates Mermaid diagrams for architecture visualization.

Follows proven pattern:
- ≤3 tools
- Includes validate_mermaid_syntax for self-correction
- Minimal prompt
"""

import logging
from typing import Dict, Any
from langgraph.prebuilt import create_react_agent
from langchain_core.language_models import BaseChatModel
from langchain.tools import tool
from core.agent_event_logger import create_agent_logger
from utils.metrics_extractor import extract_agent_metrics

logger = logging.getLogger(__name__)


def _fix_incomplete_mermaid(output: str) -> str:
    """
    Strict validation and fixing of Mermaid diagrams.
    Ensures proper structure and syntax for GPT model outputs.
    """
    import re

    if not output:
        return output

    # If no mermaid block at all, return as-is
    if "```mermaid" not in output:
        logger.warning("[Mermaid] No mermaid code block found in output")
        return output

    fixed_output = output

    # Fix 1: Ensure all mermaid blocks have closing ```
    # Match mermaid blocks with or without closing ```
    pattern = r'(```mermaid\n)(.*?)(?:```|$)'
    matches = list(re.finditer(pattern, output, re.DOTALL))

    for match in matches:
        full_match = match.group(0)
        opening = match.group(1)
        content = match.group(2)

        # Check if it has proper closing
        if not full_match.endswith('```'):
            # Add closing ```
            fixed_block = f"{opening}{content.rstrip()}\n```"
            fixed_output = fixed_output.replace(full_match, fixed_block)
            logger.info("[Mermaid] Fixed missing closing ``` for mermaid block")

    # Fix 2: Validate that diagram starts with proper declaration
    mermaid_blocks = re.findall(r'```mermaid\n(.*?)```', fixed_output, re.DOTALL)

    for block in mermaid_blocks:
        block_stripped = block.strip()

        # Check if it starts with graph/flowchart declaration
        if not (block_stripped.startswith('graph ') or
                block_stripped.startswith('flowchart ') or
                block_stripped.startswith('sequenceDiagram') or
                block_stripped.startswith('classDiagram')):
            logger.warning(f"[Mermaid] Block missing proper diagram declaration: {block_stripped[:50]}")

            # Try to prepend graph TD if it looks like node definitions
            if '-->' in block_stripped or '---' in block_stripped:
                fixed_block = f"graph TD\n    {block_stripped}"
                fixed_output = fixed_output.replace(f"```mermaid\n{block}", f"```mermaid\n{fixed_block}")
                logger.info("[Mermaid] Added 'graph TD' declaration to block")

    # Fix 3: Remove any extra text before/after mermaid blocks within the code fence
    # (GPT sometimes adds explanatory text inside the code block)
    mermaid_blocks = re.findall(r'```mermaid\n(.*?)```', fixed_output, re.DOTALL)

    for block in mermaid_blocks:
        lines = block.strip().split('\n')

        # Keep only valid mermaid lines
        valid_lines = []
        started = False

        for line in lines:
            line_stripped = line.strip()

            # Check if line looks like valid mermaid syntax
            if line_stripped.startswith(('graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram')):
                started = True
                valid_lines.append(line)
            elif started and (line_stripped == '' or
                             '-->' in line_stripped or
                             '---' in line_stripped or
                             line_stripped.endswith(']') or
                             line_stripped.endswith(')') or
                             line_stripped.endswith('"')):
                valid_lines.append(line)
            elif not started:
                # Skip preamble text
                continue

        if len(valid_lines) < len(lines):
            cleaned_block = '\n'.join(valid_lines)
            fixed_output = fixed_output.replace(f"```mermaid\n{block}", f"```mermaid\n{cleaned_block}\n")
            logger.info("[Mermaid] Removed non-mermaid text from code block")

    return fixed_output


# MINIMAL system prompt
MERMAID_PROMPT = """You are a Mermaid Diagram Generator. Create COMPLETE architecture diagrams.

**CRITICAL RULES - READ CAREFULLY:**
1. ALWAYS enclose the architecture diagram in proper mermaid syntax: ```mermaid ... ```
2. NEVER output incomplete diagrams
3. ALWAYS include the closing ``` tag
4. Output ONLY valid Mermaid syntax inside the code block
5. NO explanatory text inside the ```mermaid ... ``` block

**Output:** ONE simple, clean Mermaid diagram:
- Focus on main components only (5-8 key nodes maximum)
- Show primary data flow (avoid creating too many edges)
- Keep it SIMPLE and READABLE

**Tools:**
- find_entry_points() - find main files
- read_file(path) - read file (smart strategy for structure)
- validate_mermaid_syntax(code) - validate diagram

**Mermaid Syntax Rules:**
- Start with: graph TD (top-down layout for clarity)
- Node IDs: alphanumeric + underscore only (no spaces, slashes)
- Node labels: use quotes for multi-word: NodeID["Label Text"]
- Edge labels: keep them short, avoid special chars
- LIMIT edges: Only show main data flow (avoid creating too many arrows)
- Keep diagram SIMPLE: 5-8 nodes maximum for clarity
- Close with ``` after the diagram

**Example (COMPLETE and CORRECT):**
```mermaid
graph TD
    User["User"]
    API["API Server"]
    DB["Database"]
    User -->|Request| API
    API -->|Query| DB
```

**Process:**
1. Find entry points
2. Read key files to understand architecture
3. Identify 5-8 MAIN components only (ignore minor details)
4. Generate SIMPLE diagram:
   - Start with ```mermaid
   - Add graph TD
   - Define main nodes only
   - Connect with PRIMARY data flow only (avoid complex routing)
   - Close with ```
5. VALIDATE with validate_mermaid_syntax()
6. Fix errors if validation fails

**IMPORTANT:** Prioritize SIMPLICITY over completeness. A clean 6-node diagram is better than a messy 15-node diagram.

**FINAL VALIDATION:**
Before finishing, ALWAYS ensure:
- Diagram is enclosed in ```mermaid ... ```
- Has proper graph TD or flowchart TD declaration
- All nodes are properly defined
- All edges use correct syntax
- Closing ``` is present

**Limit:** 20 tool calls."""


async def run_mermaid_agent(
    llm: BaseChatModel,
    repo_path: str,
    job_id: str,
    api_endpoints: list = None
) -> Dict[str, Any]:
    """
    Simplified Mermaid Agent

    Args:
        llm: Language model
        repo_path: Repository path
        job_id: Job ID
        api_endpoints: Optional list of API endpoints extracted by API Reference agent

    Returns:
        Results dict with success flag and output
    """
    try:
        # Create minimal tool set (3 tools)
        @tool
        def find_entry_points() -> str:
            """Find main entry point files. No args."""
            from tools.repo_tools import find_entry_points_tool
            return find_entry_points_tool.func(repo_path=repo_path)

        @tool
        def read_file(file_path: str) -> str:
            """Read file with smart sampling. Args: file_path (str)"""
            from tools.repo_tools import read_file_tool
            # Use smart strategy: signatures only (good for architecture)
            return read_file_tool.func(repo_path=repo_path, file_path=file_path, strategy="smart")

        @tool
        def validate_mermaid_syntax(mermaid_code: str) -> str:
            """Validate Mermaid diagram syntax. Args: mermaid_code (str)"""
            from tools.repo_tools import validate_mermaid_syntax_tool
            return validate_mermaid_syntax_tool.func(mermaid_code=mermaid_code)

        tools = [find_entry_points, read_file, validate_mermaid_syntax]

        # Create agent
        agent = create_react_agent(model=llm, tools=tools)

        # Create callback logger
        event_logger = create_agent_logger(job_id=job_id, agent_name="Mermaid")

        # Build user message with optional API endpoints
        user_message = "Generate Mermaid architecture diagram. Start with find_entry_points()."

        if api_endpoints and len(api_endpoints) > 0:
            user_message += f"\n\nAPI Endpoints available (include these in diagram if relevant):\n"
            for ep in api_endpoints[:10]:  # Limit to 10 to avoid context overflow
                method = ep.get("method", "GET")
                path = ep.get("path", "/")
                desc = ep.get("description", "")
                user_message += f"- {method} {path}: {desc}\n"

        # Execute agent
        import asyncio
        try:
            result = await asyncio.wait_for(
                agent.ainvoke(
                    {"messages": [
                        ("system", MERMAID_PROMPT),
                        ("user", user_message)
                    ]},
                    config={
                        "recursion_limit": 25,
                        "callbacks": [event_logger]
                    }
                ),
                timeout=300
            )
        except asyncio.TimeoutError:
            logger.error(f"[Mermaid] Timeout after 300 seconds - forcing minimal output")
            return {
                "success": True,
                "output": "",
                "agent": "Mermaid",
                "total_duration_ms": 300000,
                "timeout_occurred": True
            }

        # Extract output
        messages = result.get("messages", [])
        final_output = messages[-1].content if messages else ""

        # Post-process: Fix incomplete Mermaid diagrams (common issue with GPT models)
        final_output = _fix_incomplete_mermaid(final_output)

        # Extract metrics from messages
        metrics = extract_agent_metrics(messages)

        return {
            "success": True,
            "output": final_output,
            "agent": "Mermaid",
            **metrics
        }

    except Exception as e:
        logger.error(f"Mermaid failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "agent": "Mermaid"
        }
