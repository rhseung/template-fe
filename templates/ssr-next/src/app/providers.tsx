'use client';

import { useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';

import { detectLanguage, i18n } from '@/common/lib';

// `process.env.NEXT_PUBLIC_*`는 빌드 타임에 인라인되므로 프로덕션 번들에서는
// devtools가 통째로 사라진다 — 런타임 플래그가 아니라 빌드 타임 플래그다.
const showDevtools = process.env.NEXT_PUBLIC_DEVTOOLS === '1';

let mockingReady: Promise<void> | null = null;

function ensureMocking(): Promise<void> {
  if (process.env.NEXT_PUBLIC_ENABLE_MSW !== 'true') return Promise.resolve();
  mockingReady ??= import('@/mocks/browser').then(({ startMocks }) => startMocks());
  return mockingReady;
}

/**
 * 서버는 `navigator`가 없어서 `detectLanguage()`가 항상 폴백(ko)을 반환하지만,
 * 클라이언트는 실제 브라우저 언어를 본다 — 그 값이 다르면 hydration mismatch다.
 *
 * MSW 준비 여부와 무관하게 **쿼리·i18n·자식은 마운트 전엔 아무것도 그리지 않는다.**
 * 서버 렌더와 클라이언트의 첫 렌더가 똑같이 "아직 없음"이라 mismatch가 안 생기고,
 * `useEffect`가 붙은 뒤에야 실제 언어로 바꾸고 목을 켠다.
 *
 * `ThemeProvider`는 예외다 — `ready` 안에 넣으면 안 된다. next-themes는 FOUC 방지용
 * `<script>`를 트리에 직접 렌더하는데, 그게 서버 HTML의 일부로 나가야 브라우저가
 * 파싱하면서 실행한다. `ready` 뒤로 미루면 그 스크립트가 마운트 이후 React 상태
 * 업데이트로 DOM에 삽입되는데, 그런 식으로 붙은 `<script>`는 실행되지 않는다 —
 * React가 "Encountered a script tag while rendering" 콘솔 에러를 낸다. `ThemeProvider`
 * 자체는 `ready`와 무관하게 항상 같은 걸 렌더하니(자식만 갈릴 뿐) 게이팅할 이유가 없다.
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
