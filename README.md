<p align="center">
  <img src="docs/assets/InnovationHub-HeaderImage.png" width="800" alt="Company logo">
</p>

# 📚 DocuBot - AI Documentation Generator

An AI-powered full-stack application that generates high-quality project documentation from source code repositories. Connect a GitHub repo, let specialized micro-agents analyze the codebase, architecture, dependencies, and APIs, and get structured README documentation in minutes, powered by multi-provider LLMs, OpenAI-compatible endpoints, or locally hosted models such as Ollama.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Get Started](#get-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [LLM Provider Configuration](#llm-provider-configuration)
- [Inference Metrics](#inference-metrics)
- [Model Capabilities](#model-capabilities)
- [Environment Variables](#environment-variables)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Overview

**DocuBot** shows how agentic AI can be applied to one of the most time-consuming software tasks: documentation. The applicatoin analyzes real project evidence from a repository and uses specialized micro-agents to generate structured, context-aware README documentation that is more accurate and maintainable than traditional single-prompt generation.

The application supports a flexible inference layer, allowing it to work with OpenAI, Groq, OpenRouter, custom OpenAI-compatible APIs, and local Ollama deployments. This makes it practical for cloud-based teams, enterprise environments, and privacy-sensitive local setups alike.

This makes DocuBot suitable for:

- **Enterprise teams** — integrate with internal gateways, hosted APIs, or private inference infrastructure
- **Local experimentation**  — run documentation generation with self-hosted models through Ollama
- **Hardware benchmarking** — measure SLM throughput on Apple Silicon, CUDA, or Intel Gaudi hardware

### How It Works

1. **Repository Analysis**: Users provide a GitHub repository URL. The system clones and analyzes the codebase structure, dependencies, and configuration files.
2. **Multi-Agent Processing**: 9 specialized micro-agents work in parallel to extract different aspects: project overview, features, architecture, API endpoints, error handling, configuration, deployment, and troubleshooting.
3. **Evidence-Based Generation**: The system collects concrete evidence from the codebase (dependencies, Docker files, config files) to ensure factually accurate documentation.
4. **Quality Validation**: A QA agent validates all sections against evidence to prevent hallucinations and ensure documentation quality.
5. **Automated PR Creation**: Optionally creates a GitHub Pull Request with the generated README using the Model Context Protocol (MCP).

The platform supports multiple LLM providers (OpenAI, Groq, Ollama, OpenRouter, or any OpenAI-compatible API), allowing teams to choose the best option for their deployment needs. The backend uses LangGraph for workflow orchestration and provides real-time processing updates via Server-Sent Events.

---

## Architecture

This application uses a micro-agent architecture where specialized agents collaborate to generate comprehensive documentation. The React frontend communicates with a FastAPI backend that orchestrates the multi-agent workflow through LangGraph. The backend integrates with multiple LLM providers through a universal client, enabling flexible deployment options across cloud APIs and local models.

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Web UI<br/>Port 3000]
    end

    subgraph "Backend Layer"
        B[FastAPI Backend<br/>Port 5001]
    end

    subgraph "Workflow Orchestration"
        C[LangGraph Workflow]
        D[State Management]
    end

    subgraph "Micro-Agents (9 Agents)"
        E1[Code Explorer<br/>Overview & Features]
        E2[API Reference<br/>Endpoint Extraction]
        E3[Call Graph<br/>Architecture]
        E4[Error Analysis<br/>Troubleshooting]
        E5[Env Config<br/>Configuration]
        E6[Dependency Analyzer<br/>Prerequisites & Deploy]
        E7[Planner<br/>Section Planning]
        E8[Mermaid<br/>Diagram Generation]
        E9[QA Validator<br/>Quality Check]
    end

    subgraph "Services"
        F[LLM Service]
        G[Git Service]
        H[Evidence Aggregator]
    end

    subgraph "External Services"
        I[LLM Providers<br/>OpenAI/Groq/Ollama/OpenRouter/Custom]
        J[GitHub<br/>PR Creation via MCP]
    end

    A -->|Submit Repo URL| B
    B -->|Initialize Workflow| C
    C -->|Clone Repo| G
    C -->|Execute Agents| E1
    E1 --> E2 --> E3 --> E4 --> E5 --> E6
    E6 --> H
    H --> E7
    E7 --> E8 --> E9
    E1 -.->|Request LLM| F
    E2 -.->|Request LLM| F
    E3 -.->|Request LLM| F
    E4 -.->|Request LLM| F
    E5 -.->|Request LLM| F
    E6 -.->|Request LLM| F
    E7 -.->|Request LLM| F
    E8 -.->|Request LLM| F
    E9 -.->|Request LLM| F
    F -->|API Request| I
    E9 -->|Final README| D
    D -->|Stream Progress| B
    B -->|SSE Updates| A
    B -->|Create PR| J
    G -->|Repo Files| H

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1f5
    style D fill:#e8f5e9
    style E1 fill:#f0f0ff
    style E2 fill:#f0f0ff
    style E3 fill:#f0f0ff
    style E4 fill:#f0f0ff
    style E5 fill:#f0f0ff
    style E6 fill:#f0f0ff
    style E7 fill:#f0f0ff
    style E8 fill:#f0f0ff
    style E9 fill:#f0f0ff
    style F fill:#ffe1f5
    style G fill:#ffe1f5
    style H fill:#ffe1f5
    style I fill:#e1ffe1
    style J fill:#e1ffe1
```

**Service Components:**

1. **React Web UI (Port 3000)** - Provides repository URL input, real-time agent progress tracking with Server-Sent Events, generated README preview with syntax highlighting, and PR creation interface

2. **FastAPI Backend (Port 5001)** - Handles API routing, orchestrates workflow execution, manages job state, and serves JSON/SSE responses to the frontend

3. **LangGraph Workflow** - Orchestrates sequential execution of 9 micro-agents, manages state transitions, handles interrupts for monorepo project selection, and checkpoints workflow state

4. **Micro-Agents (9 Specialized Agents)**:
   - **Code Explorer**: Analyzes project structure to write Overview & Features sections
   - **API Reference**: Extracts API endpoints and routes from code
   - **Call Graph**: Maps component relationships for Architecture section
   - **Error Analysis**: Identifies error handlers for Troubleshooting section
   - **Env Config**: Discovers configuration files for Configuration section
   - **Dependency Analyzer**: Extracts dependencies for Prerequisites & Deployment sections
   - **Planner**: Decides which sections to include based on project type
   - **Mermaid**: Generates architecture diagrams with semantic validation
   - **QA Validator**: Validates documentation against evidence to prevent hallucinations

5. **LLM Service** - Universal adapter supporting multiple LLM providers (OpenAI, Groq, Ollama, OpenRouter, custom APIs, enterprise inference) with retry logic and SSL verification

6. **Git Service** - Handles repository cloning, branch detection, monorepo analysis, and cleanup

7. **Evidence Aggregator** - Collects concrete evidence from filesystem (dependencies, Docker files, config files, languages) to ensure factual accuracy

**Typical Flow:**

1. User submits GitHub repository URL through the web UI
2. Backend initializes workflow and clones the repository
3. System detects if repository is a monorepo (multiple projects)
4. If monorepo, user selects which project to document (interrupt point)
5. Six section writer agents execute in sequence, analyzing code and generating sections
6. Evidence aggregator collects filesystem evidence (dependencies, Docker, configs)
7. Planner agent decides which sections to include based on project type
8. Mermaid agent generates architecture diagram
9. QA agent validates all sections against collected evidence
10. Assembly node combines sections into final README
11. User can download README or create a GitHub PR with one click

---

## Get Started

### Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Docker and Docker Compose** (v20.10+)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **LLM Provider Access** (choose one):
  - [OpenAI API Key](https://platform.openai.com/account/api-keys) (Recommended)
  - [Groq API Key](https://console.groq.com/keys) (Fast & Free Tier)
  - [Ollama Local Installation](https://ollama.com) (Private/Local)
  - [OpenRouter API Key](https://openrouter.ai/keys) (Multi-Model)
  - Any OpenAI-compatible API endpoint

#### Verify Installation

```bash
# Check Docker
docker --version
docker compose version

# Verify Docker is running
docker ps
```

### Quick Start (Docker Deployment)

**Recommended for most users - runs everything in containers**

#### 1. Clone or Navigate to Repository

```bash
# If cloning:
git clone https://github.com/cld2labs/DocuBot.git
cd DocuBot
```

#### 2. Configure Backend Environment

Copy the example configuration and add your API key:

```bash
# Copy backend environment template
cd api

cp api/.env.example api/.env

# Edit the file and add your API key
nano api/.env
```

Update `api/.env` with your LLM provider credentials:

```bash
LLM_PROVIDER=openai
LLM_API_KEY=your_actual_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

**For other providers**, see [LLM Provider Configuration](#llm-provider-configuration) section.

#### 3. Launch the Application

```bash
# Build and start all services
docker compose up -d --build

# View logs (optional)
docker compose logs -f
```

#### 4. Access the Application

Once containers are running:

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/docs

#### 5. Verify Services

```bash
# Check health status
curl http://localhost:5001/health

# Check all services are running
docker compose ps
```

#### 6. Stop the Application

```bash
docker compose down
```

---

### Local Development Setup

**For developers who want to run services locally without Docker**

#### 1. Prerequisites

- Python 3.11+
- Node.js 20+
- Your chosen LLM provider API key

#### 2. Backend Setup

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Add your API key

# Start backend
uvicorn server:app --reload --port 5001
```

Backend will run on `http://localhost:5001`

#### 3. Frontend Setup

Open a new terminal:

```bash
cd ui

# Install dependencies
npm install

# Configure environment for local development
cp .env.example .env

# Edit .env and set:
# VITE_API_URL=http://localhost:5001
nano .env

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Docs**: http://localhost:5001/docs

**Note**: For local development, the frontend `.env` file **must** contain:
```bash
VITE_API_URL=http://localhost:5001
```

This tells the frontend where to find the backend API.

---

## Project Structure

```
DocuBot/
├── api/
│   ├── agents/
│   │   ├── code_explorer_agent.py       # Overview & Features writer
│   │   ├── api_reference_agent.py       # API endpoint extractor
│   │   ├── call_graph_agent.py          # Architecture writer
│   │   ├── error_analysis_agent.py      # Troubleshooting writer
│   │   ├── env_config_agent.py          # Configuration writer
│   │   ├── dependency_analyzer_agent.py # Prerequisites & Deployment writer
│   │   ├── planner_agent.py             # Section planner
│   │   ├── mermaid_agent.py             # Diagram generator
│   │   ├── qa_validator_agent.py        # Quality validator
│   │   └── pr_agent_mcp.py              # PR creation via MCP
│   ├── services/
│   │   ├── llm_service.py               # Universal LLM provider client
│   │   └── git_service.py               # Git operations
│   ├── models/
│   │   ├── schemas.py                   # Pydantic data models
│   │   ├── state.py                     # Workflow state
│   │   ├── evidence.py                  # Evidence structures
│   │   └── log_manager.py               # SSE logging
│   ├── tools/
│   │   ├── repo_tools.py                # Repository analysis tools
│   │   └── new_analysis_tools.py        # Code analysis utilities
│   ├── utils/
│   │   ├── project_detector.py          # Monorepo detection
│   │   └── metrics_extractor.py         # Token usage metrics
│   ├── core/
│   │   ├── metrics_collector.py         # Performance tracking
│   │   └── agent_event_logger.py        # ReAct event logging
│   ├── mcp_client/
│   │   └── github_mcp_client.py         # GitHub MCP integration
│   ├── workflow.py                      # LangGraph workflow definition
│   ├── server.py                        # FastAPI application entry point
│   ├── config.py                        # Environment configuration
│   ├── requirements.txt                 # Python dependencies
│   └── Dockerfile                       # Backend container
├── ui/
│   ├── src/
│   │   ├── pages/
│   │   │   └── HomePage.tsx             # Main documentation generation page
│   │   ├── components/
│   │   │   └── ui/                      # Reusable UI components
│   │   ├── services/
│   │   │   └── api.ts                   # API client utilities
│   │   └── types/                       # TypeScript type definitions
│   ├── package.json                     # npm dependencies
│   ├── vite.config.ts                   # Vite configuration
│   └── Dockerfile                       # Frontend container
├── docs/
│   └── assets/                          # Documentation assets
├── docker-compose.yml                   # Service orchestration
├── .env.example                         # Environment variable template
├── README.md                            # Project documentation
├── TROUBLESHOOTING.md                   # Troubleshooting guide
├── CONTRIBUTING.md                      # Contribution guidelines
├── SECURITY.md                          # Security policy
├── DISCLAIMER.md                        # Usage disclaimer
├── LICENSE.md                           # MIT License
└── TERMS_AND_CONDITIONS.md              # Terms of use
```

---

## Usage Guide

### Using DocuBot

1. **Open the Application**
   - Navigate to `http://localhost:3000`

2. **Enter Repository URL**
   - Paste a GitHub repository URL (e.g., `https://github.com/owner/repo`)
   - Supports branch-specific URLs (e.g., `https://github.com/owner/repo/tree/dev`)
   - Supports subfolder URLs (e.g., `https://github.com/owner/repo/tree/main/backend`)

3. **Start Documentation Generation**
   - Click "Generate Documentation" button
   - Watch real-time agent progress in the activity panel
   - See which agent is currently running and what it's doing

4. **Handle Monorepo Selection (if needed)**
   - If the repository contains multiple projects, you'll be prompted to select one
   - Choose the project you want to document
   - System will focus analysis on that specific project

5. **Review Generated README**
   - Once complete, the README preview appears with syntax highlighting
   - Review all sections: Overview, Features, Architecture, Prerequisites, Deployment, etc.
   - Check the architecture diagram generated by the Mermaid agent

6. **Download or Create PR**
   - **Download**: Click "Download README.md" to save locally
   - **Create PR**: Click "Create Pull Request" to automatically:
     - Create a new branch (docs/update-readme-{timestamp})
     - Commit the README
     - Open a PR against the repository's default branch

### Performance Tips

- **Use the largest model your hardware can sustain.** `qwen3:14b` produces the best documentation quality; `qwen3:4b` is faster and good for benchmarking.
- **Lower `LLM_TEMPERATURE`** (e.g., `0.1`) for more factual, evidence-grounded documentation. Raise it slightly (e.g., `0.3–0.5`) for more descriptive, narrative-style README prose.
- **Keep repositories focused.** The agents analyze up to `MAX_FILES_TO_SCAN` files (default: 500). For large monorepos, use the built-in project selector to target a specific subproject rather than letting agents scan the entire repo.
- **On Apple Silicon**, always run Ollama natively — never inside Docker. The Metal GPU backend delivers significantly higher throughput for sequential multi-agent workloads compared to CPU-only inference.
- **On Linux with an NVIDIA GPU**, set `CUDA_VISIBLE_DEVICES` before starting Ollama to target a specific GPU.
- **For enterprise remote APIs**, choose a model with a large context window (≥16k tokens) to avoid truncation on longer inputs.

---

## LLM Provider Configuration

DocuBot supports multiple LLM providers. All providers are configured via the `.env` file. Set `INFERENCE_PROVIDER=ollama` for local inference.


### OpenAI

- **Get API Key**: https://platform.openai.com/account/api-keys
- **Models**: `gpt-4o`, `gpt-4-turbo`, `gpt-4o-mini`
- **Pricing**: Pay-per-use (check [OpenAI Pricing](https://openai.com/pricing))
- **Configuration**:
  ```bash
  LLM_PROVIDER=openai
  LLM_API_KEY=sk-...
  LLM_BASE_URL=https://api.openai.com/v1
  LLM_MODEL=gpt-4o
  ```

### Groq

Groq provides OpenAI-compatible endpoints with extremely fast inference (LPU hardware).

- **Get API Key**: https://console.groq.com/keys
- **Models**: `llama-3.2-90b-text-preview`, `llama-3.1-70b-versatile`
- **Free Tier**: 30 requests/min, 6,000 tokens/min
- **Pricing**: Very competitive paid tiers
- **Configuration**:
  ```bash
  LLM_PROVIDER=groq
  LLM_API_KEY=gsk_...
  LLM_BASE_URL=https://api.groq.com/openai/v1
  LLM_MODEL=llama-3.2-90b-text-preview
  ```

### Ollama

Runs inference locally on the host machine with full GPU acceleration.

- **Install Ollama**: https://ollama.com/download
- **Pull Model**: `ollama pull qwen3:14b`
- **Models**: `qwen3:4b`, `llama3.1:8b`, `llama3.2:3b`
- **Configuration**:
  ```bash
  LLM_PROVIDER=ollama
  LLM_API_KEY=  # Leave empty - no API key needed
  LLM_BASE_URL=http://localhost:11434/v1
  LLM_MODEL=qwen2.5:7b
  ```
- **Setup**:
  ```bash
  # Install Ollama
  curl -fsSL https://ollama.com/install.sh | sh

  # Pull model
  ollama pull qwen3:14b

  # Verify Ollama is running:
  curl http://localhost:11434/api/tags
  ```

### OpenRouter

OpenRouter provides a unified API across hundreds of models from different providers.

- **Get API Key**: https://openrouter.ai/keys
- **Models**: Claude, Gemini, GPT-4, Llama, and 100+ others
- **Pricing**: Varies by model
- **Configuration**:
  ```bash
  LLM_PROVIDER=openrouter
  LLM_API_KEY=sk-or-...
  LLM_BASE_URL=https://openrouter.ai/api/v1
  LLM_MODEL=anthropic/claude-3-haiku
  ```

### Custom OpenAI-Compatible API

**Best for**: Custom deployments, internal APIs, alternative providers

Any API that implements the OpenAI chat completions format will work:

```bash
LLM_PROVIDER=custom
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://your-custom-endpoint.com/v1
LLM_MODEL=your-model-name
```

If the endpoint uses a private domain mapped in `/etc/hosts`, also set:

```bash
LOCAL_URL_ENDPOINT=your-private-domain.internal
```


### Switching Providers

To switch providers, simply update `api/.env` and restart:

```bash
# Edit configuration
nano api/.env

# Restart backend only
docker compose restart api

# Or restart all services
docker compose down
docker compose up -d
```

---

## Inference Metrics

The table below compares inference performance across different providers, deployment modes, and hardware profiles using a standardized DocuBot's full 9-agent documentation pipeline.

| Provider | Model | Deployment | Context Window | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens / Request | P50 Latency (ms) | P95 Latency (ms) | Throughput (req/sec) | Hardware |
|---|---|---|---|---|---|---|---|---|---|---|
| vLLM | Qwen3-4B-Instruct-2507 | Local | 262.1K | 3,040 | 307.7 | 5809 | 15,864 | 40,809 | 0.0580 | Apple Silicon (Metal)(Macbook Pro M4) |
| [Intel OPEA EI](https://github.com/opea-project/Enterprise-Inference) | Qwen3-4B-Instruct-2507 | CPU (Xeon) | 8.1K | 4,211.9 | 270 | 4481 | 10,540 | 32,205 | 0.076 | CPU-only |
| OpenAI (Cloud) | gpt-4o-mini | API (Cloud) | 128K | 3,820.11 | 316.41 | 4136.52 | 7,760 | 23,535 | 0.108 | N/A |

> **Notes:**
>
> - All metrics use the same Documentation generation workflow. Token counts may vary slightly per run due to non-deterministic model output.
> - vLLM on Apple Silicon uses Metal (MPS) GPU acceleration.
> - [Intel OPEA Enterprise Inference](https://github.com/opea-project/Enterprise-Inference) runs on Intel Xeon CPUs without GPU acceleration.

---

## Model Capabilities

### Qwen3-4B-Instruct-2507

A 4-billion-parameter open-weight code model from Alibaba's Qwen team (July 2025 release), designed for on-prem and edge deployment.


| Attribute                   | Details                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Parameters**              | 4.0B total (3.6B non-embedding)                                                                                     |
| **Architecture**            | Transformer with Grouped Query Attention (GQA) — 36 layers, 32 Q-heads / 8 KV-heads                                 |
| **Context Window**          | 262,144 tokens (256K) native                                                                                        |
| **Reasoning Mode**          | Non-thinking only (Instruct-2507 variant). Separate Thinking-2507 variant available with always-on chain-of-thought |
| **Tool / Function Calling** | Supported; MCP (Model Context Protocol) compatible                                                                  |
| **Structured Output**       | JSON-structured responses supported                                                                                 |
| **Multilingual**            | 100+ languages and dialects                                                                                         |
| **Code Benchmarks**         | MultiPL-E: 76.8%, LiveCodeBench v6: 35.1%, BFCL-v3 (tool use): 61.9                                                 |
| **Quantization Formats**    | GGUF (Q4_K_M ~2.5 GB, Q8_0 ~4.3 GB), AWQ (int4), GPTQ (int4), MLX (4-bit ~2.3 GB)                                   |
| **Inference Runtimes**      | Ollama, vLLM, llama.cpp, LMStudio, SGLang, KTransformers                                                            |
| **Fine-Tuning**             | Full fine-tuning and adapter-based (LoRA); 5,000+ community adapters on HuggingFace                                 |
| **License**                 | Apache 2.0                                                                                                          |
| **Deployment**              | Local, on-prem, air-gapped, cloud — full data sovereignty                                                           |


### GPT-4o-mini

OpenAI's cost-efficient multimodal model, accessible exclusively via cloud API.


| Attribute                   | Details                                                                           |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Parameters**              | Not publicly disclosed                                                            |
| **Architecture**            | Multimodal Transformer (text + image input, text output)                          |
| **Context Window**          | 128,000 tokens input / 16,384 tokens max output                                   |
| **Reasoning Mode**          | Standard inference (no explicit chain-of-thought toggle)                          |
| **Tool / Function Calling** | Supported; parallel function calling                                              |
| **Structured Output**       | JSON mode and strict JSON schema adherence supported                              |
| **Multilingual**            | Broad multilingual support                                                        |
| **Code Benchmarks**         | MMMLU: ~87%, strong HumanEval and MBPP scores                                     |
| **Pricing**                 | $0.15 / 1M input tokens, $0.60 / 1M output tokens (Batch API: 50% discount)       |
| **Fine-Tuning**             | Supervised fine-tuning via OpenAI API                                             |
| **License**                 | Proprietary (OpenAI Terms of Use)                                                 |
| **Deployment**              | Cloud-only — OpenAI API or Azure OpenAI Service. No self-hosted or on-prem option |
| **Knowledge Cutoff**        | October 2023                                                                      |


### Comparison Summary


| Capability                      | Qwen3-4B-Instruct-2507           | GPT-4o-mini                       |
| ------------------------------- | -------------------------------- | --------------------------------- |
| Code Analysis & Documentation Generation | Yes                     | Yes                               |
| Multi-agent / agentic task execution |  Yes                        | Yes                               |
| Mermaid / architecture diagram Generation | Yes               | Yes                                    |
| Function / tool calling         | Yes                              | Yes                               |
| JSON structured output          | Yes                              | Yes                               |
| On-prem / air-gapped deployment | Yes                              | No                                |
| Data sovereignty                | Full (weights run locally)       | No (data sent to cloud API)       |
| Open weights                    | Yes (Apache 2.0)                 | No (proprietary)                  |
| Custom fine-tuning              | Full fine-tuning + LoRA adapters | Supervised fine-tuning (API only) |
| Quantization for edge devices   | GGUF / AWQ / GPTQ / MLX          | N/A                               |
| Multimodal (image input)        | No                               | Yes                               |
| Native context window           | 256K                             | 128K                              |


> Both models support Code Analysis & Documentation Generation, Multi-agent / agentic task execution, Mermaid diagram generation, function calling, and JSON-structured output. However, only Qwen3-4B offers open weights, data sovereignty, and local deployment flexibility — making it suitable for air-gapped, regulated, or cost-sensitive environments. GPT-4o-mini offers lower latency and higher throughput via OpenAI's cloud infrastructure, with added multimodal capabilities.

---

## Environment Variables

Configure the application behavior using environment variables in `api/.env`:

### Core LLM Configuration

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `LLM_PROVIDER` | LLM provider name (openai, groq, ollama, openrouter, custom) | `openai` | string |
| `LLM_API_KEY` | API key for the provider (empty for Ollama) | - | string |
| `LLM_BASE_URL` | Base URL for the LLM API | `https://api.openai.com/v1` | string |
| `LLM_MODEL` | Model name to use | `gpt-4o` | string |

### Generation Parameters

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `TEMPERATURE` | Model creativity level (0.0–1.0, lower = deterministic) | `0.7` | float |
| `MAX_TOKENS` | Maximum tokens per response | `1000` | integer |
| `MAX_RETRIES` | Number of retry attempts for API failures | `3` | integer |
| `REQUEST_TIMEOUT` | Request timeout in seconds | `300` | integer |

### Repository Analysis

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `TEMP_REPO_DIR` | Temporary directory for cloned repositories | `./tmp/repos` | string |
| `MAX_REPO_SIZE` | Maximum repository size in bytes | `10737418240` (10GB) | integer |
| `MAX_FILE_SIZE` | Maximum file size to analyze | `1000000` (1MB) | integer |
| `MAX_FILES_TO_SCAN` | Maximum files to analyze | `500` | integer |

### GitHub Integration

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `GITHUB_TOKEN` | Personal access token for PR creation | - | string |

### Server Configuration

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `API_PORT` | Backend service port | `5001` | integer |
| `HOST` | Server host binding | `0.0.0.0` | string |
| `CORS_ORIGINS` | Allowed CORS origins | `["http://localhost:3000"]` | list |

**Example .env file** is available at `api/.env.example` in the repository.

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python web framework with async support)
- **Workflow Orchestration**: LangGraph with memory checkpointing
- **AI Framework**: LangChain for agent tools and abstractions
- **LLM Providers**:
  - OpenAI GPT-4o (text generation)
  - Groq Llama (fast inference)
  - Ollama (local deployment)
  - OpenRouter (multi-model access)
  - Custom OpenAI-compatible APIs
- **Multi-Agent System**:
  - 9 specialized micro-agents
  - Evidence-based generation
  - Quality validation with guardrails
  - Semantic Mermaid diagram validation
- **Git Operations**: GitPython for repository management
- **GitHub Integration**: MCP (Model Context Protocol) for PR creation
- **Code Analysis**: AST parsing with astroid
- **Async Server**: Uvicorn (ASGI)
- **Config Management**: Pydantic Settings with python-dotenv

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast bundler)
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: Custom design system with Lucide React icons
- **State Management**: React hooks (useState, useEffect)
- **API Communication**:
  - Axios for REST calls
  - Fetch API for Server-Sent Events (SSE)
- **Markdown Rendering**: react-markdown with syntax highlighting

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Frontend Server**: Nginx (unprivileged)
- **Health Checks**: Docker health monitoring
- **Networking**: Docker bridge network

---

## Troubleshooting

For comprehensive troubleshooting guidance, common issues, and solutions, refer to:

[Troubleshooting Guide - TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Quick Debug

**Check service health:**
```bash
curl http://localhost:5001/health
docker compose ps
```

**View logs:**
```bash
docker compose logs api --tail 50
docker compose logs ui --tail 50
```

**Enable debug mode:**
```bash
# Update api/.env
LOG_LEVEL=DEBUG

# Restart backend
docker compose restart api
```

---

## License

This project is licensed under the terms specified in [LICENSE.md](./LICENSE.md) file.

---

## Disclaimer

**DocuBot** is provided as-is for documentation generation purposes. While we strive for accuracy:

- Always review AI-generated documentation before publication
- Verify technical details and implementation specifics
- Do not rely solely on AI for critical documentation
- Test thoroughly before using in production environments
- Consult subject matter experts for domain-specific accuracy

For full disclaimer details, see [DISCLAIMER.md](./DISCLAIMER.md)

---
