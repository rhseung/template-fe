import { useEffect, useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HeadContent, Link, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/common/components';
import { i18n } from '@/common/lib';

import appCss from '../styles.css?url';

import type { RouterContext } from '../router';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ssr-start' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

// `import.meta.env`는 빌드 타임에 인라인되므로 프로덕션 번들에서는 devtools가 통째로
// 사라진다 — 런타임 플래그가 아니라 빌드 타임 플래그다.
const showDevtools = import.meta.env.VITE_DEVTOOLS === '1';

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext();

  // 서버·클라이언트 첫 렌더(하이드레이션 이전)는 반드시 같은 결과를 그려야 한다.
  // MSW가 준비되기 전에 라우트 트리가 그려지면 첫 fetch가 실패하고, `detectLanguage()`도
  // 서버엔 `navigator`가 없어 클라이언트와 다른 언어를 고를 수 있다 — 그래서 두 환경
  // 모두 `ready=false`로 시작해서 빈 셸을 그리고, 마운트 뒤 `useEffect`에서만 갈린다.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      if (import.meta.env.VITE_ENABLE_MSW === 'true') {
        const { startMocks } = await import('@/mocks/browser');
        await startMocks();
      }
      if (!cancelled) setReady(true);
    }

    void prepare();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // next-themes가 하이드레이션 전에 `<html>`의 class를 스크립트로 바꾼다 —
    // 서버가 모르는 값이라 항상 불일치하고, 이건 그 라이브러리가 의도한 동작이다.
    <html lang="ko" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              {ready ? children : null}
              {showDevtools && ready && (
                <>
                  <TanStackRouterDevtools position="bottom-right" />
                  <ReactQueryDevtools buttonPosition="bottom-left" />
                </>
              )}
            </I18nextProvider>
          </QueryClientProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t(($) => $.notFound.title)}</EmptyTitle>
          <EmptyDescription>{t(($) => $.notFound.description)}</EmptyDescription>
        </EmptyHeader>
        <Button nativeButton={false} render={<Link to="/">{t(($) => $.notFound.action)}</Link>} />
      </Empty>
    </div>
  );
}
