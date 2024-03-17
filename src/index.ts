import { normalizePath, type Plugin } from "vite"
import type { Config } from "./types"
import glob from "fast-glob"
import code from "./code"
import { dirname, resolve } from "path"

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
        const fileName = "index.html";

        if (page === "index") {
          acc["main"] = resolve(root, fileName)
          return acc
        }

        acc[page] = resolve(root, page, fileName)

        return acc
      }, {})

      return {
        root,
        build: {
          rollupOptions: {
            input,
          },
        },
      }
    },

    resolveId(id) {
      const fileName = "index.html";

      return id.includes(fileName) ? id : null
    },

    async load(id) {
      if (framework === "") throw new Error("Framework not found")

      const fileName = "index.html";

      if (!id.endsWith(fileName)) return null

      id = normalizePath(id)

      const page = id.replace(fileName, `index.${framework}`)

      if (framework === "svelte") {
        const result = await code.svelte(page)

        return result
      } else if (framework === "vue") {
        const result = await code.vue(page)

        return result
      } else if (framework === "tsx") {
        const result = await code.react(page);

        return result
      }
    },
  }
}
