# MemFit

MemFit is an AI-powered coding agent that lives in your terminal. It combines a rich terminal interface with deep code understanding, multi-agent orchestration, and broad provider support to help you write, debug, refactor, and explore codebases efficiently.

## Features

### Rich Terminal UI

A fully themed, responsive terminal interface built on SolidJS and OpenTUI. Includes a session sidebar with live MCP status, file diffs, todo checklist, cost tracking, and context window usage.

- **31 built-in themes** -- Catppuccin, Dracula, Gruvbox, Nord, Tokyo Night, Rose Pine, Solarized, and more. Live-preview theme switcher.
- **Prompt autocomplete** -- fuzzy file search, command completion, frecency ranking, `#line-range` syntax for referencing specific file lines.
- **Prompt history & stash** -- recall previous prompts or save drafts for later.

### 20+ AI Providers

Bring your own API key. MemFit bundles first-party SDKs for:

| Provider | Provider | Provider |
|----------|----------|----------|
| Anthropic | OpenAI | Google Gemini |
| Azure OpenAI | AWS Bedrock | Google Vertex AI |
| xAI (Grok) | Mistral | Groq |
| DeepInfra | Cerebras | Cohere |
| Together AI | Perplexity | OpenRouter |
| GitHub Copilot | Vercel | Any OpenAI-compatible endpoint |

Auto-detects credentials from environment variables. Switch providers and models on the fly.

### Multi-Agent Architecture

- **Build** -- primary coding agent with full read/write/edit permissions.
- **Plan** -- read-only planning agent that writes structured implementation plans.
- **General** -- parallel subagent for multi-step task execution.
- **Explore** -- fast, read-only codebase explorer.
- **Custom agents** -- define your own agents with custom prompts, models, permissions, and tool access via config.

Agents can spawn subagents to delegate work in parallel child sessions.

### LSP Integration (36 Language Servers)

Deep code understanding through the Language Server Protocol. Supports TypeScript, Python, Go, Rust, Java, Kotlin, C/C++, C#, Ruby, Elixir, Swift, PHP, Lua, Zig, Haskell, OCaml, and 20+ more languages out of the box.

9 LSP operations: go to definition, find references, hover, document/workspace symbols, go to implementation, call hierarchy (prepare, incoming, outgoing).

### Built-in Tools

| Tool | Description |
|------|-------------|
| `bash` | Execute shell commands |
| `read` | Read files with line-range support |
| `write` | Create or overwrite files |
| `edit` | Targeted string-replace edits with context matching |
| `multiedit` | Apply multiple edits to a single file atomically |
| `patch` | Apply unified diff patches across multiple files |
| `grep` | Regex content search across files |
| `glob` | File pattern matching |
| `list` | Directory listing |
| `lsp` | 9 LSP operations for deep code understanding |
| `websearch` | Web search |
| `webfetch` | Fetch URLs and convert to markdown/text/html |
| `codesearch` | API and library documentation search |
| `todowrite` | Task checklist management (visible in sidebar) |
| `task` | Spawn parallel subagent sessions |
| `batch` | Execute up to 10 tools in parallel |
| `skill` | Load specialized instruction sets |

### MCP (Model Context Protocol)

Connect to external tool servers via MCP. Supports local (stdio), remote (SSE), and streamable HTTP transports. Built-in OAuth authentication flow for remote MCP servers. Live connection status displayed in the session sidebar.

### Multi-Session

- Run multiple parallel agent sessions simultaneously.
- Fork from any point in conversation history.
- Rename, search, and organize sessions.
- Parent/child session linking via subagent spawning.

### Permission System

Granular per-tool and per-file-pattern permissions. Each agent has its own permission ruleset. Sensible defaults with configurable allow/deny/ask rules.

### Desktop App

A native GUI application built with Tauri v2, bundling the CLI as a sidecar process. Available for macOS, Windows, and Linux.

## Installation

### CLI

```bash
# macOS (Apple Silicon)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-darwin-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# macOS (Intel)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-darwin-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux (x64)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-linux-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux (ARM64)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-linux-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit
```

### Desktop App

Download from [GitHub Releases](https://github.com/iamnolzh/memfit/releases):

| Platform | Architecture | Format |
|----------|-------------|--------|
| macOS | Apple Silicon | `.dmg` |
| macOS | Intel | `.dmg` |
| Windows | x64 | `.msi` / `.exe` |
| Linux | x64 | `.AppImage` / `.deb` |
| Linux | ARM64 | `.AppImage` / `.deb` |

### Platform Support

| Platform | Architecture | CLI | Desktop |
|----------|-------------|-----|---------|
| macOS | ARM64 | Yes | Yes |
| macOS | x64 | Yes | Yes |
| Linux | x64 (glibc) | Yes | Yes |
| Linux | ARM64 (glibc) | Yes | Yes |
| Linux | x64 (musl) | Yes | -- |
| Linux | ARM64 (musl) | Yes | -- |
| Windows | x64 | Yes | Yes |

## Development

MemFit is a monorepo managed with Bun workspaces and Turbo.

```bash
# Install dependencies
bun install

# Run the CLI
bun run --cwd packages/opencode dev

# Start the Desktop App (Tauri)
bun run --cwd packages/desktop tauri dev
```

### Prerequisites

- [Bun](https://bun.sh) 1.3+
- [Rust toolchain](https://rustup.rs) (for desktop app)
- Platform-specific Tauri dependencies (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Language | TypeScript (ESM), Rust (desktop backend) |
| Terminal UI | SolidJS + OpenTUI |
| Desktop | Tauri v2 (Rust + WebKit) |
| HTTP Server | Hono (REST + WebSocket) |
| AI SDK | Vercel AI SDK + 18 provider SDKs |
| Code Parsing | tree-sitter |
| Build | Turbo, GitHub Actions |

## License

MIT
