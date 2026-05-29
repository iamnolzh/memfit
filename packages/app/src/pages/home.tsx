import { useGlobalSync } from "@/context/global-sync"
import { createMemo, For, Match, Show, Switch } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useLayout } from "@/context/layout"
import { useNavigate } from "@solidjs/router"
import { base64Encode } from "@opencode-ai/util/encode"
import { Icon } from "@opencode-ai/ui/icon"
import { usePlatform } from "@/context/platform"
import { DateTime } from "luxon"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { DialogSelectDirectory } from "@/components/dialog-select-directory"
import { useServer } from "@/context/server"

export default function Home() {
  const sync = useGlobalSync()
  const layout = useLayout()
  const platform = usePlatform()
  const dialog = useDialog()
  const navigate = useNavigate()
  const server = useServer()
  const homedir = createMemo(() => sync.data.path.home)

  function openProject(directory: string) {
    layout.projects.open(directory)
    navigate(`/${base64Encode(directory)}`)
  }

  async function chooseProject() {
    function resolve(result: string | string[] | null) {
      if (Array.isArray(result)) {
        for (const directory of result) {
          openProject(directory)
        }
      } else if (result) {
        openProject(result)
      }
    }

    if (platform.openDirectoryPickerDialog && server.isLocal()) {
      const result = await platform.openDirectoryPickerDialog?.({
        title: "Open project",
        multiple: true,
      })
      resolve(result)
    } else {
      dialog.show(
        () => <DialogSelectDirectory multiple={true} onSelect={resolve} />,
        () => resolve(null),
      )
    }
  }

  return (
    <div class="relative w-full min-h-screen bg-background-base text-text-base overflow-y-auto px-8 py-12 md:px-12 flex flex-col">
      {/* 霓虹背景发光 (Ambient Glow) */}
      <div 
        class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none filter blur-[120px] opacity-10 dark:opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #FF416C 0%, #FF4B2B 100%)"
        }}
      />

      {/* 顶部欢迎面板 */}
      <div class="flex flex-col gap-1 border-b border-border-weak-base pb-6 shrink-0 relative z-10">
          <h1 class="text-24-bold text-text-strong tracking-tight">欢迎使用 MemFit</h1>
          <p class="text-14-regular text-text-weak">智能驱动的开发工作台</p>
      </div>

      {/* 两栏仪表盘 */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 w-full relative z-10 flex-1 min-h-0">
          {/* 左侧 2 栏：最近项目 */}
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div class="flex justify-between items-center pr-2">
            <h2 class="text-16-bold text-text-strong">最近项目</h2>
            <Button 
              icon="folder-add-left" 
              size="normal" 
              class="px-3 rounded-lg border border-border-weak-base hover:bg-surface-raised-base-hover" 
              onClick={chooseProject}
            >
              Open project
            </Button>
          </div>

          <Switch>
            <Match when={sync.data.project.length > 0}>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <For
                  each={sync.data.project
                    .toSorted((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))
                    .slice(0, 6)}
                >
                  {(project) => {
                    const projectName = project.worktree.split("/").pop() || "Project"
                    const relativePath = project.worktree.replace(homedir(), "~")
                    return (
                      <div
                        class="group cursor-pointer flex flex-col justify-between p-4 rounded-xl border border-border-weak-base bg-surface-raised-strong hover:border-icon-critical-base/50 hover:shadow-md transition-all duration-200"
                        onClick={() => openProject(project.worktree)}
                      >
                        <div class="flex items-center gap-3 mb-4">
                          {/* 渐变文件夹包 */}
                          <div 
                            class="size-8 rounded-lg flex items-center justify-center filter brightness-100 group-hover:brightness-110 transition-all"
                            style={{
                              background: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)"
                            }}
                          >
                            <Icon name="folder" size="normal" class="text-white fill-current" />
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="text-14-bold text-text-strong truncate group-hover:text-icon-critical-base transition-colors">
                              {projectName}
                            </div>
                            <div class="text-12-mono text-text-weak truncate mt-0.5" title={project.worktree}>
                              {relativePath}
                            </div>
                          </div>
                        </div>
                        <div class="flex justify-between items-center text-12-regular text-text-weaker mt-2 pt-2 border-t border-border-weak-base/50">
                          <span>工作区</span>
                          <span>
                            {DateTime.fromMillis(project.time.updated ?? project.time.created).toRelative()}
                          </span>
                        </div>
                      </div>
                    )
                  }}
                </For>
              </div>
            </Match>
            <Match when={true}>
              <div class="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border-weak-base bg-surface-raised-strong/50 min-h-[300px] mt-2">
                <Icon name="folder-add-left" size="large" class="text-text-weaker mb-4" />
                <div class="text-14-medium text-text-strong">暂无最近项目</div>
                <p class="text-12-regular text-text-weak mt-1 text-center max-w-[280px]">
                  Get started by opening a local workspace or cloning a repository.
                </p>
                <Button class="mt-5 px-4 rounded-lg bg-surface-interactive-base text-white" onClick={chooseProject}>
                  Open Project
                </Button>
              </div>
            </Match>
          </Switch>
        </div>

        {/* 右侧 1 栏：Quick Panel */}
        <div class="flex flex-col gap-6">
          {/* Models Box */}
          <div class="p-5 rounded-xl border border-border-weak-base bg-surface-raised-strong flex flex-col gap-4">
            <h3 class="text-14-bold text-text-strong flex items-center gap-2">
              <Icon name="brain" size="normal" class="text-icon-critical-base" />
              Supported Models
            </h3>
            <p class="text-12-regular text-text-weak">
              MemFit is compatible with cutting-edge frontier LLMs. Configure API keys to start using them:
            </p>
            <div class="flex flex-wrap gap-2 mt-2">
              {["Claude", "GPT", "Gemini", "DeepSeek", "Llama"].map((model) => (
                <span class="px-2.5 py-1 text-12-medium text-text-strong rounded-full bg-background-base border border-border-weak-base shadow-xs">
                  {model}
                </span>
              ))}
            </div>
          </div>



            {/* 关于 */}
          <div class="p-5 rounded-xl border border-border-weak-base bg-surface-raised-strong flex flex-col gap-3">
            <div class="text-12-bold text-icon-critical-base uppercase tracking-wider">关于 MemFit</div>
            <p class="text-12-regular text-text-weak leading-relaxed">
              MemFit is an advanced agentic development assistant built directly for the modern developer workspace. Using state-of-the-art AI agents to plan, execute, and verify code directly on your local system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
