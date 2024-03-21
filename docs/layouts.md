## Layouts with vite-plugin-multip

When utilizing the `vite-plugin-multip` plugin, you gain the capability to finely tailor the structure and appearance of your pages by employing custom layouts. This functionality empowers you to craft distinct layouts for various pages or groups of pages, thereby enhancing the flexibility and customization options for your multipage application.

### Custom Layout Example

Below is a minimalist illustration of a custom layout file, `layout.html`, showcasing the fundamental structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Layout</title>
</head>
<body>
    <header>
        <h1>Header</h1>
    </header>

    <main>
        <!-- Page content will be inserted here -->
        <slot />
    </main>

    <footer>
        <p>Footer</p>
    </footer>
</body>
</html>
```

In this example:

- The `layout.html` file contains a basic HTML structure with a header, a main section (where the specific page content will be inserted), and a footer.
- The `<slot />` tag indicates where the content of the specific page will be inserted into the layout.
- This layout can be further customized by adding CSS styles, JavaScript scripts, or other HTML elements according to the specific project requirements.

### Layout Structure

Each page in your application can utilize its own layout, and layouts are resolved based on proximity. Here's an example directory structure:

```bash
pages/
  layout.html            # This layout is named "1"
  index.svelte           # Uses layout "1"
  foo/
    index.svelte         # Uses layout "1"
  hello/
    layout.html          # This layout is named "2"
    index.svelte         # Uses layout "2"
    world/
      index.svelte       # Uses layout "2"
```

In this structure:

- Pages located closer to a specific layout file will use that layout.
- For instance, `index.svelte` and `foo/index.svelte` will both use the layout defined in `layout.html` because it's the nearest layout file.
- Pages within the `hello` directory and its subdirectories will use the layout defined in `hello/layout.html`.

This approach allows you to organize your layouts and pages logically and apply different layouts as needed throughout your application.

For an example of layout usage with `vite-plugin-multip`, you can refer to the official plugin repository on GitHub at the following link: [https://github.com/vclemenzi/vite-plugin-multip/tree/main/examples/layouts](https://github.com/vclemenzi/vite-plugin-multip/tree/main/examples/layouts).
