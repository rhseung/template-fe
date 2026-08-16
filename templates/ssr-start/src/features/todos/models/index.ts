import { zCreateTodo, type zTodo } from '@/api/zod.gen';

import type { z } from 'zod';

/**
 * Model 계층은 생성된 스키마를 도메인 이름으로 재export하고, UI 전용 보강만 얹는다.
 * `@/api` 타입을 만질 수 있는 **유일한** 자리다.
 *
 * View와 ViewModel은 `Todo`를 여기서 가져온다. `@/api/types.gen`에서 직접 가져오지 않는다 —
 * 그래야 엔드포인트 이름이 바뀌었을 때 파일 하나에서만 깨진다.
 */

// 소비하는 곳이 생겼을 때만 스키마를 재export한다. `zTodo`는 여기서 `Todo`를 유도하는 데만
// 쓰이고 다른 데서 필요하지 않으므로 밖으로 내보내지 않는다.
export { zCreateTodo };

export type Todo = z.infer<typeof zTodo>;
export type CreateTodo = z.infer<typeof zCreateTodo>;

/** OpenAPI 스펙의 `maxLength`와 같은 값. ViewModel을 거쳐 폼으로 전달된다. */
export const TODO_TITLE_MAX = 120;

export type TodoFilter = 'all' | 'active' | 'done';

export const TODO_FILTERS = ['all', 'active', 'done'] as const satisfies readonly TodoFilter[];
