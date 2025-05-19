import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    sentryVitePlugin({
      org: "frontend-parcial",
      project: "javascript-react",
      authToken: process.env.SENTRY_AUTH_TOKEN
    })
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },

  build: {
    sourcemap: true
  }
})