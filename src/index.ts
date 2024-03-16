import { normalizePath, type Plugin } from "vite"
import type { Config } from "./types"
import glob from "fast-glob"
import code from "./code"
import { dirname, resolve } from "path"
import { isPackage } from "./utils/isPackage"
import { getFileName } from "./utils/getFileName"

export const multipage = (config?: Config): Plugin => {
  const root = config?.directory || "src/pages"
  let framework = ""

  return {
    name: "vite-plugin-multi-page",
    config: () => {
      const pages = glob.sync("**/*.{svelte,vue,tsx}", {
        cwd: root,
        onlyFiles: true,
      })

      const entries = pages.map((page, i) => {
        // Get framework from file extension
        if (i === 0 && !framework) framework = page.split(".").pop() || ""

        const name = dirname(page)

        if (name === "." || !name) return "index"

        return name
      })

      const input = entries.reduce((acc: Record<string, string>, page) => {
        const fileName = getFileName(framework)

        if (page === "index") {
          acc[page] = resolve(root, fileName)
          return acc
        }

        acc[page] = resolve(root, page, fileName)

        return acc
      }, {})

      return {
        build: {
          rollupOptions: {
            input,
            output: {
              assetFileNames: (chunkInfo) => {
                if (!chunkInfo.name) return "assets/[name].[ext]"

                const isPage = chunkInfo.name.endsWith(".html")

                return isPage ? chunkInfo.name : "assets/[name].[ext]"
              },
            },
          },
        },
      }
    },

    resolveId(id) {
      const fileName = getFileName(framework)

      return id.includes(fileName) ? id : null
    },

    load(id) {
      if (framework === "") throw new Error("Framework not found")

      const fileName = getFileName(framework)

      if (!id.endsWith(fileName)) return null

      id = normalizePath(id)

      const page = id.replace(fileName, `index.${framework}`)

      if (framework === "svelte") {
        return code.svelte(page)
      } else if (framework === "vue") {
        return code.vue(page)
      } else if (framework === "tsx") {
        return code.react(page)
      }
    },

    async generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue

        if (fileName.endsWith(".js")) {
          let page = `${chunk.name}/index.html`

          if (chunk.name === "index") {
            page = "index.html"
          }

          if (isPackage(chunk.moduleIds)) return

          const output = await code.html(fileName, page, config)

          this.emitFile({
            type: "asset",
            fileName: page,
            source: output,
          })
        }
      }
    },
  }
}
