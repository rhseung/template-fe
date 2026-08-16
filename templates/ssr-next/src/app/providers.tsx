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
 * 서버엔 `navigator`가 없어서 `detectLanguage()`는 항상 ko로 폴백된다. 클라이언트는
 * 실제 브라우저 언어를 읽으니, 그대로 두면 서버가 그린 결과랑 클라이언트 렌더가 달라서
 * hydration mismatch가 난다.
 *
 * 그래서 MSW가 준비됐든 말든 쿼리·i18n·children은 마운트 전엔 아예 그리지 않는다.
 * 서버 렌더와 클라이언트 첫 렌더가 똑같이 "아직 없음"이니 어긋날 일이 없고,
 * `useEffect`가 붙고 나서야 진짜 언어로 바꾸고 목도 켠다.
 *
 * `ThemeProvider`만 예외로 항상 그린다. next-themes가 FOUC를 막으려고 `<script>`를
 * 트리에 직접 넣는데, 이게 서버 HTML에 실려 나가야 브라우저가 파싱하면서 바로
 * 실행해준다. `ready` 뒤로 미루면 그 스크립트가 React 상태 업데이트로 뒤늦게 DOM에
 * 붙는 꼴이 되고, 그렇게 붙은 `<script>`는 브라우저가 실행해주지 않는다. 콘솔엔
 * "Encountered a script tag while rendering" 에러만 남는다. `ThemeProvider` 자체는
 * `ready`와 무관하게 항상 같은 걸 그리니(자식만 달라질 뿐) 굳이 게이팅할 이유가 없다.
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
