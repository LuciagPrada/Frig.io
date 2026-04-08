import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true,
      ignored: ['**/unsloth_compiled_cache/**', '**/api/**', '**/.venv/**', '**/node_modules/**']
    }
  }
})
