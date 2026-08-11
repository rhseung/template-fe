import { ListChecksIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { tv } from 'tailwind-variants';

import {
  Checkbox,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
} from '@/common/components';
import { dayjs } from '@/common/lib';

/**
 * 표현 전용. ViewModel도, `@/api`도, 데이터 페칭도 없다 — 전부 page가 갖고 있고
 * 이 컴포넌트는 props만 받는다. 그래서 아래 모든 상태를 목킹 없이 스토리로 재현할 수 있다.
 */
export function TodoList({ todos, isLoading, isError, onToggle }: TodoList.Props) {
  const { t } = useTranslation('todos');

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <li key={row}>
            <Skeleton className="h-14 w-full rounded-lg" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t(($) => $.list.error.title)}</EmptyTitle>
          <EmptyDescription>{t(($) => $.list.error.description)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (todos.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListChecksIcon />
          </EmptyMedia>
          <EmptyTitle>{t(($) => $.list.empty.title)}</EmptyTitle>
          <EmptyDescription>{t(($) => $.list.empty.description)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <li key={todo.id} className={row()}>
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.done}
            // 접근성 이름을 제목만으로 만든다. 감싼 <label>에 의존하면
            // 날짜까지 이름에 딸려 들어간다.
            aria-labelledby={`todo-title-${todo.id}`}
            onCheckedChange={(checked) => onToggle(todo.id, checked === true)}
          />
          <label htmlFor={`todo-${todo.id}`} className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span id={`todo-title-${todo.id}`} className={title({ done: todo.done })}>
              {todo.title}
            </span>
            <time dateTime={todo.createdAt} className="text-muted-foreground text-xs">
              {dayjs(todo.createdAt).format('LL')}
            </time>
          </label>
        </li>
      ))}
    </ul>
  );
}

/**
 * 손으로 쓰는 것은 `tailwind-variants`. shadcn 프리미티브는 CVA로 나오는데,
 * `ui:add`마다 패치하느니 그냥 두는 게 맞다.
 */
const row = tv({
  base: 'border-border bg-card flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
});

const title = tv({
  base: 'truncate text-sm transition-colors',
  variants: {
    done: {
      true: 'text-muted-foreground line-through',
      false: 'text-foreground',
    },
  },
});

export declare namespace TodoList {
  /**
   * Model의 `Todo`를 가져오지 않고 컴포넌트가 자기 아이템 모양을 직접 소유한다 —
   * `eslint-plugin-boundaries`가 View → Model을 막기도 하고, 어차피 좁은 prop 타입이
   * 컴포넌트를 재사용 가능하게 만든다.
   */
  export type Item = {
    id: number;
    title: string;
    done: boolean;
    createdAt: string;
  };

  export type Props = {
    todos: readonly Item[];
    isLoading?: boolean;
    isError?: boolean;
    onToggle: (id: number, done: boolean) => void;
  };
}
