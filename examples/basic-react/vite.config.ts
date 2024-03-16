import { defineConfig } from 'vite'
import { multipage } from '../../src/index'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), multipage()],
})
