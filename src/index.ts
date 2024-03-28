import type { Plugin } from "vite";
import type { Config } from "./types";
import { generateBoilerplate } from "./boilerplate";
import { resolve } from "./utils/resolve";
import { createServer } from "./server/create";
import { hotupdate } from "./server/hot";
import { getLayout } from "./utils/layouts";
import { getInputs } from "./utils/input";
import glob from "tiny-glob";
import copy from "rollup-plugin-copy";
import { getStyles } from "./css/getStyles";

export const multipage = (config?: Config): Plugin => {
  const root = config?.directory || "src/pages";
  const assets = config?.assets || [];
  let framework = config?.framework || "";

  return {
    name: "vite-plugin-multip",
    async config() {
      const pages = await glob("**/*.{svelte,vue,tsx,jsx}", {
        cwd: root,
        filesOnly: true,
      });

      const [input, recognizedFramework] = getInputs(pages, root);

      if (!input) throw new Error("No input found");
      if (!framework) framework = recognizedFramework;

      return {
        root,
        build: {
          outDir: "dist",
          emptyOutDir: true,
          rollupOptions: {
            input,
            output: {
              dir: "dist",
            },
            plugins: [
              copy({
                targets: [{ src: "public/*", dest: "dist/" }, ...assets],
              }),
            ],
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

      id = resolve(id);

      const page = id.replace(fileName, `index.${framework}`);
      const layout = await getLayout(page);
      const css = await getStyles(page.replace(`index.${framework}`, ""));

      return await generateBoilerplate(page, framework, config || {}, layout, css);
    },

    configureServer: createServer,
    handleHotUpdate: hotupdate,
  };
};
