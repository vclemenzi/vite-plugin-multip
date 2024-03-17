import type { Config } from "./types";
import { minify } from "html-minifier-terser";

export default {
  async svelte(file: string, config?: Config): Promise<string> {
    const result = await minify(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module">
            import App from '${file}';
            const app = new App({ target: document.getElementById('app'), });
            export default app;
          </script>
        </body>
      </html>
    `,
      {
        collapseWhitespace: config?.minify?.collapseWhitespace || true,
        removeComments: config?.minify?.removeComments || true,
      }
    );

    return result;
  },

  async vue(file: string, config?: Config): Promise<string> {
    const result = await minify(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module">
            import { createApp } from 'vue';
            import App from '${file}';
            createApp(App).mount('#app');
          </script>
        </body>
      </html>
    `,
      {
        collapseWhitespace: config?.minify?.collapseWhitespace || true,
        removeComments: config?.minify?.removeComments || true,
      }
    );

    return result;
  },

  async react(file: string, config?: Config): Promise<string> {
    const result = await minify(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module">
            import React from 'react';
            import ReactDOM from 'react-dom/client';
            import App from '${file}';

            ReactDOM.createRoot(document.getElementById('app')).render(
              "<React.StrictMode><App /></React.StrictMode>"
            );
          </script>
        </body>
      </html>
    `,
      {
        collapseWhitespace: config?.minify?.collapseWhitespace || true,
        removeComments: config?.minify?.removeComments || true,
      }
    );

    return result;
  },
};
