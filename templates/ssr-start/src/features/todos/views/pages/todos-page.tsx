import { useTranslation } from 'react-i18next';

import { Button, SiteHeader } from '@/common/components';

import { filterTodos, useTodoFilter, useTodos, type TodoFilter } from '../../viewmodels';
import { TodoForm, TodoList } from '../components';

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
