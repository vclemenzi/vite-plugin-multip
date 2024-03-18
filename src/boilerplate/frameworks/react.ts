export const react = (file: string): string => {
  return `
    <div id="app"></div>
    <script type="module">
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from '${file}';

      ReactDOM.createRoot(document.getElementById('app')).render(
        "<React.StrictMode><App /></React.StrictMode>"
      );
    </script>
  `;
}
