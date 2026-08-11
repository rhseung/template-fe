import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTodoMutation,
  getTodosOptions,
  getTodosQueryKey,
  updateTodoMutation,
} from '@/api/@tanstack/react-query.gen';

import { TODO_TITLE_MAX, zCreateTodo, type CreateTodo } from '../models';
import { sortTodos } from './sort-todos';

/**
 * ViewModel의 표준 모양.
 *
 * mutation 객체를 그대로 반환하지 않는다. View는 좁은 도메인 액션과 불리언, 그리고
 * 검증에 쓸 zod 스키마만 받는다. 이게 `@tanstack/react-query`를 View 계층에서
 * 완전히 걷어내는 방법이다.
 *
 * 캐시 무효화는 코드젠이 넣어주지 않으므로 여기서 손으로 쓴다.
 */
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

    /** 폼 컴포넌트에 넘겨준다 — View가 Model을 import하지 않도록. */
    createFormSchema: zCreateTodo,
    createDefaultValues: { title: '' } satisfies CreateTodo,
    titleMaxLength: TODO_TITLE_MAX,
  };
}
