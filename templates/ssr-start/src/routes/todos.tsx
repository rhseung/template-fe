import { createFileRoute } from '@tanstack/react-router';

import { TodosPage } from '@/features/todos';

// 라우트 파일은 마운트 포인트다. 허용되는 import는 feature 배럴 하나뿐이다.
export const Route = createFileRoute('/todos')({
  component: TodosPage,
});
