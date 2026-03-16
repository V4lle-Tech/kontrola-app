import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vite'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:5000/api/v1'),
    },
    test: {
      environment: 'jsdom',
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.spec.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/main.ts', 'src/**/*.d.ts', 'src/types/**', 'src/api/generated/**'],
      },
    },
  }),
)
