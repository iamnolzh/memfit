export namespace Flag {
  export const MEMFIT_AUTO_SHARE = truthy("MEMFIT_AUTO_SHARE")
  export const MEMFIT_GIT_BASH_PATH = process.env["MEMFIT_GIT_BASH_PATH"]
  export const MEMFIT_CONFIG = process.env["MEMFIT_CONFIG"]
  export const MEMFIT_CONFIG_DIR = process.env["MEMFIT_CONFIG_DIR"]
  export const MEMFIT_CONFIG_CONTENT = process.env["MEMFIT_CONFIG_CONTENT"]
  export const MEMFIT_DISABLE_AUTOUPDATE = truthy("MEMFIT_DISABLE_AUTOUPDATE")
  export const MEMFIT_DISABLE_PRUNE = truthy("MEMFIT_DISABLE_PRUNE")
  export const MEMFIT_DISABLE_TERMINAL_TITLE = truthy("MEMFIT_DISABLE_TERMINAL_TITLE")
  export const MEMFIT_PERMISSION = process.env["MEMFIT_PERMISSION"]
  export const MEMFIT_DISABLE_DEFAULT_PLUGINS = truthy("MEMFIT_DISABLE_DEFAULT_PLUGINS")
  export const MEMFIT_DISABLE_LSP_DOWNLOAD = truthy("MEMFIT_DISABLE_LSP_DOWNLOAD")
  export const MEMFIT_ENABLE_EXPERIMENTAL_MODELS = truthy("MEMFIT_ENABLE_EXPERIMENTAL_MODELS")
  export const MEMFIT_DISABLE_AUTOCOMPACT = truthy("MEMFIT_DISABLE_AUTOCOMPACT")
  export const MEMFIT_DISABLE_MODELS_FETCH = truthy("MEMFIT_DISABLE_MODELS_FETCH")
  export const MEMFIT_FAKE_VCS = process.env["MEMFIT_FAKE_VCS"]
  export const MEMFIT_CLIENT = process.env["MEMFIT_CLIENT"] ?? "cli"

  // Experimental
  export const MEMFIT_EXPERIMENTAL = truthy("MEMFIT_EXPERIMENTAL")
  export const MEMFIT_EXPERIMENTAL_FILEWATCHER = truthy("MEMFIT_EXPERIMENTAL_FILEWATCHER")
  export const MEMFIT_EXPERIMENTAL_DISABLE_FILEWATCHER = truthy("MEMFIT_EXPERIMENTAL_DISABLE_FILEWATCHER")
  export const MEMFIT_EXPERIMENTAL_ICON_DISCOVERY =
    MEMFIT_EXPERIMENTAL || truthy("MEMFIT_EXPERIMENTAL_ICON_DISCOVERY")
  export const MEMFIT_EXPERIMENTAL_DISABLE_COPY_ON_SELECT = truthy("MEMFIT_EXPERIMENTAL_DISABLE_COPY_ON_SELECT")
  export const MEMFIT_ENABLE_EXA =
    truthy("MEMFIT_ENABLE_EXA") || MEMFIT_EXPERIMENTAL || truthy("MEMFIT_EXPERIMENTAL_EXA")
  export const MEMFIT_EXPERIMENTAL_BASH_MAX_OUTPUT_LENGTH = number("MEMFIT_EXPERIMENTAL_BASH_MAX_OUTPUT_LENGTH")
  export const MEMFIT_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS = number("MEMFIT_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS")
  export const MEMFIT_EXPERIMENTAL_OUTPUT_TOKEN_MAX = number("MEMFIT_EXPERIMENTAL_OUTPUT_TOKEN_MAX")
  export const MEMFIT_EXPERIMENTAL_OXFMT = MEMFIT_EXPERIMENTAL || truthy("MEMFIT_EXPERIMENTAL_OXFMT")
  export const MEMFIT_EXPERIMENTAL_LSP_TY = truthy("MEMFIT_EXPERIMENTAL_LSP_TY")
  export const MEMFIT_EXPERIMENTAL_LSP_TOOL = MEMFIT_EXPERIMENTAL || truthy("MEMFIT_EXPERIMENTAL_LSP_TOOL")

  function truthy(key: string) {
    const value = process.env[key]?.toLowerCase()
    return value === "true" || value === "1"
  }

  function number(key: string) {
    const value = process.env[key]
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
}
