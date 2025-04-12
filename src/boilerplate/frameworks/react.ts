import { fixNestedPath } from "../../utils/path";

export const react = (
  file: string,
  css: string[],
  scripts: string[],
  dev: boolean,
  root: string
): string => {
  const { path, fixPath, generateImports } = fixNestedPath(file, root, dev);

  return `
    <div id="app"></div>
    <script type="module">
      import React from '${fixPath('node_modules/.vite/deps/react.js', 'react')}';
      import ReactDOM from '${fixPath('node_modules/.vite/deps/react-dom.js', 'react-dom')}';
      import App from '${path}';
      ${generateImports(css)}
      ${generateImports(scripts)}

      const e = React.createElement;

      ReactDOM.createRoot(document.getElementById('app')).render(
        e(App, null)
      );
    </script>
  `;
};
