// vite.config.ts
import { defineConfig } from "file:///home/vc/Documents/vite-multipage/examples/basic/node_modules/.pnpm/vite@5.1.6/node_modules/vite/dist/node/index.js";

// ../../src/index.ts
import { normalizePath } from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/vite@5.1.6_@types+node@20.11.27/node_modules/vite/dist/node/index.js";
import glob from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/fast-glob@3.3.2/node_modules/fast-glob/out/index.js";

// ../../src/code.ts
import { minify } from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/html-minifier-terser@7.2.0/node_modules/html-minifier-terser/src/htmlminifier.js";
var code_default = {
  async svelte(file, config) {
    const result = await minify(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module">
            import App from '${file}';
            const app = new App({ target: document.getElementById('app'), });
            export default app;
          </script>
        </body>
      </html>
    `,
      {
        collapseWhitespace: config?.minify?.collapseWhitespace || true,
        removeComments: config?.minify?.removeComments || true
      }
    );
    return result;
  },
  async vue(file, config) {
    const result = await minify(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module">
            import { createApp } from 'vue';
            import App from '${file}';
            createApp(App).mount('#app');
          </script>
        </body>
      </html>
    `,
      {
        collapseWhitespace: config?.minify?.collapseWhitespace || true,
        removeComments: config?.minify?.removeComments || true
      }
    );
    return result;
  },
  async react(file, config) {
    const result = await minify(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module">
            import React from 'react';
            import ReactDOM from 'react-dom/client';
            import App from '${file}';

            ReactDOM.createRoot(document.getElementById('app')).render(
              "<React.StrictMode><App /></React.StrictMode>"
            );
          </script>
        </body>
      </html>
    `,
      {
        collapseWhitespace: config?.minify?.collapseWhitespace || true,
        removeComments: config?.minify?.removeComments || true
      }
    );
    return result;
  }
};

// ../../src/index.ts
import { dirname, resolve } from "path";

// ../../src/server/create.ts
import fs from "fs";
import mime from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/mime@4.0.1/node_modules/mime/dist/src/index.js";

// ../../src/server/hot.ts
import { exec } from "child_process";
var hotupdate = () => {
  exec("npx vite build --mode development", (err) => {
    if (err) {
      console.error(err);
      return;
    }
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    console.log(
      `\x1B[2m${timestamp}\x1B[32m [vite-plugin-multip]\x1B[0m Build completed`
    );
  });
};

// ../../src/server/create.ts
var createServer = (server) => {
  hotupdate();
  server.middlewares.use((req, res) => {
    if (!req.url)
      return;
    if (!/\.[a-z]+$/.test(req.url)) {
      return res.end(fs.readFileSync(`dist${req.url}/index.html`));
    }
    const ext = req.url.split(".").pop() || "";
    res.setHeader("Content-Type", mime.getType(ext) || "text/plain");
    return res.end(fs.readFileSync(`dist${req.url}`));
  });
};

// ../../src/index.ts
var multipage = (config) => {
  const root = config?.directory || "src/pages";
  let framework = "";
  return {
    name: "vite-plugin-multi-page",
    config: () => {
      const pages = glob.sync("**/*.{svelte,vue,tsx,jsx}", {
        cwd: root,
        onlyFiles: true
      });
      const entries = pages.map((page, i) => {
        if (i === 0 && !framework)
          framework = page.split(".").pop() || "";
        const name = dirname(page);
        if (name === "." || !name)
          return "index";
        return name;
      });
      const input = entries.reduce((acc, page) => {
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
        appType: "custom",
        build: {
          outDir: "dist",
          rollupOptions: {
            input,
            output: {
              format: "es",
              strict: false,
              entryFileNames: "assets/[name]-[hash].js",
              dir: "dist/"
            }
          }
        }
      };
    },
    resolveId(id) {
      return id.includes("index.html") ? id : null;
    },
    async load(id) {
      if (framework === "")
        throw new Error("Framework not found");
      const fileName = "index.html";
      if (!id.endsWith(fileName))
        return null;
      id = normalizePath(id);
      const page = id.replace(fileName, `index.${framework}`);
      if (framework === "svelte") {
        return await code_default.svelte(page);
      } else if (framework === "vue") {
        return await code_default.vue(page);
      } else if (framework === "tsx" || framework === "jsx") {
        return await code_default.react(page);
      }
    },
    configureServer: createServer,
    handleHotUpdate: hotupdate
  };
};

// vite.config.ts
import { svelte } from "file:///home/vc/Documents/vite-multipage/examples/basic/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@3.0.2_svelte@4.2.12_vite@5.1.6/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
var vite_config_default = defineConfig({
  plugins: [
    svelte(),
    multipage({
      page: {
        title: "My Page"
        // Or () => "Page" 
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vc3JjL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jb2RlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvaG90LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2Jhc2ljXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2UvZXhhbXBsZXMvYmFzaWMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2Jhc2ljL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IG11bHRpcGFnZSB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBtdWx0aXBhZ2Uoe1xuICAgICAgcGFnZToge1xuICAgICAgICB0aXRsZTogXCJNeSBQYWdlXCIsIC8vIE9yICgpID0+IFwiUGFnZVwiIFxuICAgICAgfVxuICAgIH0pXG4gIF0sXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvaW5kZXgudHNcIjtpbXBvcnQgeyBub3JtYWxpemVQYXRoLCB0eXBlIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgZ2xvYiBmcm9tIFwiZmFzdC1nbG9iXCI7XG5pbXBvcnQgY29kZSBmcm9tIFwiLi9jb2RlXCI7XG5pbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gXCIuL3NlcnZlci9jcmVhdGVcIjtcbmltcG9ydCB7IGhvdHVwZGF0ZSB9IGZyb20gXCIuL3NlcnZlci9ob3RcIjtcblxuZXhwb3J0IGNvbnN0IG11bHRpcGFnZSA9IChjb25maWc/OiBDb25maWcpOiBQbHVnaW4gPT4ge1xuICBjb25zdCByb290ID0gY29uZmlnPy5kaXJlY3RvcnkgfHwgXCJzcmMvcGFnZXNcIjtcbiAgbGV0IGZyYW1ld29yayA9IFwiXCI7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLW11bHRpLXBhZ2VcIixcbiAgICBjb25maWc6ICgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VzID0gZ2xvYi5zeW5jKFwiKiovKi57c3ZlbHRlLHZ1ZSx0c3gsanN4fVwiLCB7XG4gICAgICAgIGN3ZDogcm9vdCxcbiAgICAgICAgb25seUZpbGVzOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVudHJpZXMgPSBwYWdlcy5tYXAoKHBhZ2UsIGkpID0+IHtcbiAgICAgICAgLy8gR2V0IGZyYW1ld29yayBmcm9tIGZpbGUgZXh0ZW5zaW9uXG4gICAgICAgIGlmIChpID09PSAwICYmICFmcmFtZXdvcmspIGZyYW1ld29yayA9IHBhZ2Uuc3BsaXQoXCIuXCIpLnBvcCgpIHx8IFwiXCI7XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IGRpcm5hbWUocGFnZSk7XG5cbiAgICAgICAgaWYgKG5hbWUgPT09IFwiLlwiIHx8ICFuYW1lKSByZXR1cm4gXCJpbmRleFwiO1xuXG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGlucHV0ID0gZW50cmllcy5yZWR1Y2UoKGFjYzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiwgcGFnZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IFwiaW5kZXguaHRtbFwiO1xuXG4gICAgICAgIGlmIChwYWdlID09PSBcImluZGV4XCIpIHtcbiAgICAgICAgICBhY2NbcGFnZV0gPSByZXNvbHZlKHJvb3QsIGZpbGVOYW1lKTtcbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9XG5cbiAgICAgICAgYWNjW3BhZ2VdID0gcmVzb2x2ZShyb290LCBwYWdlLCBmaWxlTmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgIH0sIHt9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcm9vdCxcbiAgICAgICAgYXBwVHlwZTogXCJjdXN0b21cIixcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgIGZvcm1hdDogXCJlc1wiLFxuICAgICAgICAgICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICAgICAgICBkaXI6IFwiZGlzdC9cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgcmV0dXJuIGlkLmluY2x1ZGVzKFwiaW5kZXguaHRtbFwiKSA/IGlkIDogbnVsbDtcbiAgICB9LFxuXG4gICAgYXN5bmMgbG9hZChpZCkge1xuICAgICAgaWYgKGZyYW1ld29yayA9PT0gXCJcIikgdGhyb3cgbmV3IEVycm9yKFwiRnJhbWV3b3JrIG5vdCBmb3VuZFwiKTtcblxuICAgICAgY29uc3QgZmlsZU5hbWUgPSBcImluZGV4Lmh0bWxcIjtcblxuICAgICAgaWYgKCFpZC5lbmRzV2l0aChmaWxlTmFtZSkpIHJldHVybiBudWxsO1xuXG4gICAgICBpZCA9IG5vcm1hbGl6ZVBhdGgoaWQpO1xuXG4gICAgICBjb25zdCBwYWdlID0gaWQucmVwbGFjZShmaWxlTmFtZSwgYGluZGV4LiR7ZnJhbWV3b3JrfWApO1xuXG4gICAgICBpZiAoZnJhbWV3b3JrID09PSBcInN2ZWx0ZVwiKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb2RlLnN2ZWx0ZShwYWdlKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWV3b3JrID09PSBcInZ1ZVwiKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb2RlLnZ1ZShwYWdlKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWV3b3JrID09PSBcInRzeFwiIHx8IGZyYW1ld29yayA9PT0gXCJqc3hcIikge1xuICAgICAgICByZXR1cm4gYXdhaXQgY29kZS5yZWFjdChwYWdlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29uZmlndXJlU2VydmVyOiBjcmVhdGVTZXJ2ZXIsXG4gICAgaGFuZGxlSG90VXBkYXRlOiBob3R1cGRhdGUsXG4gIH07XG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2NvZGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9jb2RlLnRzXCI7aW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgbWluaWZ5IH0gZnJvbSBcImh0bWwtbWluaWZpZXItdGVyc2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYXN5bmMgc3ZlbHRlKGZpbGU6IHN0cmluZywgY29uZmlnPzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtaW5pZnkoXG4gICAgICBgXG4gICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCIgLz5cbiAgICAgICAgICA8dGl0bGU+PC90aXRsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgICA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+XG4gICAgICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XG4gICAgICAgICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuICAgICAgICAgICAgY29uc3QgYXBwID0gbmV3IEFwcCh7IHRhcmdldDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpLCB9KTtcbiAgICAgICAgICAgIGV4cG9ydCBkZWZhdWx0IGFwcDtcbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9ib2R5PlxuICAgICAgPC9odG1sPlxuICAgIGAsXG4gICAgICB7XG4gICAgICAgIGNvbGxhcHNlV2hpdGVzcGFjZTogY29uZmlnPy5taW5pZnk/LmNvbGxhcHNlV2hpdGVzcGFjZSB8fCB0cnVlLFxuICAgICAgICByZW1vdmVDb21tZW50czogY29uZmlnPy5taW5pZnk/LnJlbW92ZUNvbW1lbnRzIHx8IHRydWUsXG4gICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgYXN5bmMgdnVlKGZpbGU6IHN0cmluZywgY29uZmlnPzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtaW5pZnkoXG4gICAgICBgXG4gICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCIgLz5cbiAgICAgICAgICA8dGl0bGU+PC90aXRsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgICA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+XG4gICAgICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XG4gICAgICAgICAgICBpbXBvcnQgeyBjcmVhdGVBcHAgfSBmcm9tICd2dWUnO1xuICAgICAgICAgICAgaW1wb3J0IEFwcCBmcm9tICcke2ZpbGV9JztcbiAgICAgICAgICAgIGNyZWF0ZUFwcChBcHApLm1vdW50KCcjYXBwJyk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICAgIDwvaHRtbD5cbiAgICBgLFxuICAgICAge1xuICAgICAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IGNvbmZpZz8ubWluaWZ5Py5jb2xsYXBzZVdoaXRlc3BhY2UgfHwgdHJ1ZSxcbiAgICAgICAgcmVtb3ZlQ29tbWVudHM6IGNvbmZpZz8ubWluaWZ5Py5yZW1vdmVDb21tZW50cyB8fCB0cnVlLFxuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIGFzeW5jIHJlYWN0KGZpbGU6IHN0cmluZywgY29uZmlnPzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtaW5pZnkoXG4gICAgICBgXG4gICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCIgLz5cbiAgICAgICAgICA8dGl0bGU+PC90aXRsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgICA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+XG4gICAgICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XG4gICAgICAgICAgICBpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuICAgICAgICAgICAgaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnO1xuICAgICAgICAgICAgaW1wb3J0IEFwcCBmcm9tICcke2ZpbGV9JztcblxuICAgICAgICAgICAgUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykpLnJlbmRlcihcbiAgICAgICAgICAgICAgXCI8UmVhY3QuU3RyaWN0TW9kZT48QXBwIC8+PC9SZWFjdC5TdHJpY3RNb2RlPlwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgICA8L2h0bWw+XG4gICAgYCxcbiAgICAgIHtcbiAgICAgICAgY29sbGFwc2VXaGl0ZXNwYWNlOiBjb25maWc/Lm1pbmlmeT8uY29sbGFwc2VXaGl0ZXNwYWNlIHx8IHRydWUsXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzOiBjb25maWc/Lm1pbmlmeT8ucmVtb3ZlQ29tbWVudHMgfHwgdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9jcmVhdGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzXCI7aW1wb3J0IHR5cGUgeyBWaXRlRGV2U2VydmVyIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBtaW1lIGZyb20gXCJtaW1lXCI7XG5pbXBvcnQgeyBob3R1cGRhdGUgfSBmcm9tIFwiLi9ob3RcIjtcblxuLy8gVGhpcyBmZWF0dXJlIGlzIGluIGJldGEsIHNvIGl0IG1heSBub3Qgd29yayBhcyBleHBlY3RlZFxuLy8gSSBob3BlIEknbGwgZmluZCBhIGJldHRlciB3YXkgdG8gZG8gdGhpc1xuLy8gQXMgdG9kYXksIGRldiBzZXJ2ZXIgZG8gdGhlIHNhbWUgdGhpbmcgYXMgcHJldmlldyBzZXJ2ZXJcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlcnZlciA9IChzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpID0+IHtcbiAgaG90dXBkYXRlKCk7XG5cbiAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMpID0+IHtcbiAgICBpZiAoIXJlcS51cmwpIHJldHVybjtcblxuICAgIGlmICghL1xcLlthLXpdKyQvLnRlc3QocmVxLnVybCkpIHtcbiAgICAgIHJldHVybiByZXMuZW5kKGZzLnJlYWRGaWxlU3luYyhgZGlzdCR7cmVxLnVybH0vaW5kZXguaHRtbGApKTtcbiAgICB9XG5cbiAgICBjb25zdCBleHQgPSByZXEudXJsLnNwbGl0KFwiLlwiKS5wb3AoKSB8fCBcIlwiO1xuXG4gICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBtaW1lLmdldFR5cGUoZXh0KSB8fCBcInRleHQvcGxhaW5cIik7XG4gICAgcmV0dXJuIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGBkaXN0JHtyZXEudXJsfWApKTtcbiAgfSk7XG59OztcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyL2hvdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9ob3QudHNcIjtpbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcblxuZXhwb3J0IGNvbnN0IGhvdHVwZGF0ZSA9ICgpID0+IHtcbiAgZXhlYyhcIm5weCB2aXRlIGJ1aWxkIC0tbW9kZSBkZXZlbG9wbWVudFwiLCAoZXJyKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBgXFx4MWJbMm0ke3RpbWVzdGFtcH1cXHgxYlszMm0gW3ZpdGUtcGx1Z2luLW11bHRpcF1cXHgxYlswbSBCdWlsZCBjb21wbGV0ZWRgXG4gICAgKTtcbiAgfSk7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLG9CQUFvQjs7O0FDQTFFLFNBQVMscUJBQWtDO0FBRWhVLE9BQU8sVUFBVTs7O0FDRGpCLFNBQVMsY0FBYztBQUV2QixJQUFPLGVBQVE7QUFBQSxFQUNiLE1BQU0sT0FBTyxNQUFjLFFBQWtDO0FBQzNELFVBQU0sU0FBUyxNQUFNO0FBQUEsTUFDbkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLCtCQVd5QixJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFPN0I7QUFBQSxRQUNFLG9CQUFvQixRQUFRLFFBQVEsc0JBQXNCO0FBQUEsUUFDMUQsZ0JBQWdCLFFBQVEsUUFBUSxrQkFBa0I7QUFBQSxNQUNwRDtBQUFBLElBQ0Y7QUFFQSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBTSxJQUFJLE1BQWMsUUFBa0M7QUFDeEQsVUFBTSxTQUFTLE1BQU07QUFBQSxNQUNuQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFZeUIsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU03QjtBQUFBLFFBQ0Usb0JBQW9CLFFBQVEsUUFBUSxzQkFBc0I7QUFBQSxRQUMxRCxnQkFBZ0IsUUFBUSxRQUFRLGtCQUFrQjtBQUFBLE1BQ3BEO0FBQUEsSUFDRjtBQUVBLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLE1BQU0sTUFBYyxRQUFrQztBQUMxRCxVQUFN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
