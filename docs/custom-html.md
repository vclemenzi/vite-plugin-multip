# HTML Customization with vite-plugin-multip

With the `vite-plugin-multip` plugin, you have the ability to fully customize the HTML structure using a custom HTML template.

Configuration:
```ts
multipage({ customHtml: "path/to/your/template.html" })
```

Example of the custom HTML template:
```html
<!DOCTYPE HTML>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Custom HTML</title>
  </head>
  <body>
    {% body %}
  </body>
</html>
```

`{% body %}` will be replaced with the content of the specific page's body. This feature allows you to completely tailor the appearance and structure of your multipage setup, offering greater flexibility in design.

*You can find an example [here](https://github.com/vclemenzi/vite-plugin-multip/tree/main/examples/custom-html)*
