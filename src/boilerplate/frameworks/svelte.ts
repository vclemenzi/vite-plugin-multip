import { fixNestedPath } from "../../utils/path";

export const svelte = (
  file: string,
  css: string[],
  scripts: string[],
  dev: boolean,
  root: string
): string => {
  const {path, generateImports} = fixNestedPath(file, root, dev);
  return `
    <div id="app"></div>
    <script type="module">
      import App from '${path}';
      ${generateImports(css)}
      ${generateImports(scripts)}
      const app = new App({ target: document.getElementById('app') });
      export default app;
    </script>
  `;
};
