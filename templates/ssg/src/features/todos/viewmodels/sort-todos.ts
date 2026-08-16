import { orderBy } from 'es-toolkit';

import type { Todo, TodoFilter } from '../models';

// 남은 것 먼저, 그 안에서는 최신순.
export function sortTodos(todos: readonly Todo[]): Todo[] {
  return orderBy([...todos], [(todo) => todo.done, (todo) => todo.createdAt], ['asc', 'desc']);
}

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  if (filter === 'all') return [...todos];
  return todos.filter((todo) => (filter === 'done' ? todo.done : !todo.done));
}
