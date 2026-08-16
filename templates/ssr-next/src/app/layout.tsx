import { Providers } from './providers';

import type { Metadata } from 'next';

import '../styles.css';

// `@/common/lib` 부수효과 import는 여기가 아니라 `providers.tsx`에서 트리거한다 —
// 서버 컴포넌트에서 react-i18next를 로드하면 createContext가 없어 빌드가 깨진다.

export const metadata: Metadata = {
  title: 'template-fe / ssr-next',
  description: 'Next.js App Router 템플릿',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
