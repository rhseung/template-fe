import { TodosPage } from './todos-page';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * 페이지 스토리는 MSW 핸들러(`src/mocks/handlers.ts`)를 그대로 쓴다 —
 * `preview.tsx`가 전역 로더로 등록해두었으므로 여기서는 아무 설정도 필요 없다.
 */
const meta = {
  title: 'Todos/Pages/TodosPage',
  component: TodosPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TodosPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
