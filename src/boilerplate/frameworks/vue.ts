export const vue = (file: string, css: string[]): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import { createApp } from 'vue';
      import App from '${file}';
      ${css.map((file) => `import '${file}';`).join('\n')}
      createApp(App).mount('#app');
    </script>
  `;
};
