import { describe, expect, it } from 'vitest';

import { filterTodos, sortTodos } from './sort-todos';

import type { Todo } from '../models';

const todo = (id: number, done: boolean, createdAt: string): Todo => ({
  id,
  title: `todo ${id}`,
  done,
  createdAt,
});

describe('sortTodos', () => {
  it('남은 항목을 먼저, 그 안에서는 최신순으로 정렬한다', () => {
    const sorted = sortTodos([
      todo(1, true, '2026-01-03T00:00:00.000Z'),
      todo(2, false, '2026-01-01T00:00:00.000Z'),
      todo(3, false, '2026-01-02T00:00:00.000Z'),
    ]);

    expect(sorted.map((t) => t.id)).toEqual([3, 2, 1]);
  });

  it('입력 배열을 변형하지 않는다', () => {
    const input = [
      todo(1, true, '2026-01-01T00:00:00.000Z'),
      todo(2, false, '2026-01-02T00:00:00.000Z'),
    ];
    const snapshot = [...input];

    sortTodos(input);

    expect(input).toEqual(snapshot);
  });
});

describe('filterTodos', () => {
  const todos = [
    todo(1, true, '2026-01-01T00:00:00.000Z'),
    todo(2, false, '2026-01-02T00:00:00.000Z'),
  ];

  it.each([
    ['all', [1, 2]],
    ['active', [2]],
    ['done', [1]],
  ] as const)('%s 필터', (filter, expected) => {
    expect(filterTodos(todos, filter).map((t) => t.id)).toEqual(expected);
  });
});
