export const svelte = (file: string, css: string[]): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import App from '${file}';
      ${css.map((file) => `import '${file}';`).join('\n')}
      const app = new App({ target: document.getElementById('app') });
      export default app;
    </script>
  `;
};
