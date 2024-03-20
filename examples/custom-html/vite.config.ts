import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { multipage } from '../../src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), multipage({ customHtml: 'custom.html' })],
})
