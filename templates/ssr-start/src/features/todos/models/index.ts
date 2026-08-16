import { zCreateTodo, type zTodo } from '@/api/zod.gen';

import type { z } from 'zod';

// `zTodo`는 여기서 `Todo` 타입을 유도하는 데만 쓰이고 다른 데서 필요 없어서 재export 안 함.
export { zCreateTodo };

export type Todo = z.infer<typeof zTodo>;
export type CreateTodo = z.infer<typeof zCreateTodo>;

/** OpenAPI 스펙의 `maxLength`와 같은 값. ViewModel을 거쳐 폼으로 전달된다. */
export const TODO_TITLE_MAX = 120;

export type TodoFilter = 'all' | 'active' | 'done';

export const TODO_FILTERS = ['all', 'active', 'done'] as const satisfies readonly TodoFilter[];
