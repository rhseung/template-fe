import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TODO_FILTERS, type TodoFilter } from '../models';

type TodoFilterState = {
  filter: TodoFilter;
  /** 여기서 노출한다 — View가 필터 목록을 그리려고 Model을 import하지 않도록. */
  filters: readonly TodoFilter[];
  setFilter: (filter: TodoFilter) => void;
};

/**
 * 전역 *클라이언트* 상태. TanStack Query가 담당하지 않는 유일한 영역이다.
 *
 * 판단 기준: 새로고침하면 잊어도 되는 값이면 page의 `useState`, 서버에서 온 값이면 쿼리.
 * 그 둘 다 아닌 것만 여기로 온다.
 */
export const useTodoFilter = create<TodoFilterState>()(
  persist(
    (set) => ({
      filter: 'all',
      filters: TODO_FILTERS,
      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'todo-filter',
      // `filters`는 상태가 아니라 상수다. 같이 저장하면 사용자가 앱을 처음 연 날의
      // 목록이 그대로 굳어버린다.
      partialize: (state) => ({ filter: state.filter }),
    },
  ),
);
