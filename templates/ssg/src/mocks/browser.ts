import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/**
 * `PUBLIC_ENABLE_MSW`가 켜져 있으면 `main.tsx`가 시작시킨다. Playwright는 `.env`와 무관하게
 * 강제로 켜므로, e2e가 살아있는 백엔드에 의존하는 일이 없다.
 */
export async function startMocks() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
