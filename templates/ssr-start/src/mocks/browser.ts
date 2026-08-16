import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/** `VITE_ENABLE_MSW`가 켜져 있으면 시작시킨다. Playwright는 `.env`와 무관하게 강제로 켠다. */
export async function startMocks() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
