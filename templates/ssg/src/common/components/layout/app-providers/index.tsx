import { useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/common/lib';

// `import.meta.env`는 빌드 타임에 인라인되므로 프로덕션 번들에서는 devtools가 통째로
// 사라진다 — 런타임 플래그가 아니라 빌드 타임 플래그다.
const showDevtools = import.meta.env.PUBLIC_DEVTOOLS === '1';

/**
 * CSR의 `main.tsx`(MSW 부트스트랩) + `routes/__root.tsx`(Provider 트리)를 합친 자리.
 * Astro는 앱 전체를 한 번에 마운트하는 진입점이 없고 아일랜드마다 독립된 React 루트라서,
 * 상호작용하는 페이지는 전부 `<AppProviders client:load>`로 감싼다.
 *
 * `PUBLIC_ENABLE_MSW`가 켜져 있으면 목이 뜨기 전엔 자식을 렌더하지 않는다.
 * 먼저 그려지면 워커가 준비되기 전에 진짜 fetch가 나가버린다.
 */
let mockingReady: Promise<void> | null = null;

function ensureMocking(): Promise<void> {
  if (import.meta.env.PUBLIC_ENABLE_MSW !== 'true') return Promise.resolve();
  mockingReady ??= import('@/mocks/browser').then(({ startMocks }) => startMocks());
  return mockingReady;
}

export function AppProviders({ children }: AppProviders.Props) {
  const [ready, setReady] = useState(import.meta.env.PUBLIC_ENABLE_MSW !== 'true');
  // 페이지 하나 = 새 React 루트이므로, CSR의 `createAppRouter()`처럼 마운트마다 새 클라이언트.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  );

  useEffect(() => {
    if (ready) return;
    void ensureMocking().then(() => setReady(true));
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        {showDevtools && <ReactQueryDevtools buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export declare namespace AppProviders {
  export type Props = {
    children: React.ReactNode;
  };
}
