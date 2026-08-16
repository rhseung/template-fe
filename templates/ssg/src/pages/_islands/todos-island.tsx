import { AppProviders } from '@/common/components';
import { TodosPage } from '@/features/todos';

// `.astro`에서 `<AppProviders client:load><TodosPage /></AppProviders>`처럼 프레임워크
// 컴포넌트 두 개를 직접 중첩하면 Astro가 자식을 별도 렌더 패스로 처리해버려서
// `QueryClientProvider` 컨텍스트가 안 이어진다("No QueryClient set" 빌드 에러). 그래서
// 여기서 순수 React 트리 하나로 미리 합쳐두고 `.astro`는 이 컴포넌트에만 `client:load`를 건다.
export function TodosIsland() {
  return (
    <AppProviders>
      <TodosPage />
    </AppProviders>
  );
}
