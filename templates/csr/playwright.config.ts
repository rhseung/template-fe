import { defineConfig, devices } from '@playwright/test';

const PORT = 5174;
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
    // `bun run dev`의 5173이 아니라 5174를 쓴다. e2e와 돌아가는 dev 서버가 공존하도록.
    // `bun run dev` 대신 `bunx --bun vite`를 쓰는 것도 같은 이유 —
    // 스크립트가 자기 포트를 하드코딩하고 있다.
    command: `bunx --bun vite dev --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // 개발자의 .env가 실제 백엔드를 가리켜도 목을 강제한다.
    env: { VITE_ENABLE_MSW: 'true' },
  },
});
