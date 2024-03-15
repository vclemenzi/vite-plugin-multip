import { normalizePath, type Plugin } from "vite";
import type { Config } from "./types";
import glob from "fast-glob";
import code from "./code";
import { dirname, resolve } from "path";

export const multipage = (config?: Config): Plugin => {
  const root = config?.directory || "src/pages";
  let framework = "";

  return {
    name: "vite-multipage",
    config: () => {
      const pages = glob.sync("**/*.{svelte,vue}", {
        cwd: root,
        onlyFiles: true
      });

      const entries = pages.map((page, i) => {
        // Get framework from file extension
        if (i === 0) framework = page.split('.').pop() || '';

        const name = dirname(page);

        if (name === "." || !name) return "index";

        return name;
      });

      const input = entries.reduce((acc: Record<string, string>, page) => {
        if (page === "index") {
          acc[page] = resolve(root, "main.ts");
          return acc;
        }

        acc[page] = resolve(root, page, "main.ts");

        return acc;
      }, {});

      return {
        build: {
          rollupOptions: {
            input,
            output: {
              assetFileNames: (chunkInfo) => {
                if (!chunkInfo.name) return "assets/[name].[ext]";

                const isPage = chunkInfo.name.endsWith(".html");

                return isPage ? chunkInfo.name : "assets/[name].[ext]";
              },
            }
          }
        }
      };
    },

    resolveId(id) {
      return id.includes("main.ts") ? id : null;
    },

    load(id) {
      if (!id.endsWith("main.ts")) return null;

      id = normalizePath(id);

      if (framework === "") throw new Error('Framework not found');

      const page = id.replace('main.ts', `index.${framework}`);

      if (framework === "svelte") {
        return code.svelte(page);
      } else if (framework === "vue") {
        return code.vue(page);
      }
    },

    generateBundle(_, bundle) {
      for (const [fileName] of Object.entries(bundle)) {
        if (fileName.endsWith(".js")) {
          const path = fileName.split("-")[0] + ".html";
          const page = path.split("/").pop();

          if (!page) return;

          // Vue specific fix
          if (page === "runtime.html") return;

          this.emitFile({
            type: "asset",
            fileName: page,
            source: code.html(fileName, page, config),
          });
        }
      }
    },
  };
}
