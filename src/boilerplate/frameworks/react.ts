export const react = (file: string): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from '${file}';

      const e = React.createElement;

      ReactDOM.createRoot(document.getElementById('app')).render(
        e(App, null)
      );
    </script>
  `;
}
