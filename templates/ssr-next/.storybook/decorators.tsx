import { useEffect, useState, type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/common/lib';

import type { Decorator } from '@storybook/nextjs-vite';

/**
 * 데코레이터마다 실제 컴포넌트에 위임한다.
 *
 * `Decorator`는 화살표 함수라서 그 안에서 훅을 직접 부르면
 * `react-hooks/rules-of-hooks`에 걸린다. 그리고 그 규칙이 맞다 —
 * 데코레이터가 렌더 중에 호출된다는 보장이 없다.
 *
 * 라우터 데코레이터는 없다 — `@storybook/nextjs-vite`가 `next/link`·`next/navigation`을
 * 자동으로 목킹한다(`.storybook/preview.tsx`의 `parameters.nextjs.appDirectory`).
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
