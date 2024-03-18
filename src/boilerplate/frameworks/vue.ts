export const vue = (file: string): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import { createApp } from 'vue';
      import App from '${file}';
      createApp(App).mount('#app');
    </script>
  `;
}
