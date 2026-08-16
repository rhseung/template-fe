'use client';
// 이 배럴이 재export하는 `TodosPage`가 클라이언트 컴포넌트라서 필요하다 — Next의 배럴
// re-export 체인은 'use client'를 안정적으로 전파하지 못한다(다단 배럴에서 알려진 버그).
// 이 파일부터 `views/index.ts`, `views/pages/index.ts`까지 전부 지시어가 있어야
// `app/todos/page.tsx`(서버 컴포넌트)가 이 배럴을 import했을 때 빌드가 깨지지 않는다.

/**
 * feature 배럴 — 라우트와 다른 feature가 볼 수 있는 유일한 표면.
 * `@/features/todos/viewmodels/use-todos` 같은 접근은 의도적으로 린트 에러다.
 */
export { TODO_FILTERS, TODO_TITLE_MAX } from './models';
export type { CreateTodo, Todo, TodoFilter } from './models';

export { filterTodos, sortTodos, useTodoFilter, useTodos } from './viewmodels';

export { TodoForm, TodoList, TodosPage } from './views';
