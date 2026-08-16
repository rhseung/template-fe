/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

// import 위치가 서로 다른 건 `import/order`(알파벳순) 때문 — 스코프 패키지 vs 아닌 것.
// 플러그인 실행 순서와는 무관하다(그건 아래 plugins 배열이 결정).
// #if cloudflare
// import { cloudflare } from '@cloudflare/vite-plugin';
// #endif
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
// #if vercel
// import { nitro } from 'nitro/vite';
// #endif
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    // cloudflare()/nitro()는 실제 앱 빌드를 전제해서 vitest 환경에서 켜져 있으면 죽는다.
    // #if cloudflare
    // ...(process.env.VITEST ? [] : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
    // #endif
    // #if vercel
    // ...(process.env.VITEST ? [] : [nitro()]),
    // #endif
    tanstackStart(),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: { '@': path.resolve(dirname, './src') },
  },

  // 스토리가 적으면(`--no-example` 직후 등) esbuild 스캔이 aria-query를 놓쳐서
  // "does not provide an export named 'elementRoles'"로 터진다 — 강제 프리번들로 회피.
  optimizeDeps: { include: ['@testing-library/dom'] },

  server: { port: 3000 },

  test: {
    projects: [
      {
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
