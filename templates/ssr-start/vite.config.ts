/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

// 두 타깃 전용 import 위치가 서로 다른 이유: `import/order`가 알파벳순을 강제하는데
// `@cloudflare/...`는 스코프 패키지라 앞쪽, `nitro/...`는 스코프가 없어서 뒤쪽(`vite` 바로
// 위)이다. 실제 플러그인 실행 순서는 이 import 순서와 상관없다 (cloudflare/nitro가
// tanstackStart보다 먼저 와야 하는 건 아래 plugins 배열 얘기다).
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
    // cloudflare()/nitro()는 `configResolved`에서 실제 앱 빌드(ssr/nitro 환경)를 전제한다.
    // vitest가 만드는 storybook/unit 테스트 프로젝트 환경엔 안 맞아서 켜진 채로 `bun run test`를
    // 돌리면 그 훅에서 죽는다. `process.env.VITEST`로 빼둔다.
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

  // 스토리가 적으면(예: `--no-example` 직후) Vite의 esbuild 스캔이 aria-query를
  // 못 찾아서 "does not provide an export named 'elementRoles'"로 터진다.
  // 강제 프리번들로 스캔 결과와 무관하게 항상 잡는다.
  optimizeDeps: { include: ['@testing-library/dom'] },

  server: { port: 3000 },

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
