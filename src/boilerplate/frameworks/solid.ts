import { fixNestedPath } from "../../utils/path";

export const solid = (
  file: string,
  css: string[],
  scripts: string[],
  dev: boolean,
  root: string
): string => {
  const {path, fixPath, generateImports} = fixNestedPath(file, root, dev);

  return `
    <div id="app"></div>
    <script type="module">
      import {reflect} from '${fixPath("node_modules/.vite/deps/solid-web.js", "solid-js/web")}'
      import App from '${path}';
      ${generateImports(css)}
      ${generateImports(scripts)}

      const app = document.getElementById('app')

      render(() => App, app)
    </script>
  `;
};
