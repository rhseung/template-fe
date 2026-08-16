import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;
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
    // `bun run dev`의 4321이 아니라 4322를 쓴다. e2e와 돌아가는 dev 서버가 공존하도록.
    command: `bunx --bun astro dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // 개발자의 .env가 실제 백엔드를 가리켜도 목을 강제한다.
    // `ASTRO_DEV_BACKGROUND=0`: Astro 7은 AI 에이전트 환경을 감지하면 `astro dev`를
    // 백그라운드 데몬으로 돌린다(명령이 즉시 종료) — Playwright는 foreground 프로세스가
    // 계속 살아있길 기대하므로 명시적으로 꺼야 한다.
    env: { PUBLIC_ENABLE_MSW: 'true', ASTRO_DEV_BACKGROUND: '0' },
  },
});
