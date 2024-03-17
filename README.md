# vite-plugin-multip

The `vite-plugin-multi-page` plugin allows you to create multi-page applications with Vite!

## Setup

```bash
npm i vite-plugin-multip
```

After installing the plugin, proceed with initialization in the `vite.config.ts` file:

```typescript
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { multipage } from "vite-plugin-multip";

export default defineConfig({
  plugins: [
    svelte(),
    multipage() // You can pass optional configuration parameters
  ],
})
```
> [!NOTE]
> In the above example, the Svelte adapter is used, but the plugin also automatically supports Vue and React.

Now, let's start by creating the appropriate directories:

```bash
src/
  pages/
    index.(svelte|tsx|vue)
    subroute/
       index.(svelte|tsx|vue)
```

Now, build:

```bash
npm run build
```
> [!NOTE]
> The `dist/` directory can be directly integrated with your backend without modification.

## Why?

This plugin stems from the need to create with Vite a multi-page split application that can be hosted with **ANY** backend.

## Roadmap

- Support for additional frameworks.

If you have suggestions or questions, feel free to open a issue!
