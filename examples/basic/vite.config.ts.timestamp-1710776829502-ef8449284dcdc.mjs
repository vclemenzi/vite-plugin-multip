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
          <script>
            let isOffline = false;
            
            setInterval(() => {
            fetch('/').then(() => {
              if (isOffline) window.location.reload();

              isOffline = false;
            }).catch(() => {
              isOffline = true;
            });
            }, 1000);
          </script>
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vc3JjL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jb2RlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvaG90LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2Jhc2ljXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2UvZXhhbXBsZXMvYmFzaWMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2Jhc2ljL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IG11bHRpcGFnZSB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBtdWx0aXBhZ2Uoe1xuICAgICAgcGFnZToge1xuICAgICAgICB0aXRsZTogXCJNeSBQYWdlXCIsIC8vIE9yICgpID0+IFwiUGFnZVwiIFxuICAgICAgfVxuICAgIH0pXG4gIF0sXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvaW5kZXgudHNcIjtpbXBvcnQgeyBub3JtYWxpemVQYXRoLCB0eXBlIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgZ2xvYiBmcm9tIFwiZmFzdC1nbG9iXCI7XG5pbXBvcnQgY29kZSBmcm9tIFwiLi9jb2RlXCI7XG5pbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gXCIuL3NlcnZlci9jcmVhdGVcIjtcbmltcG9ydCB7IGhvdHVwZGF0ZSB9IGZyb20gXCIuL3NlcnZlci9ob3RcIjtcblxuZXhwb3J0IGNvbnN0IG11bHRpcGFnZSA9IChjb25maWc/OiBDb25maWcpOiBQbHVnaW4gPT4ge1xuICBjb25zdCByb290ID0gY29uZmlnPy5kaXJlY3RvcnkgfHwgXCJzcmMvcGFnZXNcIjtcbiAgbGV0IGZyYW1ld29yayA9IFwiXCI7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLW11bHRpLXBhZ2VcIixcbiAgICBjb25maWc6ICgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VzID0gZ2xvYi5zeW5jKFwiKiovKi57c3ZlbHRlLHZ1ZSx0c3gsanN4fVwiLCB7XG4gICAgICAgIGN3ZDogcm9vdCxcbiAgICAgICAgb25seUZpbGVzOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVudHJpZXMgPSBwYWdlcy5tYXAoKHBhZ2UsIGkpID0+IHtcbiAgICAgICAgLy8gR2V0IGZyYW1ld29yayBmcm9tIGZpbGUgZXh0ZW5zaW9uXG4gICAgICAgIGlmIChpID09PSAwICYmICFmcmFtZXdvcmspIGZyYW1ld29yayA9IHBhZ2Uuc3BsaXQoXCIuXCIpLnBvcCgpIHx8IFwiXCI7XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IGRpcm5hbWUocGFnZSk7XG5cbiAgICAgICAgaWYgKG5hbWUgPT09IFwiLlwiIHx8ICFuYW1lKSByZXR1cm4gXCJpbmRleFwiO1xuXG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGlucHV0ID0gZW50cmllcy5yZWR1Y2UoKGFjYzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiwgcGFnZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IFwiaW5kZXguaHRtbFwiO1xuXG4gICAgICAgIGlmIChwYWdlID09PSBcImluZGV4XCIpIHtcbiAgICAgICAgICBhY2NbcGFnZV0gPSByZXNvbHZlKHJvb3QsIGZpbGVOYW1lKTtcbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9XG5cbiAgICAgICAgYWNjW3BhZ2VdID0gcmVzb2x2ZShyb290LCBwYWdlLCBmaWxlTmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgIH0sIHt9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcm9vdCxcbiAgICAgICAgYXBwVHlwZTogXCJjdXN0b21cIixcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgIGZvcm1hdDogXCJlc1wiLFxuICAgICAgICAgICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICAgICAgICBkaXI6IFwiZGlzdC9cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgcmV0dXJuIGlkLmluY2x1ZGVzKFwiaW5kZXguaHRtbFwiKSA/IGlkIDogbnVsbDtcbiAgICB9LFxuXG4gICAgYXN5bmMgbG9hZChpZCkge1xuICAgICAgaWYgKGZyYW1ld29yayA9PT0gXCJcIikgdGhyb3cgbmV3IEVycm9yKFwiRnJhbWV3b3JrIG5vdCBmb3VuZFwiKTtcblxuICAgICAgY29uc3QgZmlsZU5hbWUgPSBcImluZGV4Lmh0bWxcIjtcblxuICAgICAgaWYgKCFpZC5lbmRzV2l0aChmaWxlTmFtZSkpIHJldHVybiBudWxsO1xuXG4gICAgICBpZCA9IG5vcm1hbGl6ZVBhdGgoaWQpO1xuXG4gICAgICBjb25zdCBwYWdlID0gaWQucmVwbGFjZShmaWxlTmFtZSwgYGluZGV4LiR7ZnJhbWV3b3JrfWApO1xuXG4gICAgICBpZiAoZnJhbWV3b3JrID09PSBcInN2ZWx0ZVwiKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb2RlLnN2ZWx0ZShwYWdlKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWV3b3JrID09PSBcInZ1ZVwiKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb2RlLnZ1ZShwYWdlKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWV3b3JrID09PSBcInRzeFwiIHx8IGZyYW1ld29yayA9PT0gXCJqc3hcIikge1xuICAgICAgICByZXR1cm4gYXdhaXQgY29kZS5yZWFjdChwYWdlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29uZmlndXJlU2VydmVyOiBjcmVhdGVTZXJ2ZXIsXG4gICAgaGFuZGxlSG90VXBkYXRlOiBob3R1cGRhdGUsXG4gIH07XG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2NvZGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9jb2RlLnRzXCI7aW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgbWluaWZ5IH0gZnJvbSBcImh0bWwtbWluaWZpZXItdGVyc2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYXN5bmMgc3ZlbHRlKGZpbGU6IHN0cmluZywgY29uZmlnPzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtaW5pZnkoXG4gICAgICBgXG4gICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCIgLz5cbiAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgbGV0IGlzT2ZmbGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBmZXRjaCgnLycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoaXNPZmZsaW5lKSB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cbiAgICAgICAgICAgICAgaXNPZmZsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGlzT2ZmbGluZSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgICAgICAgIGltcG9ydCBBcHAgZnJvbSAnJHtmaWxlfSc7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKHsgdGFyZ2V0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyksIH0pO1xuICAgICAgICAgICAgZXhwb3J0IGRlZmF1bHQgYXBwO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgICA8L2h0bWw+XG4gICAgYCxcbiAgICAgIHtcbiAgICAgICAgY29sbGFwc2VXaGl0ZXNwYWNlOiBjb25maWc/Lm1pbmlmeT8uY29sbGFwc2VXaGl0ZXNwYWNlIHx8IHRydWUsXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzOiBjb25maWc/Lm1pbmlmeT8ucmVtb3ZlQ29tbWVudHMgfHwgdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBhc3luYyB2dWUoZmlsZTogc3RyaW5nLCBjb25maWc/OiBDb25maWcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG1pbmlmeShcbiAgICAgIGBcbiAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgIDxoZWFkPlxuICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcIiAvPlxuICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgICAgICAgIGltcG9ydCB7IGNyZWF0ZUFwcCB9IGZyb20gJ3Z1ZSc7XG4gICAgICAgICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuICAgICAgICAgICAgY3JlYXRlQXBwKEFwcCkubW91bnQoJyNhcHAnKTtcbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9ib2R5PlxuICAgICAgPC9odG1sPlxuICAgIGAsXG4gICAgICB7XG4gICAgICAgIGNvbGxhcHNlV2hpdGVzcGFjZTogY29uZmlnPy5taW5pZnk/LmNvbGxhcHNlV2hpdGVzcGFjZSB8fCB0cnVlLFxuICAgICAgICByZW1vdmVDb21tZW50czogY29uZmlnPy5taW5pZnk/LnJlbW92ZUNvbW1lbnRzIHx8IHRydWUsXG4gICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgYXN5bmMgcmVhY3QoZmlsZTogc3RyaW5nLCBjb25maWc/OiBDb25maWcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG1pbmlmeShcbiAgICAgIGBcbiAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgIDxoZWFkPlxuICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcIiAvPlxuICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgICAgICAgIGltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG4gICAgICAgICAgICBpbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG4gICAgICAgICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuXG4gICAgICAgICAgICBSZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSkucmVuZGVyKFxuICAgICAgICAgICAgICBcIjxSZWFjdC5TdHJpY3RNb2RlPjxBcHAgLz48L1JlYWN0LlN0cmljdE1vZGU+XCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICAgIDwvaHRtbD5cbiAgICBgLFxuICAgICAge1xuICAgICAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IGNvbmZpZz8ubWluaWZ5Py5jb2xsYXBzZVdoaXRlc3BhY2UgfHwgdHJ1ZSxcbiAgICAgICAgcmVtb3ZlQ29tbWVudHM6IGNvbmZpZz8ubWluaWZ5Py5yZW1vdmVDb21tZW50cyB8fCB0cnVlLFxuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyL2NyZWF0ZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9jcmVhdGUudHNcIjtpbXBvcnQgdHlwZSB7IFZpdGVEZXZTZXJ2ZXIgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IG1pbWUgZnJvbSBcIm1pbWVcIjtcbmltcG9ydCB7IGhvdHVwZGF0ZSB9IGZyb20gXCIuL2hvdFwiO1xuXG4vLyBUaGlzIGZlYXR1cmUgaXMgaW4gYmV0YSwgc28gaXQgbWF5IG5vdCB3b3JrIGFzIGV4cGVjdGVkXG4vLyBJIGhvcGUgSSdsbCBmaW5kIGEgYmV0dGVyIHdheSB0byBkbyB0aGlzXG4vLyBBcyB0b2RheSwgZGV2IHNlcnZlciBkbyB0aGUgc2FtZSB0aGluZyBhcyBwcmV2aWV3IHNlcnZlclxuXG5leHBvcnQgY29uc3QgY3JlYXRlU2VydmVyID0gKHNlcnZlcjogVml0ZURldlNlcnZlcikgPT4ge1xuICBob3R1cGRhdGUoKTtcblxuICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcykgPT4ge1xuICAgIGlmICghcmVxLnVybCkgcmV0dXJuO1xuXG4gICAgaWYgKCEvXFwuW2Etel0rJC8udGVzdChyZXEudXJsKSkge1xuICAgICAgcmV0dXJuIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGBkaXN0JHtyZXEudXJsfS9pbmRleC5odG1sYCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dCA9IHJlcS51cmwuc3BsaXQoXCIuXCIpLnBvcCgpIHx8IFwiXCI7XG5cbiAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIG1pbWUuZ2V0VHlwZShleHQpIHx8IFwidGV4dC9wbGFpblwiKTtcbiAgICByZXR1cm4gcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoYGRpc3Qke3JlcS51cmx9YCkpO1xuICB9KTtcbn07O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXIvaG90LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyL2hvdC50c1wiO2ltcG9ydCB7IGV4ZWMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuXG5leHBvcnQgY29uc3QgaG90dXBkYXRlID0gKCkgPT4ge1xuICBleGVjKFwibnB4IHZpdGUgYnVpbGQgLS1tb2RlIGRldmVsb3BtZW50XCIsIChlcnIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBcXHgxYlsybSR7dGltZXN0YW1wfVxceDFiWzMybSBbdml0ZS1wbHVnaW4tbXVsdGlwXVxceDFiWzBtIEJ1aWxkIGNvbXBsZXRlZGBcbiAgICApO1xuICB9KTtcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtVLFNBQVMsb0JBQW9COzs7QUNBMUUsU0FBUyxxQkFBa0M7QUFFaFUsT0FBTyxVQUFVOzs7QUNEakIsU0FBUyxjQUFjO0FBRXZCLElBQU8sZUFBUTtBQUFBLEVBQ2IsTUFBTSxPQUFPLE1BQWMsUUFBa0M7QUFDM0QsVUFBTSxTQUFTLE1BQU07QUFBQSxNQUNuQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkF3QnlCLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU83QjtBQUFBLFFBQ0Us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
