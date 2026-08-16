'use client';

import { useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';

import { detectLanguage, i18n } from '@/common/lib';

// `process.env.NEXT_PUBLIC_*`는 빌드 타임에 인라인된다. 그래서 devtools는 런타임에
// 끄는 게 아니라 이 값 자체가 프로덕션 번들엔 아예 안 들어간다.
const showDevtools = process.env.NEXT_PUBLIC_DEVTOOLS === '1';

let mockingReady: Promise<void> | null = null;

function ensureMocking(): Promise<void> {
  if (process.env.NEXT_PUBLIC_ENABLE_MSW !== 'true') return Promise.resolve();
  mockingReady ??= import('@/mocks/browser').then(({ startMocks }) => startMocks());
  return mockingReady;
}

/**
 * 마운트 전엔 쿼리·i18n·children을 그리지 않는다 — hydration mismatch 이유는 AGENTS.md 참고.
 *
 * `ThemeProvider`만 예외로 항상 그린다. next-themes가 FOUC 방지용 `<script>`를 서버 HTML에
 * 직접 심는데, `ready` 뒤로 미루면 그 스크립트가 React 상태 업데이트로 뒤늦게 붙어서
 * 브라우저가 실행해주지 않는다("Encountered a script tag while rendering" 콘솔 에러).
 */
export function Providers({ children }: Providers.Props) {
  const [ready, setReady] = useState(false);
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  );

  useEffect(() => {
    void i18n.changeLanguage(detectLanguage());
    void ensureMocking().then(() => setReady(true));
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {ready && (
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
          {showDevtools && <ReactQueryDevtools buttonPosition="bottom-left" />}
        </QueryClientProvider>
      )}
    </ThemeProvider>
  );
}

export declare namespace Providers {
  export type Props = {
    children: React.ReactNode;
  };
}
