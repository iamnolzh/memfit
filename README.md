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

Windows 用户也可以用 [Scoop](https://scoop.sh) 或 [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) 安装（如已发布）：

```powershell
# Scoop
scoop install memfit

# winget
winget install memfit
```

## 配置

全局配置文件位置：

| 系统 | 路径 |
|------|------|
| macOS / Linux | `~/.config/memfit/config.json` |
| Windows | `C:\Users\<用户名>\.config\memfit\config.json` |

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

项目级配置放在项目根目录的 `.memfit/` 目录下（所有平台通用）：

```
.memfit/
├── memfit.jsonc      # 项目配置
├── agent/*.md        # 自定义 Agent
├── command/*.md      # 自定义命令
├── skill/*/SKILL.md  # 技能包
├── themes/*.json     # 自定义主题
└── tool/*.ts         # 自定义工具
```

**Windows 用户注意**：如果杀毒软件（如 360、火绒、卡巴斯基等）导致桌面应用启动崩溃（`Segmentation fault`），请将 MemFit 安装目录加入杀毒白名单：
- 路径：`C:\Users\<用户名>\AppData\Local\MemFit\`（安装目录）和 `C:\Users\<用户名>\.config\memfit\`（配置目录）

### 自定义 Agent

```markdown
<!-- .memfit/agent/reviewer.md -->
---
description: 代码审查专家
model: anthropic/claude-sonnet-4-20250514
mode: subagent
---

你是一个严格的代码审查员，重点关注安全漏洞和性能问题。
```

### 自定义命令

```markdown
<!-- .memfit/command/test.md -->
---
description: 运行测试套件
---

运行项目测试套件，分析失败原因并修复。
```

### 自定义工具

```ts
// .memfit/tool/my-tool.ts
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "我的工具",
  args: { input: tool.schema.string() },
  async execute(args) {
    return `结果: ${args.input}`
  },
})
```

### Skill（技能包）

Skill 是给 Agent 加载专业指令集的机制。Agent 可以通过 `skill` 工具按需加载。

在 `.memfit/skill/` 下创建目录，每个目录放一个 `SKILL.md`：

```
.memfit/skill/
├── code-review/SKILL.md
├── pentest/SKILL.md
└── frontend/SKILL.md
```

SKILL.md 格式：

```markdown
---
name: code-review
description: Use when reviewing pull requests for security and quality
---

## 代码审查流程

1. 检查 SQL 注入、XSS、CSRF 等安全漏洞
2. 检查 N+1 查询和性能问题
3. 检查错误处理是否完整
4. 检查是否有未处理的 edge case

## 输出格式

按严重程度排序：
- **Critical**: 必须修复才能合并
- **Warning**: 建议修复
- **Info**: 改进建议
```

Agent 在对话中说 "用 code-review skill 审查这个 PR" 即可触发加载。

Skill 也可以放在全局目录 `~/.memfit/skill/`（macOS/Linux）或 `C:\Users\<用户名>\.memfit\skill\`（Windows），所有项目共享。

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
