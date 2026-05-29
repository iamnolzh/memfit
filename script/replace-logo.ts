import { execSync } from "child_process"
import { existsSync, copyFileSync, writeFileSync } from "fs"
import path from "path"

const workspaceRoot = "/Users/ws/Downloads/opencode"
const uiFaviconDir = path.join(workspaceRoot, "packages/ui/src/assets/favicon")
const consolePublicDir = path.join(workspaceRoot, "packages/console/app/public")

function log(msg: string) {
  console.log(`\x1b[36m[LogoReplacer]\x1b[0m ${msg}`)
}

function runCmd(cmd: string) {
  try {
    execSync(cmd, { stdio: "inherit" })
  } catch (e) {
    console.error(`Failed to run command: ${cmd}`, e)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const sourcePath = args[0]

  if (!sourcePath || !existsSync(sourcePath)) {
    console.error("Usage: bun run script/replace-logo.ts <path-to-your-logo>")
    console.error("Please provide a valid PNG or SVG image file.")
    process.exit(1)
  }

  const ext = path.extname(sourcePath).toLowerCase()
  log(`Detected source image: ${sourcePath} (Type: ${ext})`)

  // 1. 如果是 SVG
  if (ext === ".svg") {
    log("Processing as SVG. Replacing vector graphics...")
    
    const uiSvgDest = path.join(uiFaviconDir, "favicon.svg")
    const consoleSvgDest = path.join(consolePublicDir, "favicon.svg")
    
    copyFileSync(sourcePath, uiSvgDest)
    copyFileSync(sourcePath, consoleSvgDest)
    log(`Successfully replaced SVG in UI and Console Public.`)
    log("Note: SVG has been updated, but PNG/ICO favicons still need PNG source to be generated.")
    process.exit(0)
  }

  // 2. 如果是 PNG 或者是其他图片格式（使用 macOS 自带的 sips 进行高精度裁剪与转换）
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
    log("Processing image with macOS 'sips' command line tool...")

    const targets = [
      // UI package targets
      { dir: uiFaviconDir, name: "favicon-96x96.png", size: 96 },
      { dir: uiFaviconDir, name: "web-app-manifest-192x192.png", size: 192 },
      { dir: uiFaviconDir, name: "web-app-manifest-512x512.png", size: 512 },
      { dir: uiFaviconDir, name: "apple-touch-icon.png", size: 180 },
      
      // Console package targets
      { dir: consolePublicDir, name: "favicon-96x96.png", size: 96 },
      { dir: consolePublicDir, name: "web-app-manifest-192x192.png", size: 192 },
      { dir: consolePublicDir, name: "web-app-manifest-512x512.png", size: 512 },
      { dir: consolePublicDir, name: "apple-touch-icon.png", size: 180 },
      { dir: consolePublicDir, name: "social-share.png", size: 1200 },
      { dir: consolePublicDir, name: "social-share-zen.png", size: 1080 },
    ]

    // 批量生成各个尺寸的 PNG
    for (const t of targets) {
      const dest = path.join(t.dir, t.name)
      log(`Generating ${t.name} (${t.size}x${t.size})...`)
      runCmd(`sips -z ${t.size} ${t.size} "${sourcePath}" --out "${dest}"`)
    }

    // 生成 favicon.ico
    log("Generating favicon.ico...")
    const uiIcoDest = path.join(uiFaviconDir, "favicon.ico")
    const consoleIcoDest = path.join(consolePublicDir, "favicon.ico")
    
    const localIcoPath = path.join(workspaceRoot, "yak.ico")
    if (existsSync(localIcoPath)) {
      log("Found user-supplied yak.ico directly. Copying instead of converting...")
      copyFileSync(localIcoPath, uiIcoDest)
      copyFileSync(localIcoPath, consoleIcoDest)
    } else {
      try {
        // 使用 sips 将 PNG 转换成 ICO
        runCmd(`sips -s format ico "${sourcePath}" --out "${uiIcoDest}"`)
        copyFileSync(uiIcoDest, consoleIcoDest)
      } catch (e) {
        log("Warning: Failed to convert PNG to ICO with sips. If you have an .ico file, please name it 'yak.ico' in the root directory.")
      }
    }
    
    log("✨ All PNG/ICO assets have been fully replaced and scaled!")
  } else {
    console.error("Unsupported file extension. Only PNG, JPG, or SVG are supported.")
  }
}

main()
