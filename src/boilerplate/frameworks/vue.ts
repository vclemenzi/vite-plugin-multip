import { fixNestedPath } from "../../utils/path";

export const vue = (
  file: string,
  css: string[],
  scripts: string[],
  dev: boolean,
  root: string,
  init?: string
): string => {
  scripts = scripts.filter((script) => script.endsWith("init.ts") === false);

  const { path, fixPath, generateImports } = fixNestedPath(file, root, dev)
  return `
    <div id="app"></div>
    <script type="module">
      import { createApp } from '${fixPath('node_modules/.vite/deps/vue.js', 'vue')}';
      import App from '${path}';
      ${init ? `import { init } from '${fixPath(init)}';` : ""}
      ${generateImports(css)}
      ${generateImports(scripts)}
      const app = createApp(App);
      ${init ? "init(app);" : ""}
      app.mount('#app');
    </script>
  `;
};
