export const react = (file: string, css: string[]): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from '${file}';
      ${css.map((file) => `import '${file}';`).join('\n')}

      const e = React.createElement;

      ReactDOM.createRoot(document.getElementById('app')).render(
        e(App, null)
      );
    </script>
  `;
};
