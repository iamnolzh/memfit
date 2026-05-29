# MemFit

MemFit is a powerful, AI-driven coding agent designed natively for the terminal. It provides an intuitive TUI (Terminal User Interface) and advanced capabilities to help developers write, debug, and refactor code efficiently.

## Features

- **Native TUI**: A responsive, themeable terminal interface that feels right at home in your workspace.
- **LSP Enabled**: Automatically loads and utilizes the appropriate Language Server Protocol (LSP) for deep code understanding.
- **Multi-session Support**: Start and manage multiple parallel agents working on different aspects of your project.
- **Cross-Platform**: Available on macOS, Windows, and Linux.

## Installation

### Desktop App

Download the latest GUI application from the [GitHub Releases](https://github.com/iamnolzh/memfit/releases) page:

| Platform | File Format |
|----------|-------------|
| macOS (Apple Silicon) | `.dmg` |
| macOS (Intel) | `.dmg` |
| Windows (x64) | `.exe` / `.msi` |
| Linux (x64 / ARM64) | `.AppImage` / `.deb` |

### CLI Installation

To install the MemFit command-line tool directly:

#### macOS / Linux
You can download the binaries directly from the latest release:

```bash
# macOS (Apple Silicon)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/opencode-darwin-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# macOS (Intel)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/opencode-darwin-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux (x64)
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/opencode-linux-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit
```

*(Note: The actual binary name may vary based on the release build artifacts. Adjust the URL based on the latest release assets).*

## Development

MemFit is a monorepo containing both the CLI and a Tauri-based Desktop wrapper.

To run the development environment:

```bash
# Install dependencies
bun install

# Start the Desktop App (Tauri)
bun run --cwd packages/desktop tauri dev
```

## License

This project is open-source under the MIT License.
