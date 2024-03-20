// vite.config.ts
import { defineConfig } from "file:///home/vc/Documents/vite-multipage/examples/custom-html/node_modules/.pnpm/vite@5.2.0/node_modules/vite/dist/node/index.js";
import { svelte as svelte2 } from "file:///home/vc/Documents/vite-multipage/examples/custom-html/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@3.0.2_svelte@4.2.12_vite@5.2.0/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";

// ../../src/index.ts
import { normalizePath } from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/vite@5.1.6_@types+node@20.11.27/node_modules/vite/dist/node/index.js";
import glob from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/fast-glob@3.3.2/node_modules/fast-glob/out/index.js";

// ../../src/boilerplate/frameworks/react.ts
var react = (file) => {
  return `
    <div id="app"></div>
    <script type="module">
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from '${file}';

      const e = React.createElement;

      ReactDOM.createRoot(document.getElementById('app')).render(
        e(App, null)
      );
    </script>
  `;
};

// ../../src/boilerplate/frameworks/svelte.ts
var svelte = (file) => {
  return `
    <div id="app"></div>
    <script type="module">
      import App from '${file}';
      const app = new App({ target: document.getElementById('app') });
      export default app;
    </script>
  `;
};

// ../../src/boilerplate/frameworks/vue.ts
var vue = (file) => {
  return `
    <div id="app"></div>
    <script type="module">
      import { createApp } from 'vue';
      import App from '${file}';
      createApp(App).mount('#app');
    </script>
  `;
};

