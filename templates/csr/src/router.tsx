import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export type RouterContext = {
  queryClient: QueryClient;
};

export function createAppRouter() {
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

  return createRouter({
    routeTree,
    context: { queryClient } satisfies RouterContext,
    defaultPreload: 'intent',
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
