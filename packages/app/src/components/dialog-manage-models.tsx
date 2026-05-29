import { Dialog } from "@opencode-ai/ui/dialog"
import { List } from "@opencode-ai/ui/list"
import type { Component } from "solid-js"
import { useLocal } from "@/context/local"
import { popularProviders } from "@/hooks/use-providers"

export const DialogManageModels: Component = () => {
  const local = useLocal()
  return (
    <Dialog
      title="Manage models"
      description="Customize which models appear in the model selector."
      class="!rounded-2xl !bg-background-base/90 !backdrop-blur-xl border border-border-weak-base/60 shadow-2xl transition-all duration-300 max-w-[480px]"
    >
      <List
        class={[
          "flex-1 min-h-0",
          "[&_[data-slot=list-scroll]]:flex-1 [&_[data-slot=list-scroll]]:min-h-0",
          "[&_[data-slot=list-search]]:mb-4",
          "[&_[data-slot=list-search-container]]:bg-background-base/80",
          "[&_[data-slot=list-search-container]]:border-border-weak-base/60",
          "[&_[data-slot=list-search-container]]:rounded-xl",
          "[&_[data-slot=list-item]]:rounded-lg",
          "[&_[data-slot=list-item][data-active=true]]:bg-surface-raised-base-hover",
          "[&_[data-slot=list-item][data-active=true]]:translate-x-1",
          "[&_[data-slot=list-item]]:transition-all",
        ].join(" ")}
        search={{ placeholder: "Search models", autofocus: true }}
        emptyMessage="No model results"
        key={(x) => `${x?.provider?.id}:${x?.id}`}
        items={local.model.list()}
        filterKeys={["provider.name", "name", "id"]}
        sortBy={(a, b) => a.name.localeCompare(b.name)}
        groupBy={(x) => x.provider.name}
        sortGroupsBy={(a, b) => {
          const aProvider = a.items[0].provider.id
          const bProvider = b.items[0].provider.id
          if (popularProviders.includes(aProvider) && !popularProviders.includes(bProvider)) return -1
          if (!popularProviders.includes(aProvider) && popularProviders.includes(bProvider)) return 1
          return popularProviders.indexOf(aProvider) - popularProviders.indexOf(bProvider)
        }}
        onSelect={(x) => {
          if (!x) return
          const visible = local.model.visible({
            modelID: x.id,
            providerID: x.provider.id,
          })
          local.model.setVisibility({ modelID: x.id, providerID: x.provider.id }, !visible)
        }}
      >
        {(i) => (
          <div class="w-full flex items-center justify-between gap-x-3 py-1 px-1">
            <span class="truncate text-13-regular">{i.name}</span>
            <div
              onClick={(e) => e.stopPropagation()}
              class="shrink-0"
            >
              <label class="memfit-toggle">
                <input
                  type="checkbox"
                  checked={
                    !!local.model.visible({
                      modelID: i.id,
                      providerID: i.provider.id,
                    })
                  }
                  onChange={(e) => {
                    local.model.setVisibility(
                      { modelID: i.id, providerID: i.provider.id },
                      e.currentTarget.checked,
                    )
                  }}
                />
                <span class="memfit-toggle-track">
                  <span class="memfit-toggle-thumb" />
                </span>
              </label>
            </div>
          </div>
        )}
      </List>
    </Dialog>
  )
}
