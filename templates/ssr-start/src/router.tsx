import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export type RouterContext = {
  queryClient: QueryClient;
};

// TanStack Start가 이 파일에서 `getRouter`라는 이름을 찾는다 — 서버·클라이언트
// 엔트리 둘 다 여기로 라우터를 만든다. 이름을 바꾸면 안 된다.
export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 생성된 SDK가 이미 응답을 검증하고 dev에서는 MSW가 즉시 답한다 —
        // 여기서 재시도를 늘려봐야 진짜 실패만 느려진다.
        retry: 1,
        staleTime: 30_000,
      },
    },
  });

  return createTanStackRouter({
    routeTree,
    context: { queryClient } satisfies RouterContext,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
