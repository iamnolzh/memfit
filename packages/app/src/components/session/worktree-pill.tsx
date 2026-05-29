import { Show, createMemo } from "solid-js"
import { useSync } from "@/context/sync"
import { Icon } from "@opencode-ai/ui/icon"
import { getFilename } from "@opencode-ai/util/path"
import { Select } from "@opencode-ai/ui/select"

const MAIN_WORKTREE = "main"
const CREATE_WORKTREE = "create"

export interface WorktreePillProps {
  worktree: string
  onWorktreeChange: (value: string) => void
}

export function WorktreePill(props: WorktreePillProps) {
  const sync = useSync()

  const sandboxes = createMemo(() => sync.project?.sandboxes ?? [])
  const options = createMemo(() => [MAIN_WORKTREE, ...sandboxes(), CREATE_WORKTREE])
  const current = createMemo(() => {
    const selection = props.worktree
    if (options().includes(selection)) return selection
    return MAIN_WORKTREE
  })
  const projectRoot = createMemo(() => sync.project?.worktree ?? sync.data.path.directory)
  const isWorktree = createMemo(() => {
    const project = sync.project
    if (!project) return false
    return sync.data.path.directory !== project.worktree
  })

  const label = (value: string) => {
    if (value === MAIN_WORKTREE) {
      if (isWorktree()) return getFilename(projectRoot())
      const branch = sync.data.vcs?.branch
      if (branch) return `${getFilename(projectRoot())} (${branch})`
      return getFilename(projectRoot())
    }

    if (value === CREATE_WORKTREE) return "Create new worktree"

    return getFilename(value)
  }

  return (
    <div class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-raised-strong border border-border-weak-base text-text-weak hover:text-text-strong transition-colors cursor-pointer text-11-medium">
      <Icon name="folder" size="small" class="text-text-weak" />
      <Select
        options={options()}
        current={current()}
        value={(x) => x}
        label={label}
        onSelect={(value) => {
          props.onWorktreeChange(value ?? MAIN_WORKTREE)
        }}
        size="normal"
        variant="ghost"
        class="text-11-medium font-medium p-0"
      />
    </div>
  )
}
