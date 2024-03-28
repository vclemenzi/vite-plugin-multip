# vite-plugin-multip

The `vite-plugin-multip` plugin enables you to create multi-page applications with Vite!

- 📦 Automatic CSS file importing
- 🧬 Layouts Support
- 🔎 Framework recognition

# Installation

```bash
npm install vite-plugin-multip
```
*Alternatively, you can use your favorite package manager.*

After installing the plugin, proceed with initialization in the `vite.config.ts` file:

```typescript
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { multipage } from "vite-plugin-multip";

export default defineConfig({
  plugins: [
    svelte(),
    multipage(), // Optional configuration parameters can be passed here
  ],
});
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
