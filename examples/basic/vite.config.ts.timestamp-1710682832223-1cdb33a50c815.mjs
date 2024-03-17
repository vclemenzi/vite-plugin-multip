// vite.config.ts
import { defineConfig } from "file:///home/vc/Documents/vite-multipage/examples/basic/node_modules/.pnpm/vite@5.1.6/node_modules/vite/dist/node/index.js";

// ../../src/index.ts
import { normalizePath } from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/vite@5.1.6_@types+node@20.11.27/node_modules/vite/dist/node/index.js";
import glob from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/fast-glob@3.3.2/node_modules/fast-glob/out/index.js";

// ../../src/code.ts
import { minify } from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/html-minifier-terser@7.2.0/node_modules/html-minifier-terser/src/htmlminifier.js";
var code_default = {
  async svelte(file, config) {
    const result = await minify(`
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
    `, {
      collapseWhitespace: config?.minify?.collapseWhitespace || true,
      removeComments: config?.minify?.removeComments || true
    });
    return result;
  },
  async vue(file, config) {
    const result = await minify(`
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
    `, {
      collapseWhitespace: config?.minify?.collapseWhitespace || true,
      removeComments: config?.minify?.removeComments || true
    });
    return result;
  },
  async react(file, config) {
    const result = await minify(`
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
    `, {
      collapseWhitespace: config?.minify?.collapseWhitespace || true,
      removeComments: config?.minify?.removeComments || true
    });
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
  exec("npx vite build", (err) => {
    if (err) {
      console.error(err);
      return;
    }
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    console.log(`\x1B[2m${timestamp}\x1B[32m\x1B[2m [vite-plugin-multip]\x1B[0m Build completed`);
  });
};

// ../../src/server/create.ts
var createServer = (server) => {
  hotupdate();
  server.middlewares.use((req, res) => {
    if (!req.url)
      return;
    res.setHeader("Cache-Control", "public, max-age=31536000");
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
          acc["main"] = resolve(root, fileName);
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
              entryFileNames: "[name]-[hash].js",
              dir: "dist/"
            }
          }
        }
      };
    },
    resolveId(id) {
      const fileName = "index.html";
      return id.includes(fileName) ? id : null;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vc3JjL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jb2RlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvaG90LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2Jhc2ljXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2UvZXhhbXBsZXMvYmFzaWMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2Jhc2ljL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IG11bHRpcGFnZSB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBtdWx0aXBhZ2Uoe1xuICAgICAgcGFnZToge1xuICAgICAgICB0aXRsZTogXCJNeSBQYWdlXCIsIC8vIE9yICgpID0+IFwiUGFnZVwiIFxuICAgICAgfVxuICAgIH0pXG4gIF0sXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvaW5kZXgudHNcIjtpbXBvcnQgeyBub3JtYWxpemVQYXRoLCB0eXBlIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIlxuaW1wb3J0IGdsb2IgZnJvbSBcImZhc3QtZ2xvYlwiXG5pbXBvcnQgY29kZSBmcm9tIFwiLi9jb2RlXCJcbmltcG9ydCB7IGRpcm5hbWUsIHJlc29sdmUgfSBmcm9tIFwicGF0aFwiXG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tIFwiLi9zZXJ2ZXIvY3JlYXRlXCJcbmltcG9ydCB7IGhvdHVwZGF0ZSB9IGZyb20gXCIuL3NlcnZlci9ob3RcIlxuXG5leHBvcnQgY29uc3QgbXVsdGlwYWdlID0gKGNvbmZpZz86IENvbmZpZyk6IFBsdWdpbiA9PiB7XG4gIGNvbnN0IHJvb3QgPSBjb25maWc/LmRpcmVjdG9yeSB8fCBcInNyYy9wYWdlc1wiXG4gIGxldCBmcmFtZXdvcmsgPSBcIlwiXG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLW11bHRpLXBhZ2VcIixcbiAgICBjb25maWc6ICgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VzID0gZ2xvYi5zeW5jKFwiKiovKi57c3ZlbHRlLHZ1ZSx0c3gsanN4fVwiLCB7XG4gICAgICAgIGN3ZDogcm9vdCxcbiAgICAgICAgb25seUZpbGVzOiB0cnVlLFxuICAgICAgfSlcblxuICAgICAgY29uc3QgZW50cmllcyA9IHBhZ2VzLm1hcCgocGFnZSwgaSkgPT4ge1xuICAgICAgICAvLyBHZXQgZnJhbWV3b3JrIGZyb20gZmlsZSBleHRlbnNpb25cbiAgICAgICAgaWYgKGkgPT09IDAgJiYgIWZyYW1ld29yaykgZnJhbWV3b3JrID0gcGFnZS5zcGxpdChcIi5cIikucG9wKCkgfHwgXCJcIlxuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBkaXJuYW1lKHBhZ2UpXG5cbiAgICAgICAgaWYgKG5hbWUgPT09IFwiLlwiIHx8ICFuYW1lKSByZXR1cm4gXCJpbmRleFwiXG5cbiAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGlucHV0ID0gZW50cmllcy5yZWR1Y2UoKGFjYzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiwgcGFnZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IFwiaW5kZXguaHRtbFwiO1xuXG4gICAgICAgIGlmIChwYWdlID09PSBcImluZGV4XCIpIHtcbiAgICAgICAgICBhY2NbXCJtYWluXCJdID0gcmVzb2x2ZShyb290LCBmaWxlTmFtZSlcbiAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgIH1cblxuICAgICAgICBhY2NbcGFnZV0gPSByZXNvbHZlKHJvb3QsIHBhZ2UsIGZpbGVOYW1lKVxuXG4gICAgICAgIHJldHVybiBhY2NcbiAgICAgIH0sIHt9KVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByb290LFxuICAgICAgICBhcHBUeXBlOiBcImN1c3RvbVwiLFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgZm9ybWF0OiAnZXMnLFxuICAgICAgICAgICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJbbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgICAgIGRpcjogJ2Rpc3QvJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBcImluZGV4Lmh0bWxcIjtcblxuICAgICAgcmV0dXJuIGlkLmluY2x1ZGVzKGZpbGVOYW1lKSA/IGlkIDogbnVsbFxuICAgIH0sXG5cbiAgICBhc3luYyBsb2FkKGlkKSB7XG4gICAgICBpZiAoZnJhbWV3b3JrID09PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IoXCJGcmFtZXdvcmsgbm90IGZvdW5kXCIpXG5cbiAgICAgIGNvbnN0IGZpbGVOYW1lID0gXCJpbmRleC5odG1sXCI7XG5cbiAgICAgIGlmICghaWQuZW5kc1dpdGgoZmlsZU5hbWUpKSByZXR1cm4gbnVsbFxuXG4gICAgICBpZCA9IG5vcm1hbGl6ZVBhdGgoaWQpXG5cbiAgICAgIGNvbnN0IHBhZ2UgPSBpZC5yZXBsYWNlKGZpbGVOYW1lLCBgaW5kZXguJHtmcmFtZXdvcmt9YClcblxuICAgICAgaWYgKGZyYW1ld29yayA9PT0gXCJzdmVsdGVcIikge1xuICAgICAgICByZXR1cm4gYXdhaXQgY29kZS5zdmVsdGUocGFnZSlcbiAgICAgIH0gZWxzZSBpZiAoZnJhbWV3b3JrID09PSBcInZ1ZVwiKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb2RlLnZ1ZShwYWdlKVxuICAgICAgfSBlbHNlIGlmIChmcmFtZXdvcmsgPT09IFwidHN4XCIgfHwgZnJhbWV3b3JrID09PSBcImpzeFwiKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjb2RlLnJlYWN0KHBhZ2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb25maWd1cmVTZXJ2ZXI6IGNyZWF0ZVNlcnZlcixcbiAgICBoYW5kbGVIb3RVcGRhdGU6IGhvdHVwZGF0ZSxcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2NvZGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9jb2RlLnRzXCI7aW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tIFwiLi90eXBlc1wiXG5pbXBvcnQgeyBtaW5pZnkgfSBmcm9tIFwiaHRtbC1taW5pZmllci10ZXJzZXJcIlxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFzeW5jIHN2ZWx0ZShmaWxlOiBzdHJpbmcsIGNvbmZpZz86IENvbmZpZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWluaWZ5KGBcbiAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgIDxoZWFkPlxuICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcIiAvPlxuICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgICAgICAgIGltcG9ydCBBcHAgZnJvbSAnJHtmaWxlfSc7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKHsgdGFyZ2V0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyksIH0pO1xuICAgICAgICAgICAgZXhwb3J0IGRlZmF1bHQgYXBwO1xuICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8L2JvZHk+XG4gICAgICA8L2h0bWw+XG4gICAgYCwge1xuICAgICAgY29sbGFwc2VXaGl0ZXNwYWNlOiBjb25maWc/Lm1pbmlmeT8uY29sbGFwc2VXaGl0ZXNwYWNlIHx8IHRydWUsXG4gICAgICByZW1vdmVDb21tZW50czogY29uZmlnPy5taW5pZnk/LnJlbW92ZUNvbW1lbnRzIHx8IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIGFzeW5jIHZ1ZShmaWxlOiBzdHJpbmcsIGNvbmZpZz86IENvbmZpZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWluaWZ5KGBcbiAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgIDxoZWFkPlxuICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcIiAvPlxuICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgICAgICAgIGltcG9ydCB7IGNyZWF0ZUFwcCB9IGZyb20gJ3Z1ZSc7XG4gICAgICAgICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuICAgICAgICAgICAgY3JlYXRlQXBwKEFwcCkubW91bnQoJyNhcHAnKTtcbiAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgPC9ib2R5PlxuICAgICAgPC9odG1sPlxuICAgIGAsIHtcbiAgICAgIGNvbGxhcHNlV2hpdGVzcGFjZTogY29uZmlnPy5taW5pZnk/LmNvbGxhcHNlV2hpdGVzcGFjZSB8fCB0cnVlLFxuICAgICAgcmVtb3ZlQ29tbWVudHM6IGNvbmZpZz8ubWluaWZ5Py5yZW1vdmVDb21tZW50cyB8fCB0cnVlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBhc3luYyByZWFjdChmaWxlOiBzdHJpbmcsIGNvbmZpZz86IENvbmZpZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWluaWZ5KGBcbiAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgPGh0bWwgbGFuZz1cImVuXCI+XG4gICAgICAgIDxoZWFkPlxuICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcIiAvPlxuICAgICAgICAgIDx0aXRsZT48L3RpdGxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgICAgICAgIGltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG4gICAgICAgICAgICBpbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG4gICAgICAgICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuXG4gICAgICAgICAgICBSZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSkucmVuZGVyKFxuICAgICAgICAgICAgICBcIjxSZWFjdC5TdHJpY3RNb2RlPjxBcHAgLz48L1JlYWN0LlN0cmljdE1vZGU+XCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgIDwvYm9keT5cbiAgICAgIDwvaHRtbD5cbiAgICBgLCB7XG4gICAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IGNvbmZpZz8ubWluaWZ5Py5jb2xsYXBzZVdoaXRlc3BhY2UgfHwgdHJ1ZSxcbiAgICAgIHJlbW92ZUNvbW1lbnRzOiBjb25maWc/Lm1pbmlmeT8ucmVtb3ZlQ29tbWVudHMgfHwgdHJ1ZSxcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG59O1xuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9jcmVhdGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzXCI7aW1wb3J0IHR5cGUgeyBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG1pbWUgZnJvbSAnbWltZSc7XG5pbXBvcnQgeyBob3R1cGRhdGUgfSBmcm9tICcuL2hvdCc7XG5cbi8vIFRoaXMgZmVhdHVyZSBpcyBpbiBiZXRhLCBzbyBpdCBtYXkgbm90IHdvcmsgYXMgZXhwZWN0ZWRcbi8vIEkgaG9wZSBJJ2xsIGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXNcbi8vIEFzIHRvZGF5LCBkZXYgc2VydmVyIGRvIHRoZSBzYW1lIHRoaW5nIGFzIHByZXZpZXcgc2VydmVyXG5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXJ2ZXIgPSAoc2VydmVyOiBWaXRlRGV2U2VydmVyKSA9PiB7XG4gIGhvdHVwZGF0ZSgpO1xuXG4gIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzKSA9PiB7XG4gICAgaWYgKCFyZXEudXJsKSByZXR1cm47XG5cbiAgICByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ3B1YmxpYywgbWF4LWFnZT0zMTUzNjAwMCcpO1xuXG4gICAgaWYgKCEvXFwuW2Etel0rJC8udGVzdChyZXEudXJsKSkge1xuICAgICAgcmV0dXJuIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGBkaXN0JHtyZXEudXJsfS9pbmRleC5odG1sYCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dCA9IHJlcS51cmwuc3BsaXQoJy4nKS5wb3AoKSB8fCAnJztcblxuICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsIG1pbWUuZ2V0VHlwZShleHQpIHx8ICd0ZXh0L3BsYWluJyk7XG4gICAgcmV0dXJuIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGBkaXN0JHtyZXEudXJsfWApKVxuICB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyL2hvdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9ob3QudHNcIjtpbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIlxuXG5leHBvcnQgY29uc3QgaG90dXBkYXRlID0gKCkgPT4ge1xuICBleGVjKFwibnB4IHZpdGUgYnVpbGRcIiwgKGVycikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKVxuICAgIGNvbnNvbGUubG9nKGBcXHgxYlsybSR7dGltZXN0YW1wfVxceDFiWzMybVxceDFiWzJtIFt2aXRlLXBsdWdpbi1tdWx0aXBdXFx4MWJbMG0gQnVpbGQgY29tcGxldGVkYClcbiAgfSlcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1UsU0FBUyxvQkFBb0I7OztBQ0ExRSxTQUFTLHFCQUFrQztBQUVoVSxPQUFPLFVBQVU7OztBQ0RqQixTQUFTLGNBQWM7QUFFdkIsSUFBTyxlQUFRO0FBQUEsRUFDYixNQUFNLE9BQU8sTUFBYyxRQUFrQztBQUMzRCxVQUFNLFNBQVMsTUFBTSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFXRCxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BTTVCO0FBQUEsTUFDRCxvQkFBb0IsUUFBUSxRQUFRLHNCQUFzQjtBQUFBLE1BQzFELGdCQUFnQixRQUFRLFFBQVEsa0JBQWtCO0FBQUEsSUFDcEQsQ0FBQztBQUVELFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLElBQUksTUFBYyxRQUFrQztBQUN4RCxVQUFNLFNBQVMsTUFBTSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLCtCQVlELElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BSzVCO0FBQUEsTUFDRCxvQkFBb0IsUUFBUSxRQUFRLHNCQUFzQjtBQUFBLE1BQzFELGdCQUFnQixRQUFRLFFBQVEsa0JBQWtCO0FBQUEsSUFDcEQsQ0FBQztBQUVELFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLE1BQU0sTUFBYyxRQUFrQztBQUMxRCxVQUFNLFNBQVMsTUFBTSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsK0JBYUQsSUFBSTtBQUFBO0FBQUE7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
