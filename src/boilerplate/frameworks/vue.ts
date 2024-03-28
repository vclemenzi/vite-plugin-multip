import { generateImports } from "../../css/generateImports";

export const vue = (file: string, css: string[]): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import { createApp } from 'vue';
      import App from '${file}';
      ${generateImports(css)}
      createApp(App).mount('#app');
    </script>
  `;
};
