# Contributing to DocuBot

Thanks for your interest in contributing to DocuBot.

DocuBot is an open-source AI-powered documentation generator built with a FastAPI backend, a React frontend, and a multi-agent LangGraph workflow. It uses specialized micro-agents to analyze codebases and generate comprehensive README documentation. We welcome improvements across the codebase, documentation, bug reports, design feedback, and workflow enhancements.

Before you start, read the relevant section below. It helps keep contributions focused, reviewable, and aligned with the current project setup.

---

## Quick Setup Checklist

Before you dive in, make sure you have these installed:

\`\`\`bash
# Check Python (3.11+ recommended)
python --version

# Check Node.js (18+ recommended)
node --version

# Check npm
npm --version

# Check Docker
docker --version
docker compose version

# Check Git
git --version
\`\`\`

New to contributing?

1. Open an issue or pick an existing one to work on.
2. Sync your branch from \`dev\`.
3. Follow the local setup guide below.
4. Run the app locally and verify your change before opening a PR.

## Table of Contents

- [How do I...?](#how-do-i)
  - [Get help or ask a question?](#get-help-or-ask-a-question)
  - [Report a bug?](#report-a-bug)
  - [Suggest a new feature?](#suggest-a-new-feature)
  - [Set up DocuBot locally?](#set-up-docubot-locally)
  - [Start contributing code?](#start-contributing-code)
  - [Improve the documentation?](#improve-the-documentation)
  - [Submit a pull request?](#submit-a-pull-request)
- [Code guidelines](#code-guidelines)
- [Pull request checklist](#pull-request-checklist)
- [Branching model](#branching-model)
- [Thank you](#thank-you)

---

## How do I...

### Get help or ask a question?

- Start with the main project docs in [\`README.md\`](./README.md), [\`api/.env.example\`](./api/.env.example), and the inline documentation in agent files.
- If something is unclear, open a GitHub issue with your question and the context you already checked.

### Report a bug?

1. Search existing issues first.
2. If the bug is new, open a GitHub issue.
3. Include your environment, what happened, what you expected, and exact steps to reproduce.
4. Add screenshots, logs, request details, or response payloads if relevant.

### Suggest a new feature?

1. Open a GitHub issue describing the feature.
2. Explain the problem, who it helps, and how it fits DocuBot.
3. If the change is large, get alignment in the issue before writing code.

### Set up DocuBot locally?

#### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git
- Docker with Docker Compose v2
- One LLM provider:
  - An OpenAI-compatible API key (OpenAI, Groq, OpenRouter), or
  - Enterprise inference endpoint (GenAI Gateway, APISIX), or
  - Ollama installed locally on the host machine

#### Option 1: Local Development

##### Step 1: Clone the repository

\`\`\`bash
git clone https://github.com/your-org/DocuBot.git
cd DocuBot
\`\`\`

##### Step 2: Configure environment variables

Create an \`.env\` file in the \`api/\` directory from the example:

\`\`\`bash
cp api/.env.example api/.env
\`\`\`

At minimum, configure your LLM provider. Example for OpenAI:

\`\`\`env
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
\`\`\`

Example for local Ollama:

\`\`\`env
LLM_PROVIDER=ollama
LLM_API_KEY=not-needed
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen3:4b
\`\`\`

##### Step 3: Install backend dependencies

\`\`\`bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
\`\`\`

##### Step 4: Install frontend dependencies

\`\`\`bash
cd ui
npm install
cd ..
\`\`\`

##### Step 5: Start the backend

\`\`\`bash
cd api
source .venv/bin/activate
python server.py
\`\`\`

The backend runs at \`http://localhost:5001\`.

##### Step 6: Start the frontend

Open a second terminal:

\`\`\`bash
cd ui
npm run dev
\`\`\`

The Vite dev server runs at \`http://localhost:3000\`.

##### Step 7: Access the application

- Frontend: \`http://localhost:3000\`
- Backend health check: \`http://localhost:5001/health\`
- API docs: \`http://localhost:5001/docs\`

#### Option 2: Docker

From the repository root:

\`\`\`bash
cp api/.env.example api/.env
# Edit api/.env with your LLM provider settings
docker compose up --build
\`\`\`

This starts:

- Frontend on \`http://localhost:3000\`
- Backend on \`http://localhost:5001\`

#### Common Troubleshooting

- If ports \`3000\`, \`5001\`, or \`5173\` are already in use, stop the conflicting process before starting DocuBot.
- If LLM requests fail, confirm your \`.env\` values are correct for the selected provider.
- If you use Ollama with Docker, make sure Ollama is running on the host and reachable from the container.
- If Docker fails to build, rebuild with \`docker compose up --build\`.
- If Python packages fail to install, confirm you are using a supported Python version (3.11+).

### Start contributing code?

1. Open or choose an issue.
2. Create a feature branch from \`dev\`.
3. Keep the change focused on a single problem.
4. Run the app locally and verify the affected workflow.
5. Update docs when behavior, setup, configuration, or architecture changes.
6. Open a pull request back from your feature branch into \`dev\`.

### Improve the documentation?

Documentation updates are welcome. Relevant files currently live in:

- [\`README.md\`](./README.md)
- [\`api/.env.example\`](./api/.env.example)
- Agent docstrings in [\`api/agents/\`](./api/agents/)
- Configuration in [\`api/config.py\`](./api/config.py)

### Submit a pull request?

Follow the checklist below before opening your PR. Your pull request should:

- Stay focused on one issue or topic.
- Explain what changed and why.
- Include manual verification steps.
- Include screenshots or short recordings for UI changes.
- Reference the related GitHub issue when applicable.

Note: pull requests should target the \`dev\` branch.

---

## Code guidelines

- Follow the existing project structure and patterns before introducing new abstractions.
- Keep frontend changes consistent with the React + Vite + Tailwind setup already in use.
- Keep backend changes consistent with the FastAPI + LangGraph agent structure in [\`api\`](./api).
- Avoid unrelated refactors in the same pull request.
- Do not commit secrets, API keys, cloned repositories (tmp/repos), local \`.env\` files, or generated artifacts.
- Prefer clear, small commits and descriptive pull request summaries.
- Update documentation when contributor setup, behavior, environment variables, or agent prompts change.

---

## Pull request checklist

Before submitting your pull request, confirm the following:

- You tested the affected flow locally.
- The application still starts successfully in the environment you changed.
- You removed debug code, stray logs, and commented-out experiments.
- You documented any new setup steps, environment variables, or behavior changes.
- You kept the pull request scoped to one issue or topic.
- You added screenshots for UI changes when relevant.
- You did not commit secrets, API keys, or cloned test repositories (tmp/repos folder).
- You are opening the pull request against \`dev\`.

If one or more of these are missing, the pull request may be sent back for changes before review.

---

## Branching model

- Base new work from \`dev\`.
- Open pull requests against \`dev\`.
- Use descriptive branch names such as \`fix/mermaid-diagram-validation\` or \`docs/update-contributing-guide\`.
- Rebase or merge the latest \`dev\` before opening your PR if your branch has drifted.

---

## Thank you

Thanks for contributing to DocuBot. Whether you're fixing a bug, improving the docs, adding a new agent, or refining the workflow, your work helps make the project more useful and easier to maintain.
