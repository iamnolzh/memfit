import { Popover as Kobalte } from "@kobalte/core/popover"
import { Component, createMemo, createSignal, JSX, Show } from "solid-js"
import { useLocal } from "@/context/local"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { popularProviders } from "@/hooks/use-providers"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { Dialog } from "@opencode-ai/ui/dialog"
import { List } from "@opencode-ai/ui/list"
import { DialogSelectProvider } from "./dialog-select-provider"
import { DialogManageModels } from "./dialog-manage-models"

const ModelList: Component<{
  provider?: string
  class?: string
  onSelect: () => void
}> = (props) => {
  const local = useLocal()

  const models = createMemo(() =>
    local.model
      .list()
      .filter((m) => local.model.visible({ modelID: m.id, providerID: m.provider.id }))
      .filter((m) => (props.provider ? m.provider.id === props.provider : true)),
  )

  return (
    <List
      class={`flex-1 min-h-0 [&_[data-slot=list-scroll]]:flex-1 [&_[data-slot=list-scroll]]:min-h-0 [&_[data-slot=list-search]]:mb-4 [&_[data-slot=list-search-container]]:bg-background-base/80 [&_[data-slot=list-search-container]]:border-border-weak-base/60 [&_[data-slot=list-search-container]]:rounded-xl [&_[data-slot=list-item]]:rounded-lg [&_[data-slot=list-item][data-active=true]]:bg-surface-raised-base-hover [&_[data-slot=list-item][data-active=true]]:translate-x-1 [&_[data-slot=list-item]]:transition-all [&_[data-slot=list-item][data-selected=true]]:bg-icon-critical-base/5 [&_[data-slot=list-item][data-selected=true]]:text-icon-critical-base [&_[data-slot=list-item][data-selected=true]]:font-medium ${props.class ?? ""}`}
      search={{ placeholder: "Search models", autofocus: true }}
      emptyMessage="No model results"
      key={(x) => `${x.provider.id}:${x.id}`}
      items={models}
      current={local.model.current()}
      filterKeys={["provider.name", "name", "id"]}
      sortBy={(a, b) => a.name.localeCompare(b.name)}
      groupBy={(x) => x.provider.name}
      sortGroupsBy={(a, b) => {
        if (a.category === "Recent" && b.category !== "Recent") return -1
        if (b.category === "Recent" && a.category !== "Recent") return 1
        const aProvider = a.items[0].provider.id
        const bProvider = b.items[0].provider.id
        if (popularProviders.includes(aProvider) && !popularProviders.includes(bProvider)) return -1
        if (!popularProviders.includes(aProvider) && popularProviders.includes(bProvider)) return 1
        return popularProviders.indexOf(aProvider) - popularProviders.indexOf(bProvider)
      }}
      onSelect={(x) => {
        local.model.set(x ? { modelID: x.id, providerID: x.provider.id } : undefined, {
          recent: true,
        })
        props.onSelect()
      }}
    >
      {(i) => (
        <div class="w-full flex items-center justify-between gap-x-2 py-1.5 px-1.5 text-13-regular">
          <span class="truncate">{i.name}</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <Show when={i.provider.id === "memfit" && (!i.cost || i.cost?.input === 0)}>
              <span class="px-2 py-0.5 text-10-semibold tracking-wider uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md select-none">
                Free
              </span>
            </Show>
            <Show when={i.latest}>
              <span class="px-2 py-0.5 text-10-semibold tracking-wider uppercase text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-md select-none">
                Latest
              </span>
            </Show>
          </div>
        </div>
      )}
    </List>
  )
}

export const ModelSelectorPopover: Component<{
  provider?: string
  children: JSX.Element
}> = (props) => {
  const [open, setOpen] = createSignal(false)

  return (
    <Kobalte open={open()} onOpenChange={setOpen} placement="top-start" gutter={8}>
      <Kobalte.Trigger as="div">{props.children}</Kobalte.Trigger>
      <Kobalte.Portal>
        <Kobalte.Content class="w-72 h-80 flex flex-col rounded-2xl border border-border-weak-base/60 bg-background-base/95 backdrop-blur-xl shadow-2xl z-50 outline-none p-2">
          <Kobalte.Title class="sr-only">Select model</Kobalte.Title>
          <ModelList provider={props.provider} onSelect={() => setOpen(false)} class="p-1" />
        </Kobalte.Content>
      </Kobalte.Portal>
    </Kobalte>
  )
}

export const DialogSelectModel: Component<{ provider?: string }> = (props) => {
  const dialog = useDialog()

  return (
    <Dialog
      title="Select model"
      class="!rounded-2xl !bg-background-base/90 !backdrop-blur-xl border border-border-weak-base/60 shadow-2xl p-6 transition-all duration-300 max-w-[480px]"
      action={
        <Button
          class="h-7 -my-1 text-12-medium rounded-lg border border-border-weak-base px-2.5 hover:bg-surface-raised-base-hover transition-colors"
          icon="plus-small"
          tabIndex={-1}
          onClick={() => dialog.show(() => <DialogSelectProvider />)}
        >
          Connect provider
        </Button>
      }
    >
      <ModelList provider={props.provider} onSelect={() => dialog.close()} />
      <Button
        variant="ghost"
        class="ml-3 mt-5 mb-2 text-13-medium text-text-weak hover:text-text-strong rounded-lg hover:bg-surface-raised-base-hover flex items-center transition-colors"
        onClick={() => dialog.show(() => <DialogManageModels />)}
      >
        <Icon name="settings-gear" size="small" class="mr-1.5 text-text-weak" />
        Manage models
      </Button>
    </Dialog>
  )
}
