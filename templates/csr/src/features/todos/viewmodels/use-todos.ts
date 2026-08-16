import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTodoMutation,
  getTodosOptions,
  getTodosQueryKey,
  updateTodoMutation,
} from '@/api/@tanstack/react-query.gen';

import { TODO_TITLE_MAX, zCreateTodo, type CreateTodo } from '../models';
import { sortTodos } from './sort-todos';

export function useTodos() {
  const queryClient = useQueryClient();

  const query = useQuery(getTodosOptions());

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: getTodosQueryKey() });
  };

  const create = useMutation({ ...createTodoMutation(), onSuccess: invalidate });
  const update = useMutation({ ...updateTodoMutation(), onSuccess: invalidate });

  return {
    todos: sortTodos(query.data ?? []),
    isLoading: query.isLoading,
    isError: query.isError,

    createTodo: (body: CreateTodo) => create.mutateAsync({ body }),
    toggleTodo: (id: number, done: boolean) => update.mutateAsync({ path: { id }, body: { done } }),

    isCreating: create.isPending,

    createFormSchema: zCreateTodo,
    createDefaultValues: { title: '' } satisfies CreateTodo,
    titleMaxLength: TODO_TITLE_MAX,
  };
}
