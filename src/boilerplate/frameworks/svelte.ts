export const svelte = (file: string): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import App from '${file}';
      const app = new App({ target: document.getElementById('app') });
      export default app;
    </script>
  `;
};
