'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/common/components';

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
