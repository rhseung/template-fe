import { defineConfig, devices } from '@playwright/test';

const PORT = 3001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // 앱이 `navigator.language`로 언어를 정한다. 테스트가 머신 로케일에 좌우되지 않게 고정한다.
    locale: 'ko-KR',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    // `bun run dev`의 3000이 아니라 3001을 쓴다. e2e와 돌아가는 dev 서버가 공존하도록.
    //
    // `bunx --bun vite`가 아니라 `node`로 직접 돌린다 — cloudflare 타깃이 켜지면
    // `@cloudflare/vite-plugin`이 로컬 workerd로 가는 웹소켓 브리지를 붙이는데, Bun의
    // `ws` 구현이 그 브리지가 쓰는 'upgrade'/'unexpected-response' 이벤트를 아직 지원하지
    // 않아서 `vite dev`가 포트를 절대 열지 못한 채 조용히 멈춘다(Node로 돌리면 정상 동작 —
    // 직접 재현해서 확인함). `bun run dev`도 cloudflare 타깃에선 같은 이유로 Node를 강제한다
    // (`shared/files/scripts/init.ts`의 DELTA 참고) — 이건 그 dev 스크립트와 별개로,
    // e2e가 타깃 무관하게 항상 같은 명령으로 통하게 하려고 처음부터 Node로 고정해둔 것.
    command: `node node_modules/vite/bin/vite.js dev --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // 개발자의 .env가 실제 백엔드를 가리켜도 목을 강제한다.
    env: { VITE_ENABLE_MSW: 'true' },
  },
});
