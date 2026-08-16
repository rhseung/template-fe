'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/common/components';

// Next 예약 파일 — 매칭되는 라우트가 없을 때 렌더된다. `RootLayout`의 `Providers` 안에서
// 그려지므로 i18n·query 컨텍스트는 그대로 쓸 수 있다.
export default function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t(($) => $.notFound.title)}</EmptyTitle>
          <EmptyDescription>{t(($) => $.notFound.description)}</EmptyDescription>
        </EmptyHeader>
        <Button nativeButton={false} render={<Link href="/">{t(($) => $.notFound.action)}</Link>} />
      </Empty>
    </div>
  );
}
