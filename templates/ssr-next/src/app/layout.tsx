import { Providers } from './providers';

import type { Metadata } from 'next';

import '../styles.css';

// `@/common/lib`의 부수효과(API 클라이언트 설정, dayjs↔i18next 연동, i18next 초기화)는
// 여기(서버 컴포넌트)가 아니라 `providers.tsx`('use client')에서 트리거한다.
// `react-i18next`가 내부적으로 `React.createContext`를 쓰는데, 서버 컴포넌트 모듈
// 그래프에서 resolve되는 React엔 그게 없다 — 여기서 import하면 빌드가 깨진다.

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
