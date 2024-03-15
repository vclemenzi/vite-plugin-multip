import { defineConfig } from 'vite'
import { multipage } from "../../src/index";
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte(), multipage()],
})
