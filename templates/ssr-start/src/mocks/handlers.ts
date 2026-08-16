import { HttpResponse, http } from 'msw';

import type { CreateTodo, Todo, UpdateTodo } from '@/api/types.gen';

/**
 * 목 데이터의 단일 원천. dev, Storybook, vitest 브라우저 프로젝트, Playwright가
 * 모두 이 핸들러를 읽는다. 픽스처는 한 번만 쓰면 된다.
 *
 * 예제를 지울 때 todo 핸들러도 같이 지우고, 파일 자체는 남긴다.
 */
let nextId = 4;

let todos: Todo[] = [
  { id: 1, title: '템플릿 훑어보기', done: true, createdAt: '2026-08-01T09:00:00.000Z' },
  {
    id: 2,
    title: 'openapi/example.json 을 진짜 백엔드로 교체',
    done: false,
    createdAt: '2026-08-02T09:00:00.000Z',
  },
  { id: 3, title: 'features/todos 지우기', done: false, createdAt: '2026-08-03T09:00:00.000Z' },
];

export const handlers = [
  http.get('/api/todos', () => HttpResponse.json(todos)),

  http.post('/api/todos', async ({ request }) => {
    const { title } = (await request.json()) as CreateTodo;
    const todo: Todo = { id: nextId++, title, done: false, createdAt: new Date().toISOString() };
    todos = [...todos, todo];
    return HttpResponse.json(todo, { status: 201 });
  }),

  http.patch('/api/todos/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const patch = (await request.json()) as UpdateTodo;
    const found = todos.find((todo) => todo.id === id);
    if (!found) return new HttpResponse(null, { status: 404 });

    const updated: Todo = { ...found, ...patch };
    todos = todos.map((todo) => (todo.id === id ? updated : todo));
    return HttpResponse.json(updated);
  }),
];
