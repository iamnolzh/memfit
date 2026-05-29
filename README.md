# MemFit

终端 AI 编程智能体。多 Agent 编排 + 深度代码理解 + 20+ 模型提供商。

## 安装

```bash
# macOS Apple Silicon
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-darwin-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# macOS Intel
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-darwin-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux x64
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-linux-x64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit

# Linux ARM64
curl -L https://github.com/iamnolzh/memfit/releases/latest/download/memfit-linux-arm64 -o /usr/local/bin/memfit && chmod +x /usr/local/bin/memfit
```

桌面应用从 [Releases](https://github.com/iamnolzh/memfit/releases) 下载（macOS `.dmg` / Windows `.msi` / Linux `.deb`）。

## 配置

全局配置：`~/.config/memfit/config.json`

```jsonc
{
  "$schema": "https://memfit.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "plugin": ["oh-my-openagent"],
  "provider": {
    "anthropic": {
      "options": { "apiKey": "{env:ANTHROPIC_API_KEY}" }
    }
  },
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  },
  "permission": {
    "bash": "ask",
    "edit": "ask",
    "read": { "*.env": "deny", "*": "allow" }
  },
  "theme": "catppuccin-mocha"
}
```

项目级配置放在项目根目录的 `.opencode/` 目录下：

```
.opencode/
├── opencode.jsonc    # 项目配置
├── agent/*.md        # 自定义 Agent
├── command/*.md      # 自定义命令
├── skill/*/SKILL.md  # 技能包
├── themes/*.json     # 自定义主题
└── tool/*.ts         # 自定义工具
```

### 自定义 Agent

```markdown
<!-- .opencode/agent/reviewer.md -->
---
description: 代码审查专家
model: anthropic/claude-sonnet-4-20250514
mode: subagent
---

你是一个严格的代码审查员，重点关注安全漏洞和性能问题。
```

### 自定义命令

```markdown
<!-- .opencode/command/test.md -->
---
description: 运行测试套件
---

运行项目测试套件，分析失败原因并修复。
```

### 自定义工具

```ts
// .opencode/tool/my-tool.ts
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "我的工具",
  args: { input: tool.schema.string() },
  async execute(args) {
    return `结果: ${args.input}`
  },
})
```

### 自定义 Provider

支持任意 OpenAI 兼容 API：

```jsonc
{
  "provider": {
    "my-api": {
      "npm": "@ai-sdk/openai-compatible",
      "models": { "my-model": { "name": "我的模型" } },
      "options": {
        "apiKey": "{env:MY_API_KEY}",
        "baseURL": "https://my-api.com/v1"
      }
    }
  }
}
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+X` | Leader 键 |
| `Leader+N` | 新建会话 |
| `Leader+L` | 会话列表 |
| `Leader+M` | 切换模型 |
| `Leader+A` | 切换 Agent |
| `Leader+T` | 切换主题 |
| `Leader+B` | 侧边栏 |
| `Tab` | 快速切换 Agent |
| `Ctrl+P` | 命令面板 |

## 开发

```bash
bun install
bun run --cwd packages/opencode dev          # CLI
bun run --cwd packages/desktop tauri dev     # 桌面应用
```

MIT
