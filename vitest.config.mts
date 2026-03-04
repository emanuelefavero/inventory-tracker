import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'tests/**',
      'tests-examples/**',
      '**/*.e2e.{ts,tsx}',
      '**/*.pw.{ts,tsx}',
      'playwright.config.{ts,js,mts,mjs}',
    ],
  },
})
