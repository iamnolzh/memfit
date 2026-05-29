# MemFit

MemFit 是一个运行在终端中的 AI 编程智能体。它集成了丰富的终端界面、深度代码理解、多 Agent 编排和广泛的模型提供商支持，帮助你高效地编写、调试、重构和探索代码。

## 功能特性

### 终端界面（TUI）

基于 SolidJS + OpenTUI 构建的全主题终端界面，侧边栏实时显示 MCP 状态、文件 diff、待办清单、费用统计和上下文窗口用量。

- **31 个内置主题** -- Catppuccin、Dracula、Gruvbox、Nord、Tokyo Night、Rose Pine、Solarized 等，支持实时预览切换
- **输入补全** -- 模糊文件搜索、命令补全、频度排序、`#行号范围` 语法引用特定文件行
- **历史记录 & 草稿箱** -- 回溯之前的输入，或保存草稿稍后使用

### 20+ AI 模型提供商

自带 API Key 即可使用，内置以下提供商的官方 SDK：

| 提供商 | 提供商 | 提供商 |
|--------|--------|--------|
| Anthropic | OpenAI | Google Gemini |
| Azure OpenAI | AWS Bedrock | Google Vertex AI |
| xAI (Grok) | Mistral | Groq |
| DeepInfra | Cerebras | Cohere |
| Together AI | Perplexity | OpenRouter |
| GitHub Copilot | Vercel | 任意 OpenAI 兼容端点 |

自动从环境变量识别凭证，随时切换提供商和模型。

### 多 Agent 架构

- **Build** -- 主编码 Agent，拥有完整的读/写/编辑权限
- **Plan** -- 只读规划 Agent，输出结构化的实施方案
- **General** -- 并行子 Agent，用于多步骤任务执行
- **Explore** -- 快速只读代码探索 Agent
- **自定义 Agent** -- 通过配置文件定义自己的 Agent，支持自定义提示词、模型、权限和工具

Agent 可以派生子 Agent，在并行的子会话中委派工作。

### LSP 集成（36 个语言服务器）

通过 Language Server Protocol 实现深度代码理解。开箱支持 TypeScript、Python、Go、Rust、Java、Kotlin、C/C++、C#、Ruby、Elixir、Swift、PHP、Lua、Zig、Haskell、OCaml 等 20+ 种语言。

支持 9 种 LSP 操作：跳转到定义、查找引用、悬停信息、文档/工作区符号、跳转到实现、调用层次（准备、传入、传出）。

### 内置工具

| 工具 | 说明 |
|------|------|
| `bash` | 执行 Shell 命令 |
| `read` | 读取文件，支持行范围 |
| `write` | 创建或覆盖文件 |
| `edit` | 带上下文匹配的精准字符串替换编辑 |
| `multiedit` | 对单个文件原子性地执行多处编辑 |
| `patch` | 跨多个文件应用 unified diff 补丁 |
| `grep` | 正则表达式内容搜索 |
| `glob` | 文件模式匹配 |
| `list` | 目录列表 |
| `lsp` | 9 种 LSP 操作 |
| `websearch` | 网页搜索 |
| `webfetch` | 获取 URL 内容并转换为 markdown/text/html |
| `codesearch` | API 和库文档搜索 |
| `todowrite` | 任务清单管理（侧边栏可见） |
| `task` | 派生并行子 Agent 会话 |
| `batch` | 并行执行最多 10 个工具 |
| `skill` | 加载专业指令集 |

### MCP（Model Context Protocol）

通过 MCP 连接外部工具服务器。支持本地（stdio）、远程（SSE）和可流式 HTTP 传输。内置 OAuth 认证流程。会话侧边栏实时显示连接状态。

### 多会话

- 同时运行多个并行 Agent 会话
- 从对话历史的任意位置分叉（Fork）
- 重命名、搜索和整理会话
- 通过子 Agent 派生实现父子会话关联

### 权限系统

按工具和文件模式进行细粒度权限控制。每个 Agent 有独立的权限规则集。支持 allow（允许）/ deny（禁止）/ ask（询问）三种模式。

### 桌面应用

