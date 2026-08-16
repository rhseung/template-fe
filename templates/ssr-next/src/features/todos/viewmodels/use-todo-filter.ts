import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TODO_FILTERS, type TodoFilter } from '../models';

type TodoFilterState = {
  filter: TodoFilter;
  filters: readonly TodoFilter[];
  setFilter: (filter: TodoFilter) => void;
};

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
