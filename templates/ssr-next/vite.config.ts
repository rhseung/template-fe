/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Next 앱 자체는 webpack/turbopack으로 빌드된다 — 이 파일은 Storybook·vitest 전용이고
// `next.config.ts`와 무관하다.
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(dirname, './src') },
  },

  // 스토리가 적으면(예: `--no-example` 직후) Vite의 esbuild 스캔이 aria-query를
  // 못 찾아서 "does not provide an export named 'elementRoles'"로 터진다.
  // 강제 프리번들로 스캔 결과와 무관하게 항상 잡는다.
  optimizeDeps: { include: ['@testing-library/dom'] },

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
