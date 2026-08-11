/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { tanstackRouter } from '@tanstack/router-plugin/vite';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    // react()보다 먼저 와야 한다 — 앱이 import하는 라우트 트리를 이 플러그인이 만든다.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react({
      // React Compiler는 기본 off. 켜려면:
      //   bun add -d babel-plugin-react-compiler @rolldown/plugin-babel
      //   babel: { plugins: [['babel-plugin-react-compiler', {}]] },
      // `eslint-plugin-react-hooks@7`이 컴파일러의 린트 가치를 빌드 비용 0으로 이미 준다.
      // 그래서 이건 안전성이 아니라 성능 판단이다.
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: { '@': path.resolve(dirname, './src') },
  },

  server: { port: 5173 },

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@tanstack/')) return 'vendor-tanstack';
          return undefined;
        },
      },
    },
  },

  test: {
    projects: [
      {
        // 모든 스토리가 실제 브라우저에서 테스트로 돈다. `play()`가 있으면 인터랙션 테스트가 된다.
        // 컴포넌트 검증은 여기서 이뤄진다.
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          testTimeout: 15_000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        // 프레임워크 없는 로직만. 렌더링되는 건 전부 스토리로 간다.
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
        },
      },
    ],
  },
});
