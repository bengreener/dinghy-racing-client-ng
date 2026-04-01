import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'setupTests.js',
    coverage: {
      provider: 'v8',
      exclude: ['__mocks__/*'],
    },
  },
})
