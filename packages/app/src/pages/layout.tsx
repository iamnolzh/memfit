import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  ParentProps,
  Show,
  Switch,
  untrack,
  type JSX,
} from "solid-js"
import { createStore, produce } from "solid-js/store"
import { DateTime } from "luxon"
import { A, useNavigate, useParams } from "@solidjs/router"
import { useLayout, getAvatarColors, LocalProject } from "@/context/layout"
import { useGlobalSync } from "@/context/global-sync"
import { useGlobalSDK } from "@/context/global-sdk"
import { usePlatform } from "@/context/platform"
import { useNotification } from "@/context/notification"
import { usePermission } from "@/context/permission"
import { useProviders } from "@/hooks/use-providers"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useTheme, type ColorScheme } from "@opencode-ai/ui/theme"
import { base64Decode, base64Encode } from "@opencode-ai/util/encode"
import { getFilename } from "@opencode-ai/util/path"
import { Binary } from "@opencode-ai/util/binary"
import { Avatar } from "@opencode-ai/ui/avatar"
import { ResizeHandle } from "@opencode-ai/ui/resize-handle"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Mark } from "@opencode-ai/ui/logo"
import { Spinner } from "@opencode-ai/ui/spinner"
import { Tooltip, TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { Toast, toaster, showToast } from "@opencode-ai/ui/toast"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { DragDropProvider, DragDropSensors, DragOverlay, SortableProvider, closestCenter, createSortable, type DragEvent as DndDragEvent } from "@thisbeyond/solid-dnd"
import { ConstrainDragXAxis } from "@/utils/solid-dnd"
import { useCommand, type CommandOption } from "@/context/command"
import { useServer } from "@/context/server"
import { DialogSelectServer } from "@/components/dialog-select-server"
import { DialogSelectDirectory } from "@/components/dialog-select-directory"
import { DialogEditProject } from "@/components/dialog-edit-project"
import { DialogSelectProvider } from "@/components/dialog-select-provider"
import type { Session } from "@opencode-ai/sdk/v2/client"

export default function Layout(props: ParentProps) {
  const [store, setStore] = createStore({
    lastSession: {} as { [directory: string]: string },
    activeDraggable: undefined as string | undefined,
    mobileProjectsExpanded: {} as Record<string, boolean>,
  })

  const mobileProjects = {
    expanded: (directory: string) => store.mobileProjectsExpanded[directory] ?? true,
    expand: (directory: string) => setStore("mobileProjectsExpanded", directory, true),
    collapse: (directory: string) => setStore("mobileProjectsExpanded", directory, false),
  }

  let scrollContainerRef: HTMLDivElement | undefined
  const xlQuery = window.matchMedia("(min-width: 1280px)")
  const [isLargeViewport, setIsLargeViewport] = createSignal(xlQuery.matches)
  const handleViewportChange = (e: MediaQueryListEvent) => setIsLargeViewport(e.matches)
  xlQuery.addEventListener("change", handleViewportChange)
  onCleanup(() => xlQuery.removeEventListener("change", handleViewportChange))

  const params = useParams()
  const globalSDK = useGlobalSDK()
  const globalSync = useGlobalSync()
  const layout = useLayout()
  const platform = usePlatform()
  const server = useServer()
  const notification = useNotification()
  const permission = usePermission()
  const navigate = useNavigate()
  const providers = useProviders()
  const dialog = useDialog()
  const command = useCommand()
  const theme = useTheme()
  const availableThemeEntries = createMemo(() => Object.entries(theme.themes()))
  const colorSchemeOrder: ColorScheme[] = ["system", "light", "dark"]
  const colorSchemeLabel: Record<ColorScheme, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  }

  function cycleTheme(direction = 1) {
    const ids = availableThemeEntries().map(([id]) => id)
    if (ids.length === 0) return
    const currentIndex = ids.indexOf(theme.themeId())
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + ids.length) % ids.length
    const nextThemeId = ids[nextIndex]
    theme.setTheme(nextThemeId)
    const nextTheme = theme.themes()[nextThemeId]
    showToast({
      title: "Theme switched",
      description: nextTheme?.name ?? nextThemeId,
    })
  }

  function cycleColorScheme(direction = 1) {
    const current = theme.colorScheme()
    const currentIndex = colorSchemeOrder.indexOf(current)
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + direction + colorSchemeOrder.length) % colorSchemeOrder.length
    const next = colorSchemeOrder[nextIndex]
    theme.setColorScheme(next)
    showToast({
      title: "Color scheme",
      description: colorSchemeLabel[next],
    })
  }

  onMount(() => {
    if (!platform.checkUpdate || !platform.update || !platform.restart) return

    let toastId: number | undefined

    async function pollUpdate() {
      const { updateAvailable, version } = await platform.checkUpdate!()
      if (updateAvailable && toastId === undefined) {
        toastId = showToast({
          persistent: true,
          icon: "download",
          title: "Update available",
          description: `A new version of MemFit (${version}) is now available to install.`,
          actions: [
            {
              label: "Install and restart",
              onClick: async () => {
                await platform.update!()
                await platform.restart!()
              },
            },
            {
              label: "Not yet",
              onClick: "dismiss",
            },
          ],
        })
      }
    }

    pollUpdate()
    const interval = setInterval(pollUpdate, 10 * 60 * 1000)
    onCleanup(() => clearInterval(interval))
  })

  onMount(() => {
    const toastBySession = new Map<string, number>()
    const alertedAtBySession = new Map<string, number>()
    const permissionAlertCooldownMs = 5000

    const unsub = globalSDK.event.listen((e) => {
      if (e.details?.type !== "permission.asked") return
      const directory = e.name
      const perm = e.details.properties
      if (permission.autoResponds(perm, directory)) return

      const [store] = globalSync.child(directory)
      const session = store.session.find((s) => s.id === perm.sessionID)
      const sessionKey = `${directory}:${perm.sessionID}`

      const sessionTitle = session?.title ?? "新会话"
      const projectName = getFilename(directory)
      const description = `${sessionTitle} in ${projectName} needs permission`
      const href = `/${base64Encode(directory)}/session/${perm.sessionID}`

      const now = Date.now()
      const lastAlerted = alertedAtBySession.get(sessionKey) ?? 0
      if (now - lastAlerted < permissionAlertCooldownMs) return
      alertedAtBySession.set(sessionKey, now)

      void platform.notify("Permission required", description, href)

      const currentDir = params.dir ? base64Decode(params.dir) : undefined
      const currentSession = params.id
      if (directory === currentDir && perm.sessionID === currentSession) return
      if (directory === currentDir && session?.parentID === currentSession) return

      const existingToastId = toastBySession.get(sessionKey)
      if (existingToastId !== undefined) {
        toaster.dismiss(existingToastId)
      }

      const toastId = showToast({
        persistent: true,
        icon: "checklist",
        title: "Permission required",
        description,
        actions: [
          {
            label: "Go to session",
            onClick: () => {
              navigate(href)
            },
          },
          {
            label: "Dismiss",
            onClick: "dismiss",
          },
        ],
      })
      toastBySession.set(sessionKey, toastId)
    })
    onCleanup(unsub)

    createEffect(() => {
      const currentDir = params.dir ? base64Decode(params.dir) : undefined
      const currentSession = params.id
      if (!currentDir || !currentSession) return
      const sessionKey = `${currentDir}:${currentSession}`
      const toastId = toastBySession.get(sessionKey)
      if (toastId !== undefined) {
        toaster.dismiss(toastId)
        toastBySession.delete(sessionKey)
        alertedAtBySession.delete(sessionKey)
      }
      const [store] = globalSync.child(currentDir)
      const childSessions = store.session.filter((s) => s.parentID === currentSession)
      for (const child of childSessions) {
        const childKey = `${currentDir}:${child.id}`
        const childToastId = toastBySession.get(childKey)
        if (childToastId !== undefined) {
          toaster.dismiss(childToastId)
          toastBySession.delete(childKey)
          alertedAtBySession.delete(childKey)
        }
      }
    })
  })

  function sortSessions(a: Session, b: Session) {
    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000
    const aUpdated = a.time.updated ?? a.time.created
    const bUpdated = b.time.updated ?? b.time.created
    const aRecent = aUpdated > oneMinuteAgo
    const bRecent = bUpdated > oneMinuteAgo
    if (aRecent && bRecent) return a.id.localeCompare(b.id)
    if (aRecent && !bRecent) return -1
    if (!aRecent && bRecent) return 1
    return bUpdated - aUpdated
  }

  function scrollToSession(sessionId: string) {
    if (!scrollContainerRef) return
    const element = scrollContainerRef.querySelector(`[data-session-id="${sessionId}"]`)
    if (element) {
      element.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }

  const currentProject = createMemo(() => {
    const directory = params.dir ? base64Decode(params.dir) : undefined
    if (!directory) return
    return layout.projects.list().find((p) => p.worktree === directory || p.sandboxes?.includes(directory))
  })

  function projectSessions(project: LocalProject | undefined) {
    if (!project) return []
    const dirs = [project.worktree, ...(project.sandboxes ?? [])]
    const stores = dirs.map((dir) => globalSync.child(dir)[0])
    const sessions = stores
      .flatMap((store) => store.session.filter((session) => session.directory === store.path.directory))
      .toSorted(sortSessions)
    return sessions.filter((s) => !s.parentID)
  }

  const currentSessions = createMemo(() => projectSessions(currentProject()))

  function navigateSessionByOffset(offset: number) {
    const projects = layout.projects.list()
    if (projects.length === 0) return

    const project = currentProject()
    const projectIndex = project ? projects.findIndex((p) => p.worktree === project.worktree) : -1

    if (projectIndex === -1) {
      const targetProject = offset > 0 ? projects[0] : projects[projects.length - 1]
      if (targetProject) navigateToProject(targetProject.worktree)
      return
    }

    const sessions = currentSessions()
    const sessionIndex = params.id ? sessions.findIndex((s) => s.id === params.id) : -1

    let targetIndex: number
    if (sessionIndex === -1) {
      targetIndex = offset > 0 ? 0 : sessions.length - 1
    } else {
      targetIndex = sessionIndex + offset
    }

    if (targetIndex >= 0 && targetIndex < sessions.length) {
      const session = sessions[targetIndex]
      navigateToSession(session)
      queueMicrotask(() => scrollToSession(session.id))
      return
    }

    const nextProjectIndex = projectIndex + (offset > 0 ? 1 : -1)
    const nextProject = projects[nextProjectIndex]
    if (!nextProject) return

    const nextProjectSessions = projectSessions(nextProject)
    if (nextProjectSessions.length === 0) {
      navigateToProject(nextProject.worktree)
      return
    }

    const targetSession = offset > 0 ? nextProjectSessions[0] : nextProjectSessions[nextProjectSessions.length - 1]
    navigateToSession(targetSession)
    queueMicrotask(() => scrollToSession(targetSession.id))
  }



  async function deleteSession(session: Session) {
    const [store, setStore] = globalSync.child(session.directory)
    const sessions = store.session ?? []
    const index = sessions.findIndex((s) => s.id === session.id)
    const nextSession = sessions[index + 1] ?? sessions[index - 1]

    await globalSDK.client.session.delete({
      directory: session.directory,
      sessionID: session.id,
    })
    setStore(
      produce((draft) => {
        const match = Binary.search(draft.session, session.id, (s) => s.id)
        if (match.found) draft.session.splice(match.index, 1)
      }),
    )
    if (session.id === params.id) {
      if (nextSession) {
        navigate(`/${params.dir}/session/${nextSession.id}`)
      } else {
        navigate(`/${params.dir}/session`)
      }
    }
  }

  command.register(() => {
    const commands: CommandOption[] = [
      {
        id: "sidebar.toggle",
        title: "Toggle sidebar",
        category: "View",
        keybind: "mod+b",
        onSelect: () => layout.sidebar.toggle(),
      },
      {
        id: "project.open",
        title: "Open project",
        category: "Project",
        keybind: "mod+o",
        onSelect: () => chooseProject(),
      },
      {
        id: "provider.connect",
        title: "Connect provider",
        category: "Provider",
        onSelect: () => connectProvider(),
      },
      {
        id: "server.switch",
        title: "Switch server",
        category: "Server",
        onSelect: () => openServer(),
      },
      {
        id: "session.previous",
        title: "Previous session",
        category: "Session",
        keybind: "alt+arrowup",
        onSelect: () => navigateSessionByOffset(-1),
      },
      {
        id: "session.next",
        title: "Next session",
        category: "Session",
        keybind: "alt+arrowdown",
        onSelect: () => navigateSessionByOffset(1),
      },

      {
        id: "theme.cycle",
        title: "Cycle theme",
        category: "Theme",
        keybind: "mod+shift+t",
        onSelect: () => cycleTheme(1),
      },
    ]

    for (const [id, definition] of availableThemeEntries()) {
      commands.push({
        id: `theme.set.${id}`,
        title: `Use theme: ${definition.name ?? id}`,
        category: "Theme",
        onSelect: () => theme.commitPreview(),
        onHighlight: () => {
          theme.previewTheme(id)
          return () => theme.cancelPreview()
        },
      })
    }

    commands.push({
      id: "theme.scheme.cycle",
      title: "Cycle color scheme",
      category: "Theme",
      keybind: "mod+shift+s",
      onSelect: () => cycleColorScheme(1),
    })

    for (const scheme of colorSchemeOrder) {
      commands.push({
        id: `theme.scheme.${scheme}`,
        title: `Use color scheme: ${colorSchemeLabel[scheme]}`,
        category: "Theme",
        onSelect: () => theme.commitPreview(),
        onHighlight: () => {
          theme.previewColorScheme(scheme)
          return () => theme.cancelPreview()
        },
      })
    }

    return commands
  })

  function connectProvider() {
    dialog.show(() => <DialogSelectProvider />)
  }

  function openServer() {
    dialog.show(() => <DialogSelectServer />)
  }

  function navigateToProject(directory: string | undefined) {
    if (!directory) return
    const lastSession = store.lastSession[directory]
    navigate(`/${base64Encode(directory)}${lastSession ? `/session/${lastSession}` : ""}`)
    layout.mobileSidebar.hide()
  }

  function navigateToSession(session: Session | undefined) {
    if (!session) return
    navigate(`/${base64Encode(session.directory)}/session/${session.id}`)
    layout.mobileSidebar.hide()
  }

  function openProject(directory: string, navigate = true) {
    layout.projects.open(directory)
    if (navigate) navigateToProject(directory)
  }

  function closeProject(directory: string) {
    const index = layout.projects.list().findIndex((x) => x.worktree === directory)
    const next = layout.projects.list()[index + 1]
    layout.projects.close(directory)
    if (next) navigateToProject(next.worktree)
    else navigate("/")
  }

  async function chooseProject() {
    function resolve(result: string | string[] | null) {
      if (Array.isArray(result)) {
        for (const directory of result) {
          openProject(directory, false)
        }
        navigateToProject(result[0])
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

  createEffect(() => {
    if (!params.dir || !params.id) return
    const directory = base64Decode(params.dir)
    const id = params.id
    setStore("lastSession", directory, id)
    notification.session.markViewed(id)
    const project = currentProject()
    untrack(() => layout.projects.expand(project?.worktree ?? directory))
    requestAnimationFrame(() => scrollToSession(id))
  })

  createEffect(() => {
    if (isLargeViewport()) {
      const sidebarWidth = layout.sidebar.opened() ? layout.sidebar.width() : 48
      document.documentElement.style.setProperty("--dialog-left-margin", `${sidebarWidth}px`)
    } else {
      document.documentElement.style.setProperty("--dialog-left-margin", "0px")
    }
  })

  function getDraggableId(event: unknown): string | undefined {
    if (typeof event !== "object" || event === null) return undefined
    if (!("draggable" in event)) return undefined
    const draggable = (event as { draggable?: { id?: unknown } }).draggable
    if (!draggable) return undefined
    return typeof draggable.id === "string" ? draggable.id : undefined
  }

  function handleDragStart(event: unknown) {
    const id = getDraggableId(event)
    if (!id) return
    setStore("activeDraggable", id)
  }

  function handleDragOver(event: DndDragEvent) {
    const { draggable, droppable } = event
    if (draggable && droppable) {
      const projects = layout.projects.list()
      const fromIndex = projects.findIndex((p) => p.worktree === draggable.id.toString())
      const toIndex = projects.findIndex((p) => p.worktree === droppable.id.toString())
      if (fromIndex !== toIndex && toIndex !== -1) {
        layout.projects.move(draggable.id.toString(), toIndex)
      }
    }
  }

  function handleDragEnd() {
    setStore("activeDraggable", undefined)
  }

  const ProjectAvatar = (props: {
    project: LocalProject
    class?: string
    expandable?: boolean
    notify?: boolean
  }): JSX.Element => {
    const notification = useNotification()
    const notifications = createMemo(() => notification.project.unseen(props.project.worktree))
    const hasError = createMemo(() => notifications().some((n) => n.type === "error"))
    const name = createMemo(() => props.project.name || getFilename(props.project.worktree))
    const mask = "radial-gradient(circle 5px at calc(100% - 2px) 2px, transparent 5px, black 5.5px)"
    const opencode = "4b0ea68d7af9a6031a7ffda7ad66e0cb83315750"

    return (
      <div class="relative size-5 shrink-0 rounded-sm">
        <Show
          when={props.project.id === opencode}
          fallback={
            <Avatar
              fallback={name()}
              src={props.project.icon?.url}
              {...getAvatarColors(props.project.icon?.color)}
              class={`size-full ${props.class ?? ""}`}
              style={
                notifications().length > 0 && props.notify ? { "-webkit-mask-image": mask, "mask-image": mask } : undefined
              }
            />
          }
        >
          <Mark
            class={`size-full ${props.class ?? ""}`}
          />
        </Show>
        <Show when={props.expandable}>
          <Icon
            name="chevron-right"
            size="normal"
            class="hidden size-full items-center justify-center text-text-subtle group-hover/session:flex group-data-[expanded]/trigger:rotate-90 transition-transform duration-50"
          />
        </Show>
        <Show when={notifications().length > 0 && props.notify}>
          <div
            classList={{
              "absolute -top-0.5 -right-0.5 size-1.5 rounded-full": true,
              "bg-icon-critical-base": hasError(),
              "bg-text-interactive-base": !hasError(),
            }}
          />
        </Show>
      </div>
    )
  }

  const ProjectVisual = (props: { project: LocalProject; class?: string }): JSX.Element => {
    const name = createMemo(() => props.project.name || getFilename(props.project.worktree) || "Project")
    const current = createMemo(() => base64Decode(params.dir ?? ""))
    return (
      <Switch>
        <Match when={layout.sidebar.opened()}>
          <Button
            as={"div"}
            variant="ghost"
            data-active
            class="flex items-center justify-between gap-3 w-full px-1 self-stretch h-8 border-none rounded-lg"
          >
            <div class="flex items-center gap-3 p-0 text-left min-w-0 grow">
              <ProjectAvatar project={props.project} />
              <span class="truncate text-14-medium text-text-strong">{name()}</span>
            </div>
          </Button>
        </Match>
        <Match when={true}>
          <Button
            variant="ghost"
            size="large"
            class="flex items-center justify-center p-0 aspect-square border-none rounded-lg"
            data-selected={props.project.worktree === current()}
            onClick={() => navigateToProject(props.project.worktree)}
          >
            <ProjectAvatar project={props.project} notify />
          </Button>
        </Match>
      </Switch>
    )
  }

  const SessionItem = (props: {
    session: Session
    slug: string
    project: LocalProject
    mobile?: boolean
  }): JSX.Element => {
    const updated = createMemo(() => DateTime.fromMillis(props.session.time.updated))
    const [sessionStore] = globalSync.child(props.session.directory)
    const hasPermissions = createMemo(() => {
      const permissions = sessionStore.permission?.[props.session.id] ?? []
      if (permissions.length > 0) return true
      const childSessions = sessionStore.session.filter((s) => s.parentID === props.session.id)
      for (const child of childSessions) {
        const childPermissions = sessionStore.permission?.[child.id] ?? []
        if (childPermissions.length > 0) return true
      }
      return false
    })
    const isWorking = createMemo(() => {
      if (props.session.id === params.id) return false
      if (hasPermissions()) return false
      const status = sessionStore.session_status[props.session.id]
      return status?.type === "busy" || status?.type === "retry"
    })
    return (
      <>
        <div
          data-session-id={props.session.id}
          class="group/session relative w-full rounded-lg cursor-default transition-colors
                 hover:bg-surface-raised-base-hover focus-within:bg-surface-raised-base-hover has-[.active]:bg-surface-raised-base-hover"
        >
          <Tooltip placement={props.mobile ? "bottom" : "right"} value={props.session.title} gutter={10}>
            <A
              href={`${props.slug}/session/${props.session.id}`}
              class="flex items-center gap-2 min-w-0 text-left w-full focus:outline-none px-2.5 py-1.5"
            >
              <Icon name="speech-bubble" size="small" class="shrink-0 text-text-weaker" />
              <span
                classList={{
                  "flex-1 text-13-regular text-text-strong overflow-hidden text-ellipsis truncate": true,
                  "animate-pulse": isWorking(),
                }}
              >
                {props.session.title}
              </span>
              <div class="shrink-0 flex items-center gap-1">
                <Switch>
                  <Match when={isWorking()}>
                    <Spinner class="size-2.5" />
                  </Match>
                  <Match when={true}>
                    <span class="text-11-regular text-text-weaker whitespace-nowrap">
                      {Math.abs(updated().diffNow().as("seconds")) < 60
                        ? "now"
                        : updated()
                            .toRelative({
                              style: "short",
                              unit: ["days", "hours", "minutes"],
                            })
                            ?.replace(" ago", "")
                            ?.replace(/ days?/, "d")
                            ?.replace(" min.", "m")
                            ?.replace(" hr.", "h")}
                    </span>
                  </Match>
                </Switch>
              </div>
            </A>
          </Tooltip>
          <div class="hidden group-hover/session:flex group-active/session:flex group-focus-within/session:flex text-text-base items-center absolute top-1 right-1 bg-surface-raised-strong/95 backdrop-blur-md p-0.5 rounded-md border border-border-weak-base shadow-sm z-10">
            <Tooltip placement={props.mobile ? "bottom" : "right"} value="删除">
              <IconButton
                icon="trash"
                variant="ghost"
                class="hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("确定要永久删除此会话吗？")) {
                    deleteSession(props.session)
                  }
                }}
              />
            </Tooltip>
          </div>
        </div>
      </>
    )
  }

  const SortableProject = (props: { project: LocalProject; mobile?: boolean }): JSX.Element => {
    const sortable = createSortable(props.project.worktree)
    const showExpanded = createMemo(() => props.mobile || layout.sidebar.opened())
    const defaultWorktree = createMemo(() => base64Encode(props.project.worktree))
    const name = createMemo(() => props.project.name || getFilename(props.project.worktree))
    const [store, setProjectStore] = globalSync.child(props.project.worktree)
    const stores = createMemo(() =>
      [props.project.worktree, ...(props.project.sandboxes ?? [])].map((dir) => globalSync.child(dir)[0]),
    )
    const sessions = createMemo(() =>
      stores()
        .flatMap((store) => store.session.filter((session) => session.directory === store.path.directory))
        .toSorted(sortSessions),
    )
    const rootSessions = createMemo(() => sessions().filter((s) => !s.parentID))
    const hasMoreSessions = createMemo(() => store.session.length >= store.limit)
    const loadMoreSessions = async () => {
      setProjectStore("limit", (limit) => limit + 5)
      await globalSync.project.loadSessions(props.project.worktree)
    }
    const isExpanded = createMemo(() =>
      props.mobile ? mobileProjects.expanded(props.project.worktree) : props.project.expanded,
    )
    const isActive = createMemo(() => {
      const current = params.dir ? base64Decode(params.dir) : ""
      return props.project.worktree === current || props.project.sandboxes?.includes(current)
    })
    const handleOpenChange = (open: boolean) => {
      if (props.mobile) {
        if (open) mobileProjects.expand(props.project.worktree)
        else mobileProjects.collapse(props.project.worktree)
      } else {
        if (open) layout.projects.expand(props.project.worktree)
        else layout.projects.collapse(props.project.worktree)
      }
    }
    return (
      // @ts-ignore
      <div use:sortable classList={{ "opacity-30": sortable.isActiveDraggable }}>
        <Switch>
          <Match when={showExpanded()}>
            <div class="shrink-0">
              {/* Project header - compact modern style */}
              <button
                type="button"
                classList={{
                  "group/project flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-all": true,
                  "bg-surface-raised-base-hover": isActive() && !isExpanded(),
                }}
                onClick={() => handleOpenChange(!isExpanded())}
              >
                <div class="relative size-4 shrink-0">
                  <ProjectAvatar
                    project={props.project}
                    class="group-hover/project:hidden"
                    notify={!isExpanded()}
                  />
                  <Icon
                    name={isExpanded() ? "chevron-down" : "chevron-right"}
                    size="small"
                    class="hidden group-hover/project:block text-text-weak"
                  />
                </div>
                <span class="flex-1 truncate text-13-medium text-text-strong text-left">{name()}</span>
                <div class="flex opacity-0 group-hover/project:opacity-100 transition-opacity gap-0.5">
                  <TooltipKeybind placement="top" title="新对话" keybind={command.keybind("session.new")}>
                    <IconButton
                      as={A}
                      href={`${defaultWorktree()}/session`}
                      icon="plus"
                      variant="ghost"
                    />
                  </TooltipKeybind>
                  <DropdownMenu>
                    <DropdownMenu.Trigger as={IconButton} icon="ellipsis" variant="ghost" size="small" />
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item
                          onSelect={() => dialog.show(() => <DialogEditProject project={props.project} />)}
                        >
                          <DropdownMenu.ItemLabel>编辑项目</DropdownMenu.ItemLabel>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={() => closeProject(props.project.worktree)}>
                          <DropdownMenu.ItemLabel>关闭项目</DropdownMenu.ItemLabel>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu>
                </div>
              </button>

              {/* Session list - compact with left border */}
              <Show when={isExpanded()}>
                <div class="ml-3 pl-2 border-l border-border-weak-base/50 mt-1 space-y-0.5">
                  <For each={rootSessions()}>
                    {(session) => (
                      <SessionItem
                        session={session}
                        slug={base64Encode(session.directory)}
                        project={props.project}
                        mobile={props.mobile}
                      />
                    )}
                  </For>
                  <Show when={rootSessions().length === 0}>
                    <A
                      href={`${defaultWorktree()}/session`}
                      class="flex items-center gap-2 px-2 py-1.5 rounded-md text-13-regular text-text-weak hover:text-text-strong hover:bg-surface-raised-base-hover transition-colors"
                    >
                      <Icon name="plus" size="small" />
                      <span>开始对话</span>
                    </A>
                  </Show>
                  <Show when={hasMoreSessions()}>
                    <button
                      type="button"
                      class="w-full text-left px-2 py-1 text-11-regular text-text-weaker hover:text-text-weak transition-colors"
                      onClick={loadMoreSessions}
                    >
                      加载更多
                    </button>
                  </Show>
                </div>
              </Show>
            </div>
          </Match>
          <Match when={true}>
            <Tooltip placement="right" value={props.project.worktree}>
              <ProjectVisual project={props.project} />
            </Tooltip>
          </Match>
        </Switch>
      </div>
    )
  }

  const ProjectDragOverlay = (): JSX.Element => {
    const project = createMemo(() => layout.projects.list().find((p) => p.worktree === store.activeDraggable))
    return (
      <Show when={project()}>
        {(p) => (
          <div class="bg-background-base rounded-md">
            <ProjectVisual project={p()} />
          </div>
        )}
      </Show>
    )
  }

  const SidebarContent = (sidebarProps: { mobile?: boolean }) => {
    const expanded = () => sidebarProps.mobile || layout.sidebar.opened()
    return (
      <div class="flex flex-col self-stretch h-full items-center justify-between overflow-hidden min-h-0">
        <div class="flex flex-col items-start self-stretch gap-4 min-h-0">
          <Show when={!sidebarProps.mobile}>
            <div
              classList={{
                "w-full h-12 ml-px flex items-center pl-1.75 shrink-0": true,
                "justify-between pr-1": expanded(),
                "justify-start": !expanded(),
              }}
            >
              <A href="/" class="shrink-0 h-8 flex items-center justify-start gap-2.5 px-2" data-tauri-drag-region>
                <Mark class="shrink-0" />
                <Show when={expanded()}>
                  <span class="text-14-bold text-text-strong tracking-tight truncate">MemFit</span>
                </Show>
              </A>
              <Show when={expanded()}>
                <Tooltip placement="right" value="打开项目">
                  <IconButton icon="folder-add-left" variant="ghost" onClick={chooseProject} />
                </Tooltip>
              </Show>
            </div>
          </Show>
          <div class="flex flex-col items-start self-stretch gap-4 px-2 overflow-hidden min-h-0">
            <Show when={!sidebarProps.mobile}>
              <TooltipKeybind
                class="shrink-0"
                placement="right"
                title={layout.sidebar.opened() ? "收起面板" : "展开面板"}
                keybind={command.keybind("sidebar.toggle")}
                inactive={expanded()}
              >
                <Button
                  variant="ghost"
                  size="large"
                  class="group/sidebar-toggle shrink-0 w-full text-left justify-start rounded-lg px-2 gap-2"
                  onClick={layout.sidebar.toggle}
                >
                  <Icon
                    name={layout.sidebar.opened() ? "collapse" : "expand"}
                    size="small"
                  />
                  <Show when={layout.sidebar.opened()}>
                    <span class="text-13-medium text-text-base">
                      {layout.sidebar.opened() ? "收起面板" : "展开面板"}
                    </span>
                  </Show>
                </Button>
              </TooltipKeybind>
            </Show>
            <DragDropProvider
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              collisionDetector={closestCenter}
            >
              <DragDropSensors />
              <ConstrainDragXAxis />
              <div
                ref={(el) => {
                  if (!sidebarProps.mobile) scrollContainerRef = el
                }}
                class="w-full min-w-8 flex flex-col gap-2 min-h-0 overflow-y-auto no-scrollbar"
              >
                <SortableProvider ids={layout.projects.list().map((p) => p.worktree)}>
                  <For each={layout.projects.list()}>
                    {(project) => <SortableProject project={project} mobile={sidebarProps.mobile} />}
                  </For>
                </SortableProvider>
              </div>
              <DragOverlay>
                <ProjectDragOverlay />
              </DragOverlay>
            </DragDropProvider>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div class="relative flex-1 min-h-0 flex flex-col select-none [&_input]:select-text [&_textarea]:select-text [&_[contenteditable]]:select-text bg-[#f1f3f6] dark:bg-[#07080a] h-screen w-screen overflow-hidden">
      <div class="flex-1 min-h-0 flex">
        <div
          classList={{
            "hidden xl:block": true,
            "relative shrink-0": true,
            "h-[calc(100vh-16px)] my-2 ml-2 mr-1": true,
          }}
          style={{ width: layout.sidebar.opened() ? `${layout.sidebar.width()}px` : "48px" }}
        >
          <div
            classList={{
              "@container w-full h-full pb-5 bg-surface-raised-strong rounded-2xl border border-border-weak-base shadow-sm overflow-hidden": true,
              "flex flex-col gap-5.5 items-start self-stretch justify-between": true,
            }}
          >
            <SidebarContent />
          </div>
          <Show when={layout.sidebar.opened()}>
            <ResizeHandle
              direction="horizontal"
              size={layout.sidebar.width()}
              min={150}
              max={window.innerWidth * 0.3}
              collapseThreshold={80}
              onResize={layout.sidebar.resize}
              onCollapse={layout.sidebar.close}
            />
          </Show>
        </div>
        <div class="xl:hidden">
          <div
            classList={{
              "fixed inset-0 bg-black/50 z-40 transition-opacity duration-200": true,
              "opacity-100 pointer-events-auto": layout.mobileSidebar.opened(),
              "opacity-0 pointer-events-none": !layout.mobileSidebar.opened(),
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) layout.mobileSidebar.hide()
            }}
          />
          <div
            classList={{
              "@container fixed inset-y-0 left-0 z-50 w-72 bg-surface-raised-strong border-r border-border-weak-base flex flex-col gap-5.5 items-start self-stretch justify-between pb-5 transition-transform duration-200 ease-out": true,
              "translate-x-0": layout.mobileSidebar.opened(),
              "-translate-x-full": !layout.mobileSidebar.opened(),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div class="border-b border-border-weak-base w-full h-12 ml-px flex items-center pl-1.75 shrink-0">
              <A
                href="/"
                class="shrink-0 h-8 flex items-center justify-start px-2 w-full"
                onClick={() => layout.mobileSidebar.hide()}
              >
                <Mark class="shrink-0" />
              </A>
            </div>
            <SidebarContent mobile />
          </div>
        </div>

        <main class="h-[calc(100vh-16px)] my-2 mr-2 ml-1 flex-1 rounded-2xl border border-border-weak-base bg-background-base shadow-sm overflow-x-hidden flex flex-col items-start contain-strict">{props.children}</main>
      </div>
      <Toast.Region />
    </div>
  )
}
