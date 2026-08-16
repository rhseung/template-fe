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
    command: `next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // 개발자의 .env가 실제 백엔드를 가리켜도 목을 강제한다.
    env: { NEXT_PUBLIC_ENABLE_MSW: 'true' },
  },
});