// ../../src/boilerplate/html.ts
import { minify } from "file:///home/vc/Documents/vite-multipage/node_modules/.pnpm/html-minifier-terser@7.2.0/node_modules/html-minifier-terser/src/htmlminifier.js";
var html = async (body, config) => {
  let code = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          ${body}
        </body>
      </html>`;
  if (config?.customHtml) {
    console.log("customHtml");
    code = config.customHtml.replace("{% body %}", body);
  }
  const result = await minify(code, {
    collapseWhitespace: config?.minify?.collapseWhitespace || true,
    removeComments: config?.minify?.removeComments || true,
    ...config?.minify
  });
  return result;
};

// ../../src/boilerplate/index.ts
var generateBoilerplate = async (file, framework, config) => {
  switch (framework) {
    case "svelte":
      return await html(svelte(file), config);
    case "vue":
      return await html(vue(file), config);
    case "tsx":
      return await html(react(file), config);
    default:
      return "";
  }
  ;
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
  let framework = config?.framework || "";
  return {
    name: "vite-plugin-multi-page",
    config: () => {
      const pages = glob.sync("**/*.{svelte,vue,tsx,jsx}", {
        cwd: root,
        onlyFiles: true
      });
      const entries = pages.map((page) => {
        if (!framework)
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
              chunkFileNames: "assets/[name]-[hash].js",
              assetFileNames: "assets/[name]-[hash].[ext]",
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
      return await generateBoilerplate(page, framework, config || {});
    },
    configureServer: createServer,
    handleHotUpdate: hotupdate
  };
};

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [svelte2(), multipage()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vc3JjL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9ib2lsZXJwbGF0ZS9mcmFtZXdvcmtzL3JlYWN0LnRzIiwgIi4uLy4uL3NyYy9ib2lsZXJwbGF0ZS9mcmFtZXdvcmtzL3N2ZWx0ZS50cyIsICIuLi8uLi9zcmMvYm9pbGVycGxhdGUvZnJhbWV3b3Jrcy92dWUudHMiLCAiLi4vLi4vc3JjL2JvaWxlcnBsYXRlL2h0bWwudHMiLCAiLi4vLi4vc3JjL2JvaWxlcnBsYXRlL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvaG90LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2N1c3RvbS1odG1sXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2UvZXhhbXBsZXMvY3VzdG9tLWh0bWwvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL2V4YW1wbGVzL2N1c3RvbS1odG1sL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXG5pbXBvcnQgeyBtdWx0aXBhZ2UgfSBmcm9tICcuLi8uLi9zcmMvaW5kZXgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbc3ZlbHRlKCksIG11bHRpcGFnZSgpXSxcbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9pbmRleC50c1wiO2ltcG9ydCB7IG5vcm1hbGl6ZVBhdGgsIHR5cGUgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBnbG9iIGZyb20gXCJmYXN0LWdsb2JcIjtcbmltcG9ydCB7IGdlbmVyYXRlQm9pbGVycGxhdGUgfSBmcm9tIFwiLi9ib2lsZXJwbGF0ZVwiO1xuaW1wb3J0IHsgZGlybmFtZSwgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tIFwiLi9zZXJ2ZXIvY3JlYXRlXCI7XG5pbXBvcnQgeyBob3R1cGRhdGUgfSBmcm9tIFwiLi9zZXJ2ZXIvaG90XCI7XG5cbmV4cG9ydCBjb25zdCBtdWx0aXBhZ2UgPSAoY29uZmlnPzogQ29uZmlnKTogUGx1Z2luID0+IHtcbiAgY29uc3Qgcm9vdCA9IGNvbmZpZz8uZGlyZWN0b3J5IHx8IFwic3JjL3BhZ2VzXCI7XG4gIGxldCBmcmFtZXdvcmsgPSBjb25maWc/LmZyYW1ld29yayB8fCBcIlwiO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJ2aXRlLXBsdWdpbi1tdWx0aS1wYWdlXCIsXG4gICAgY29uZmlnOiAoKSA9PiB7XG4gICAgICBjb25zdCBwYWdlcyA9IGdsb2Iuc3luYyhcIioqLyoue3N2ZWx0ZSx2dWUsdHN4LGpzeH1cIiwge1xuICAgICAgICBjd2Q6IHJvb3QsXG4gICAgICAgIG9ubHlGaWxlczogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBlbnRyaWVzID0gcGFnZXMubWFwKChwYWdlKSA9PiB7XG4gICAgICAgIC8vIEdldCBmcmFtZXdvcmsgZnJvbSBmaWxlIGV4dGVuc2lvblxuICAgICAgICBpZiAoIWZyYW1ld29yaykgZnJhbWV3b3JrID0gcGFnZS5zcGxpdChcIi5cIikucG9wKCkgfHwgXCJcIjtcblxuICAgICAgICBjb25zdCBuYW1lID0gZGlybmFtZShwYWdlKTtcblxuICAgICAgICBpZiAobmFtZSA9PT0gXCIuXCIgfHwgIW5hbWUpIHJldHVybiBcImluZGV4XCI7XG5cbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgaW5wdXQgPSBlbnRyaWVzLnJlZHVjZSgoYWNjOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LCBwYWdlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gXCJpbmRleC5odG1sXCI7XG5cbiAgICAgICAgaWYgKHBhZ2UgPT09IFwiaW5kZXhcIikge1xuICAgICAgICAgIGFjY1twYWdlXSA9IHJlc29sdmUocm9vdCwgZmlsZU5hbWUpO1xuICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH1cblxuICAgICAgICBhY2NbcGFnZV0gPSByZXNvbHZlKHJvb3QsIHBhZ2UsIGZpbGVOYW1lKTtcblxuICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgfSwge30pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByb290LFxuICAgICAgICBhcHBUeXBlOiBcImN1c3RvbVwiLFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgZm9ybWF0OiBcImVzXCIsXG4gICAgICAgICAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdXCIsXG4gICAgICAgICAgICAgIGRpcjogXCJkaXN0L1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVzb2x2ZUlkKGlkKSB7XG4gICAgICByZXR1cm4gaWQuaW5jbHVkZXMoXCJpbmRleC5odG1sXCIpID8gaWQgOiBudWxsO1xuICAgIH0sXG5cbiAgICBhc3luYyBsb2FkKGlkKSB7XG4gICAgICBpZiAoZnJhbWV3b3JrID09PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IoXCJGcmFtZXdvcmsgbm90IGZvdW5kXCIpO1xuXG4gICAgICBjb25zdCBmaWxlTmFtZSA9IFwiaW5kZXguaHRtbFwiO1xuXG4gICAgICBpZiAoIWlkLmVuZHNXaXRoKGZpbGVOYW1lKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGlkID0gbm9ybWFsaXplUGF0aChpZCk7XG5cbiAgICAgIGNvbnN0IHBhZ2UgPSBpZC5yZXBsYWNlKGZpbGVOYW1lLCBgaW5kZXguJHtmcmFtZXdvcmt9YCk7XG5cbiAgICAgIHJldHVybiBhd2FpdCBnZW5lcmF0ZUJvaWxlcnBsYXRlKHBhZ2UsIGZyYW1ld29yaywgY29uZmlnIHx8IHt9KVxuICAgIH0sXG5cbiAgICBjb25maWd1cmVTZXJ2ZXI6IGNyZWF0ZVNlcnZlcixcbiAgICBoYW5kbGVIb3RVcGRhdGU6IGhvdHVwZGF0ZSxcbiAgfTtcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGUvZnJhbWV3b3Jrc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9ib2lsZXJwbGF0ZS9mcmFtZXdvcmtzL3JlYWN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGUvZnJhbWV3b3Jrcy9yZWFjdC50c1wiO2V4cG9ydCBjb25zdCByZWFjdCA9IChmaWxlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gYFxuICAgIDxkaXYgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj5cbiAgICAgIGltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG4gICAgICBpbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG4gICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuXG4gICAgICBjb25zdCBlID0gUmVhY3QuY3JlYXRlRWxlbWVudDtcblxuICAgICAgUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykpLnJlbmRlcihcbiAgICAgICAgZShBcHAsIG51bGwpXG4gICAgICApO1xuICAgIDwvc2NyaXB0PlxuICBgO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2JvaWxlcnBsYXRlL2ZyYW1ld29ya3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGUvZnJhbWV3b3Jrcy9zdmVsdGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9ib2lsZXJwbGF0ZS9mcmFtZXdvcmtzL3N2ZWx0ZS50c1wiO2V4cG9ydCBjb25zdCBzdmVsdGUgPSAoZmlsZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+XG4gICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XG4gICAgICBpbXBvcnQgQXBwIGZyb20gJyR7ZmlsZX0nO1xuICAgICAgY29uc3QgYXBwID0gbmV3IEFwcCh7IHRhcmdldDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpIH0pO1xuICAgICAgZXhwb3J0IGRlZmF1bHQgYXBwO1xuICAgIDwvc2NyaXB0PlxuICBgO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2JvaWxlcnBsYXRlL2ZyYW1ld29ya3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGUvZnJhbWV3b3Jrcy92dWUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9ib2lsZXJwbGF0ZS9mcmFtZXdvcmtzL3Z1ZS50c1wiO2V4cG9ydCBjb25zdCB2dWUgPSAoZmlsZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGlkPVwiYXBwXCI+PC9kaXY+XG4gICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XG4gICAgICBpbXBvcnQgeyBjcmVhdGVBcHAgfSBmcm9tICd2dWUnO1xuICAgICAgaW1wb3J0IEFwcCBmcm9tICcke2ZpbGV9JztcbiAgICAgIGNyZWF0ZUFwcChBcHApLm1vdW50KCcjYXBwJyk7XG4gICAgPC9zY3JpcHQ+XG4gIGA7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGUvaHRtbC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL2JvaWxlcnBsYXRlL2h0bWwudHNcIjtpbXBvcnQgeyBtaW5pZnkgfSBmcm9tIFwiaHRtbC1taW5pZmllci10ZXJzZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBjb25zdCBodG1sID0gYXN5bmMgKGJvZHk6IHN0cmluZywgY29uZmlnPzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgbGV0IGNvZGUgPSBgXG4gICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICA8aGVhZD5cbiAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIiAvPlxuICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCIgLz5cbiAgICAgICAgICA8dGl0bGU+PC90aXRsZT5cbiAgICAgICAgPC9oZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgICAke2JvZHl9XG4gICAgICAgIDwvYm9keT5cbiAgICAgIDwvaHRtbD5gO1xuXG4gIGlmIChjb25maWc/LmN1c3RvbUh0bWwpIHtcbiAgICBjb25zb2xlLmxvZyhcImN1c3RvbUh0bWxcIik7XG4gICAgY29kZSA9IGNvbmZpZy5jdXN0b21IdG1sLnJlcGxhY2UoXCJ7JSBib2R5ICV9XCIsIGJvZHkpO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbWluaWZ5KGNvZGUsIHtcbiAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IGNvbmZpZz8ubWluaWZ5Py5jb2xsYXBzZVdoaXRlc3BhY2UgfHwgdHJ1ZSxcbiAgICByZW1vdmVDb21tZW50czogY29uZmlnPy5taW5pZnk/LnJlbW92ZUNvbW1lbnRzIHx8IHRydWUsXG4gICAgLi4uY29uZmlnPy5taW5pZnksXG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvYm9pbGVycGxhdGUvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9ib2lsZXJwbGF0ZS9pbmRleC50c1wiO2ltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5pbXBvcnQgeyByZWFjdCB9IGZyb20gXCIuL2ZyYW1ld29ya3MvcmVhY3RcIjtcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gXCIuL2ZyYW1ld29ya3Mvc3ZlbHRlXCI7XG5pbXBvcnQgeyB2dWUgfSBmcm9tIFwiLi9mcmFtZXdvcmtzL3Z1ZVwiO1xuaW1wb3J0IHsgaHRtbCB9IGZyb20gXCIuL2h0bWxcIjtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlQm9pbGVycGxhdGUgPSBhc3luYyAoZmlsZTogc3RyaW5nLCBmcmFtZXdvcms6IHN0cmluZywgY29uZmlnOiBDb25maWcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBzd2l0Y2ggKGZyYW1ld29yaykge1xuICAgIGNhc2UgXCJzdmVsdGVcIjpcbiAgICAgIHJldHVybiBhd2FpdCBodG1sKHN2ZWx0ZShmaWxlKSwgY29uZmlnKTtcbiAgICBjYXNlIFwidnVlXCI6XG4gICAgICByZXR1cm4gYXdhaXQgaHRtbCh2dWUoZmlsZSksIGNvbmZpZyk7XG4gICAgY2FzZSBcInRzeFwiIHx8IFwianN4XCI6XG4gICAgICByZXR1cm4gYXdhaXQgaHRtbChyZWFjdChmaWxlKSwgY29uZmlnKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwiXCI7XG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9jcmVhdGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXIvY3JlYXRlLnRzXCI7aW1wb3J0IHR5cGUgeyBWaXRlRGV2U2VydmVyIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBtaW1lIGZyb20gXCJtaW1lXCI7XG5pbXBvcnQgeyBob3R1cGRhdGUgfSBmcm9tIFwiLi9ob3RcIjtcblxuLy8gVGhpcyBmZWF0dXJlIGlzIGluIGJldGEsIHNvIGl0IG1heSBub3Qgd29yayBhcyBleHBlY3RlZFxuLy8gSSBob3BlIEknbGwgZmluZCBhIGJldHRlciB3YXkgdG8gZG8gdGhpc1xuLy8gQXMgdG9kYXksIGRldiBzZXJ2ZXIgZG8gdGhlIHNhbWUgdGhpbmcgYXMgcHJldmlldyBzZXJ2ZXJcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlcnZlciA9IChzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpID0+IHtcbiAgaG90dXBkYXRlKCk7XG5cbiAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMpID0+IHtcbiAgICBpZiAoIXJlcS51cmwpIHJldHVybjtcblxuICAgIGlmICghL1xcLlthLXpdKyQvLnRlc3QocmVxLnVybCkpIHtcbiAgICAgIHJldHVybiByZXMuZW5kKGZzLnJlYWRGaWxlU3luYyhgZGlzdCR7cmVxLnVybH0vaW5kZXguaHRtbGApKTtcbiAgICB9XG5cbiAgICBjb25zdCBleHQgPSByZXEudXJsLnNwbGl0KFwiLlwiKS5wb3AoKSB8fCBcIlwiO1xuXG4gICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBtaW1lLmdldFR5cGUoZXh0KSB8fCBcInRleHQvcGxhaW5cIik7XG4gICAgcmV0dXJuIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGBkaXN0JHtyZXEudXJsfWApKTtcbiAgfSk7XG59OztcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdmMvRG9jdW1lbnRzL3ZpdGUtbXVsdGlwYWdlL3NyYy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3ZjL0RvY3VtZW50cy92aXRlLW11bHRpcGFnZS9zcmMvc2VydmVyL2hvdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS92Yy9Eb2N1bWVudHMvdml0ZS1tdWx0aXBhZ2Uvc3JjL3NlcnZlci9ob3QudHNcIjtpbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcblxuZXhwb3J0IGNvbnN0IGhvdHVwZGF0ZSA9ICgpID0+IHtcbiAgZXhlYyhcIm5weCB2aXRlIGJ1aWxkIC0tbW9kZSBkZXZlbG9wbWVudFwiLCAoZXJyKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBgXFx4MWJbMm0ke3RpbWVzdGFtcH1cXHgxYlszMm0gW3ZpdGUtcGx1Z2luLW11bHRpcF1cXHgxYlswbSBCdWlsZCBjb21wbGV0ZWRgXG4gICAgKTtcbiAgfSk7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixTQUFTLG9CQUFvQjtBQUNqWCxTQUFTLFVBQUFBLGVBQWM7OztBQ0Q4UCxTQUFTLHFCQUFrQztBQUVoVSxPQUFPLFVBQVU7OztBQ0ZnVixJQUFNLFFBQVEsQ0FBQyxTQUF5QjtBQUN2WSxTQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx5QkFLZ0IsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTN0I7OztBQ2ZtVyxJQUFNLFNBQVMsQ0FBQyxTQUF5QjtBQUMxWSxTQUFPO0FBQUE7QUFBQTtBQUFBLHlCQUdnQixJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLN0I7OztBQ1Q2VixJQUFNLE1BQU0sQ0FBQyxTQUF5QjtBQUNqWSxTQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEseUJBSWdCLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFJN0I7OztBQ1R1VCxTQUFTLGNBQWM7QUFHdlUsSUFBTSxPQUFPLE9BQU8sTUFBYyxX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
