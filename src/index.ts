import { normalizePath, type Plugin } from "vite";
import type { Config } from "./types";
import glob from "tiny-glob";
import { generateBoilerplate } from "./boilerplate";
import { dirname, resolve } from "path";
import { createServer } from "./server/create";
import { hotupdate } from "./server/hot";

export const multipage = (config?: Config): Plugin => {
  const root = config?.directory || "src/pages";
  let framework = config?.framework || "";

  return {
    name: "vite-plugin-multi-page",
    async config() {
      const pages = await glob("**/*.{svelte,vue,tsx,jsx}", {
        cwd: root,
        filesOnly: true,
      });

      const entries = pages.map((page) => {
        // Get framework from file extension
        if (!framework) framework = page.split(".").pop() || "";

        const name = dirname(page);

        if (name === "." || !name) return "index";

        return name;
      });

      const input = entries.reduce((acc: Record<string, string>, page) => {
        const fileName = "index.html";

        if (page === "index") {
          acc[page] = resolve(root, fileName);
          return acc;
        }

        acc[page] = resolve(root, page, fileName);

        return acc;
      }, {});

      return {
        root,
        build: {
          rollupOptions: {
            input,
          },
        },
      };
    },

    resolveId(id) {
      return id.includes("index.html") ? id : null;
    },

    async load(id) {
      if (framework === "") throw new Error("Framework not found");

      const fileName = "index.html";

      if (!id.endsWith(fileName)) return null;

      id = normalizePath(id);

      const page = id.replace(fileName, `index.${framework}`);

      return await generateBoilerplate(page, framework, config || {})
    },

    configureServer: createServer,
    handleHotUpdate: hotupdate,
  };
};
