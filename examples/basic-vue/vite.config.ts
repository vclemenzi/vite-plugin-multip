import { defineConfig } from 'vite'
import { multipage } from '../../src/index'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), multipage()],
})
