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
    // 3001: e2e와 별개로 돌아가는 dev 서버(3000)와 공존.
    // node로 직접 돌리는 이유는 AGENTS.md §12 참고 — Bun의 ws 구현이 cloudflare 타깃의
    // workerd 웹소켓 브리지를 못 받아서 포트가 안 열린다. e2e는 타깃 무관하게 항상 node.
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