基于 Tauri v2 构建的原生 GUI 应用，将 CLI 作为 sidecar 进程打包。支持 macOS、Windows 和 Linux。

---

## 安装

### CLI 命令行工具

```bash
# macOS（Apple Silicon）
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-darwin-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# macOS（Intel）
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-darwin-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux（x64）
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-linux-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux（ARM64）
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-linux-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit
```

安装后在任意项目目录下运行 `memfit` 即可启动。

### 桌面应用

从 [GitHub Releases](https://github.com/iamnolzh/memfit/releases) 下载：

| 平台 | 架构 | 格式 |
|------|------|------|
| macOS | Apple Silicon | `.dmg` |
| macOS | Intel | `.dmg` |
| Windows | x64 | `.msi` / `.exe` |
| Linux | x64 | `.deb` |
| Linux | ARM64 | `.deb` |

### 平台支持

| 平台 | 架构 | CLI | 桌面应用 |
|------|------|-----|----------|
| macOS | ARM64 | 支持 | 支持 |
| macOS | x64 | 支持 | 支持 |
| Linux | x64 (glibc) | 支持 | 支持 |
| Linux | ARM64 (glibc) | 支持 | 支持 |
| Linux | x64 (musl) | 支持 | -- |
| Linux | ARM64 (musl) | 支持 | -- |
| Windows | x64 | 支持 | 支持 |

---

## 配置指南

MemFit 使用 JSONC（支持注释的 JSON）配置文件。多个位置的配置会自动合并，后加载的覆盖先加载的。

### 配置文件位置（优先级：低 → 高）

| 位置 | 说明 |
|------|------|
| `~/.config/memfit/config.json` | 全局用户配置（最低优先级） |
| `opencode.jsonc` 或 `opencode.json` | 项目配置（从当前目录向上搜索到 git 根目录） |
| `.opencode/opencode.jsonc` | 项目目录配置 |
| `~/.opencode/opencode.jsonc` | 用户主目录配置（最高优先级） |

### 运行时目录（XDG 标准）

| 路径 | 用途 |
|------|------|
| `~/.config/memfit/` | 配置文件 |
| `~/.local/share/memfit/` | 数据（LSP 二进制文件、日志、存储） |
| `~/.cache/memfit/` | 缓存（模型注册表、插件 node_modules） |
| `~/.local/state/memfit/` | 状态（输入历史） |

### 全局配置示例

在 `~/.config/memfit/config.json` 中配置：

```jsonc
{
  "$schema": "https://memfit.ai/config.json",

  // 默认模型（格式：provider/model）
  "model": "anthropic/claude-sonnet-4-20250514",
  // 轻量模型（用于标题生成等任务）
  "small_model": "anthropic/claude-haiku-3-5",

  // 插件
  "plugin": ["oh-my-opencode"],

  // 自定义指令（注入到 system prompt）
  "instructions": ["STYLE_GUIDE.md"],

  // AI 模型提供商
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    },
    // 自定义 OpenAI 兼容提供商
    "my-provider": {
      "npm": "@ai-sdk/openai-compatible",
      "models": {
        "my-model": { "name": "我的模型" }
      },
      "options": {
        "apiKey": "{env:MY_API_KEY}",
        "baseURL": "https://my-api.com/v1"
      }
    }
  },

  // MCP 工具服务器
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    },
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    }
  },

  // 权限（ask = 询问用户, allow = 允许, deny = 禁止）
  "permission": {
    "bash": "ask",
    "edit": "ask",
    "read": {
      "*.env": "deny",
      "*.secret": "deny",
      "*": "allow"
    },
    "write": "ask"
  },

  // 主题
  "theme": "catppuccin-mocha",

  // 自动更新：true / false / "notify"（仅通知）
  "autoupdate": "notify"
}
```

### 配置 Agent

#### 方式一：在配置文件中定义

```jsonc
{
  "agent": {
    // 覆盖内置 Agent
    "build": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "steps": 100
    },
    "plan": {
      "permission": {
        "edit": "deny",
        "write": "deny"
      }
    },
    // 自定义 Agent
    "reviewer": {
      "description": "代码审查专家",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "你是一个严格的代码审查员...",
      "mode": "subagent",
      "color": "#FF5733",
      "permission": {
        "read": "allow",
        "bash": { "npm test": "allow", "*": "deny" }
      }
    }
  }
}
```

#### 方式二：用 Markdown 文件定义

在 `.opencode/agent/` 目录下创建 `.md` 文件：

```markdown
<!-- .opencode/agent/reviewer.md -->
---
description: 代码审查专家
model: anthropic/claude-sonnet-4-20250514
mode: subagent
color: "#FF5733"
---

你是一个严格的代码审查员，重点关注：
1. 安全漏洞
2. 性能问题
3. 代码风格违规
```

Agent 可用的 frontmatter 字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `model` | `string` | 使用的模型 |
| `temperature` | `number` | 温度参数 |
| `top_p` | `number` | Top-p 采样 |
| `prompt` | `string` | 系统提示词（或用 markdown 正文） |
| `description` | `string` | Agent 描述（用于自动选择） |
| `mode` | `"primary" \| "subagent" \| "all"` | Agent 类型 |
| `hidden` | `boolean` | 是否在 @ 菜单中隐藏 |
| `color` | `string` | 显示颜色（`#RRGGBB`） |
| `steps` | `number` | 最大迭代次数 |
| `permission` | `object` | 权限规则 |

### 自定义命令（Slash Command）

在 `.opencode/command/` 目录下创建 `.md` 文件：

```markdown
<!-- .opencode/command/test.md -->
---
description: 运行测试套件
model: anthropic/claude-haiku-3-5
---

运行项目测试套件。如果测试失败，分析输出并修复问题。
```

命令可用的 frontmatter 字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `description` | `string` | 命令描述 |
| `agent` | `string` | 指定使用的 Agent |
| `model` | `string` | 指定使用的模型 |
| `subtask` | `boolean` | 是否作为子任务运行 |

### 自定义工具

在 `.opencode/tool/` 目录下创建 `.ts` 文件：

```ts
// .opencode/tool/my-tool.ts
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "我的自定义工具",
  args: {
    input: tool.schema.string().describe("输入内容"),
  },
  async execute(args) {
    return `处理结果: ${args.input}`
  },
})
```

每个工具还可以配一个同名 `.txt` 文件作为详细的使用说明，会提供给 AI 参考。

### 自定义主题

在 `.opencode/themes/` 目录下创建 `.json` 文件：

```jsonc
// .opencode/themes/my-theme.json
{
  "$schema": "https://memfit.ai/theme.json",
  "defs": {
    "bg": "#1a1b26",
    "fg": "#c0caf5",
    "accent": "#7aa2f7"
  },
  "theme": {
    "primary": { "dark": "accent", "light": "accent" },
    "background": { "dark": "bg", "light": "#ffffff" },
    "text": { "dark": "fg", "light": "#000000" },
    "error": { "dark": "#f7768e", "light": "#d32f2f" },
    "success": { "dark": "#9ece6a", "light": "#388e3c" },
    "warning": { "dark": "#e0af68", "light": "#f57c00" }
  }
}
```

### 环境变量替换

在配置值中使用 `{env:变量名}` 引用环境变量：

```jsonc
{
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{env:OPENAI_API_KEY}"
      }
    }
  }
}
```

也支持 `{file:路径}` 引用文件内容：

```jsonc
{
  "instructions": ["{file:./docs/coding-standards.md}"]
}
```

### 项目目录结构

```
.opencode/
├── opencode.jsonc    # 项目配置
├── package.json      # 插件依赖（自动安装）
├── agent/            # Agent 定义（*.md）
├── command/          # 自定义命令（*.md）
├── skill/            # 技能包（*/SKILL.md）
├── themes/           # 自定义主题（*.json）
├── tool/             # 自定义工具（*.ts）
└── plugin/           # 本地插件（*.ts）
```

### 配置字段速查表

| 字段 | 类型 | 说明 |
|------|------|------|
| `model` | `string` | 默认模型（`provider/model` 格式） |
| `small_model` | `string` | 轻量模型（标题生成等） |
| `default_agent` | `string` | 默认 Agent（必须是 primary） |
| `theme` | `string` | 主题名称 |
| `plugin` | `string[]` | npm 插件包名 |
| `instructions` | `string[]` | 注入 system prompt 的 markdown 文件 |
| `provider` | `object` | AI 提供商配置 |
| `mcp` | `object` | MCP 服务器配置 |
| `agent` | `object` | Agent 配置 |
| `permission` | `object` | 工具权限规则 |
| `autoupdate` | `boolean \| "notify"` | 自动更新行为 |
| `share` | `"manual" \| "auto" \| "disabled"` | 会话分享模式 |
| `keybinds` | `object` | 自定义快捷键 |
| `tui` | `object` | TUI 设置（滚动速度、diff 样式） |
| `lsp` | `object` | LSP 服务器覆盖 |
| `compaction` | `object` | 上下文压缩设置 |
| `server` | `object` | 服务器配置（端口、主机名、mDNS） |

### 快捷键

默认快捷键（可通过 `keybinds` 配置覆盖）：

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+X` | Leader 键 |
| `Leader+E` | 打开外部编辑器 |
| `Leader+T` | 切换主题 |
| `Leader+B` | 切换侧边栏 |
| `Leader+N` | 新建会话 |
| `Leader+L` | 会话列表 |
| `Leader+M` | 模型列表 |
| `Leader+A` | Agent 列表 |
| `Leader+C` | 压缩会话上下文 |
| `Leader+G` | 会话时间线 |
| `Ctrl+P` | 命令列表 |
| `Tab` | 切换 Agent |
| `F2` | 切换最近使用的模型 |
| `Page Up/Down` | 翻页 |
| `Ctrl+C` | 退出 |

---

## 插件系统

### 安装插件

在配置文件中添加 `plugin` 字段：

```jsonc
{
  "plugin": ["oh-my-opencode"]
}
```

重启 MemFit 后插件会自动安装和加载。

### MCP 配置

#### 远程 MCP 服务器

```jsonc
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true,
      "timeout": 5000,
      "headers": { "Authorization": "Bearer xxx" },
      "oauth": {
        "clientId": "xxx",
        "scope": "read"
      }
    }
  }
}
```

#### 本地 MCP 服务器

```jsonc
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "environment": { "DEBUG": "1" },
      "enabled": true
    }
  }
}
```

### 权限配置详解

权限支持三种粒度：

**全局级别** -- 对整个工具设置：
```jsonc
{ "permission": { "bash": "allow" } }
```

**模式级别** -- 按文件/命令模式设置：
```jsonc
{
  "permission": {
    "bash": {
      "npm test": "allow",
      "git *": "allow",
      "rm -rf *": "deny",
      "*": "ask"
    },
    "read": {
      "*.env": "deny",
      "*.key": "deny",
      "*": "allow"
    }
  }
}
```

**Agent 级别** -- 每个 Agent 独立权限：
```jsonc
{
  "agent": {
    "plan": {
      "permission": {
        "edit": "deny",
        "write": "deny",
        "bash": "allow"
      }
    }
  }
}
```

---

## 开发

MemFit 是一个使用 Bun workspaces 和 Turbo 管理的 monorepo。

```bash
# 安装依赖
bun install

# 运行 CLI
bun run --cwd packages/opencode dev

# 启动桌面应用（Tauri）
bun run --cwd packages/desktop tauri dev
```

### 环境要求

- [Bun](https://bun.sh) 1.3+
- [Rust 工具链](https://rustup.rs)（桌面应用需要）
- 平台相关的 Tauri 依赖（参见 [Tauri 前置条件](https://v2.tauri.app/start/prerequisites/)）

---

## 技术栈

| 层 | 技术 |
|----|------|
| 运行时 | Bun |
| 语言 | TypeScript (ESM)、Rust（桌面端后端） |
| 终端 UI | SolidJS + OpenTUI |
| 桌面框架 | Tauri v2 (Rust + WebKit) |
| HTTP 服务 | Hono (REST + WebSocket) |
| AI SDK | Vercel AI SDK + 18 个提供商 SDK |
| 代码解析 | tree-sitter |
| 构建 | Turbo、GitHub Actions |

## 许可证

MIT
