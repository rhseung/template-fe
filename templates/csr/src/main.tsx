import { StrictMode } from 'react';

import { RouterProvider } from '@tanstack/react-router';

import { createRoot } from 'react-dom/client';

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
