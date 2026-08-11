import { useTranslation } from 'react-i18next';

import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/common/components';

/**
 * `src/pages/404.astro`가 마운트하는 단일 아일랜드. CSR의 `routes/__root.tsx`의
 * `NotFound`와 같은 컴포넌트를 라우터 없이 쓴다 — `<Link>` 대신 `<a>`.
 */
export function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t(($) => $.notFound.title)}</EmptyTitle>
          <EmptyDescription>{t(($) => $.notFound.description)}</EmptyDescription>
        </EmptyHeader>
        <Button nativeButton={false} render={<a href="/">{t(($) => $.notFound.action)}</a>} />
      </Empty>
    </div>
  );
}
