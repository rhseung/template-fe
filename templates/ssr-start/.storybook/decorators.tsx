import { useEffect, useState, type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';

import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/common/lib';

import type { Decorator } from '@storybook/react-vite';

/**
 * 데코레이터마다 실제 컴포넌트에 위임한다.
 *
 * `Decorator`는 화살표 함수라서 그 안에서 훅을 직접 부르면
 * `react-hooks/rules-of-hooks`에 걸린다. 그리고 그 규칙이 맞다 —
 * 데코레이터가 렌더 중에 호출된다는 보장이 없다.
 */

function WithQueryClient({ children }: { children: ReactNode }) {
  // 스토리마다 새 클라이언트. 한 스토리의 캐시가 다음 스토리로 새지 않게.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export const withQueryClient: Decorator = (Story) => (
  <WithQueryClient>
    <Story />
  </WithQueryClient>
);

function WithLocale({ locale, children }: { locale: string; children: ReactNode }) {
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/** preview.tsx의 `locale` 툴바가 이걸 움직인다. */
export const withLocale: Decorator = (Story, context) => (
  <WithLocale locale={(context.globals.locale as string) ?? 'ko'}>
    <Story />
  </WithLocale>
);

function WithRouter({ component }: { component: () => ReactNode }) {
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    }),
  );

  // 임시로 만든 루트 라우트라 앱에 등록된 라우트 트리 타입과 맞지 않는다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <RouterProvider router={router as any} />;
}

/**
 * `<Link>`나 `useNavigate()`를 쓰는 건 전부 스코프에 라우터가 있어야 한다.
 *
 * `@storybook/tanstack-react`가 이걸 대신해줄 수 있지만 `definePreview`/route-typed
 * `Meta` 기반의 다른 CSF 패러다임이라 스토리 전체를 새로 써야 한다 — 그 정도 이득은
 * 아니라 `@storybook/react-vite` + 이 12줄짜리 데코레이터를 그대로 쓴다.
 */
export const withRouter: Decorator = (Story) => <WithRouter component={Story} />;
