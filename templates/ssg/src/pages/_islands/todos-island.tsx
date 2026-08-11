import { AppProviders } from '@/common/components';
import { TodosPage } from '@/features/todos';

/**
 * `.astro`가 마운트하는 아일랜드 하나 = React 하이드레이션 경계 하나.
 *
 * `<AppProviders client:load><TodosPage /></AppProviders>`처럼 `.astro` 템플릿에서
 * 두 프레임워크 컴포넌트를 직접 중첩하면 Astro가 자식을 별도 렌더 패스로 처리해서
 * `QueryClientProvider` 컨텍스트가 안 이어진다("No QueryClient set" 빌드 에러).
 * 그래서 Provider와 View를 여기 순수 React 트리 하나로 미리 합쳐두고, `.astro`는
 * 이 컴포넌트 하나에만 `client:load`를 건다.
 */
export function TodosIsland() {
  return (
    <AppProviders>
      <TodosPage />
    </AppProviders>
  );
}
