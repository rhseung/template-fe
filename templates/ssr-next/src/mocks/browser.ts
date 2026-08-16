import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/** `NEXT_PUBLIC_ENABLE_MSW`가 켜져 있으면 `app/providers.tsx`가 시작시킨다. */
export async function startMocks() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
