import { useTranslation } from 'react-i18next';

import { Button, SiteHeader } from '@/common/components';

import { filterTodos, useTodoFilter, useTodos, type TodoFilter } from '../../viewmodels';
import { TodoForm, TodoList } from '../components';

/**
 * page는 화면 전체 프레임이다 — 헤더, 섹션, 여백까지. 컴포넌트 하나를 감싼 얇은
 * `<main>` 래퍼가 아니다. ViewModel을 호출하는 유일한 View이기도 하고,
 * 그 아래는 전부 props로 받는다.
 */
export function TodosPage() {
  const { t } = useTranslation('todos');

  const { filter, filters, setFilter } = useTodoFilter();
  const {
    todos,
    isLoading,
    isError,
    createTodo,
    toggleTodo,
    isCreating,
    createFormSchema,
    createDefaultValues,
    titleMaxLength,
  } = useTodos();

  const visible = filterTodos(todos, filter);
  const remaining = todos.filter((todo) => !todo.done).length;

  // 보간 키가 아니라 정적 조회. i18next-cli는 리터럴 키만 추출하고,
  // `removeUnusedKeys`가 못 본 키를 지운다.
  //
  // `extractFromComments`가 켜져 있다는 점에 주의 — 주석 안에 번역 호출을 써두면
  // 진짜 키가 생긴다. 설명만 쓰고 호출 형태를 붙여넣지 않는다.
  const filterLabel: Record<TodoFilter, string> = {
    all: t(($) => $.filter.all),
    active: t(($) => $.filter.active),
    done: t(($) => $.filter.done),
  };

  return (
    <div className="bg-background min-h-dvh">
      <SiteHeader />

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t(($) => $.page.title)}</h1>
          <p className="text-muted-foreground text-sm">
            {t(($) => $.page.remaining, { value: remaining })}
          </p>
        </div>

        <TodoForm
          defaultValues={createDefaultValues}
          schema={createFormSchema}
          maxLength={titleMaxLength}
          isPending={isCreating}
          onSubmit={createTodo}
        />

        <div className="flex gap-1" role="group" aria-label={t(($) => $.filter.label)}>
          {filters.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? 'secondary' : 'ghost'}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {filterLabel[value]}
            </Button>
          ))}
        </div>

        <TodoList todos={visible} isLoading={isLoading} isError={isError} onToggle={toggleTodo} />
      </main>
    </div>
  );
}
