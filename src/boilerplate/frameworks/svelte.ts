import { generateImports } from "../../css/generateImports";

export const svelte = (file: string, css: string[]): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import App from '${file}';
      ${generateImports(css)}
      const app = new App({ target: document.getElementById('app') });
      export default app;
    </script>
  `;
};
