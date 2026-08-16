import { useTranslation } from 'react-i18next';

import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/common/components';

// 라우터가 없어서 `<Link>` 대신 `<a>`를 쓴다.
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
