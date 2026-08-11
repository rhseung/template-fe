import { GlobeIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import { LANGUAGES, type Language } from '@/common/lib';
import { cn } from '@/common/utils';

import { Button } from '../../ui/button';

export function SiteHeader({ className }: SiteHeader.Props) {
  const { t, i18n } = useTranslation('common');
  const { resolvedTheme, setTheme } = useTheme();

  const nextLanguage =
    LANGUAGES[(LANGUAGES.indexOf(i18n.language as Language) + 1) % LANGUAGES.length];
  const isDark = resolvedTheme === 'dark';

  return (
    <header
      className={cn(
        'border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm',
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <span className="text-sm font-semibold tracking-tight">{t('app.name')}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void i18n.changeLanguage(nextLanguage)}
            aria-label={t('actions.switchLanguage')}
          >
            <GlobeIcon data-icon="inline-start" />
            {nextLanguage.toUpperCase()}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={t('actions.toggleTheme')}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>
    </header>
  );
}

export declare namespace SiteHeader {
  export type Props = {
    className?: string;
  };
}
