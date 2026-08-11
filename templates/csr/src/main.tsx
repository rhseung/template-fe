import { StrictMode } from 'react';

import { RouterProvider } from '@tanstack/react-router';

import { createRoot } from 'react-dom/client';

// 부수효과 import: API 클라이언트를 설정하고 dayjs를 i18next에 연결한다.
import '@/common/lib';

import { createAppRouter } from './router';

import './styles.css';

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { startMocks } = await import('./mocks/browser');
    await startMocks();
  }

  const container = document.getElementById('root');
  if (!container) throw new Error('#root not found');

  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={createAppRouter()} />
    </StrictMode>,
  );
}

void bootstrap();
