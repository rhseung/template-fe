import { AppProviders, NotFound } from '@/common/components';

/** `todos-island.tsx` 참고 — 이유는 같다. */
export function NotFoundIsland() {
  return (
    <AppProviders>
      <NotFound />
    </AppProviders>
  );
}
