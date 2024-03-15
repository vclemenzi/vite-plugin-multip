import type { Config } from "./types";

export default {
  html: (file: string, name: string, config?: Config) => {
    let title = name.charAt(0).toUpperCase() + name.slice(1);

    if (config?.page?.title) {
      if (typeof config.page.title === "function") {
        title = config.page.title(file);
      } else {
        title = config.page.title;
      }
    }


    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="/${file}"></script>
      </body>
      </html>
          `;
  },

  svelte: (file: string) => {
    return `
      import App from '${file}'
            
      const app = new App({
        target: document.getElementById('app')!,
      })

      export default app
    `;
  },

  vue: (file: string) => {
    return `
      import { createApp } from 'vue'
      import App from '${file}'
      
      createApp(App).mount('#app')
    `;
  }
}
