export default {
  html: (file: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${file}</title>
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
}
