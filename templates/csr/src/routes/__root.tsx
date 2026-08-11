import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/common/components';
import { i18n } from '@/common/lib';

import type { RouterContext } from '../router';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

// `import.meta.env`는 빌드 타임에 인라인되므로 프로덕션 번들에서는 devtools가 통째로
// 사라진다 — 런타임 플래그가 아니라 빌드 타임 플래그다.
const showDevtools = import.meta.env.VITE_DEVTOOLS === '1';

function RootLayout() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <Outlet />
          {showDevtools && (
            <>
              <TanStackRouterDevtools position="bottom-right" />
              <ReactQueryDevtools buttonPosition="bottom-left" />
            </>
          )}
        </I18nextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('notFound.title')}</EmptyTitle>
          <EmptyDescription>{t('notFound.description')}</EmptyDescription>
        </EmptyHeader>
        <Button nativeButton={false} render={<Link to="/">{t('notFound.action')}</Link>} />
      </Empty>
    </div>
  );
}
