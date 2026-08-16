import { faker } from '@faker-js/faker';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TodoList } from '.';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

faker.seed(20260810);

const items: TodoList.Item[] = [
  { id: 1, title: faker.hacker.phrase(), done: false, createdAt: '2026-08-03T09:00:00.000Z' },
  { id: 2, title: faker.hacker.phrase(), done: false, createdAt: '2026-08-02T09:00:00.000Z' },
  { id: 3, title: faker.hacker.phrase(), done: true, createdAt: '2026-08-01T09:00:00.000Z' },
];

const meta = {
  title: 'Todos/TodoList',
  component: TodoList,
  args: { todos: items, onToggle: fn() },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TodoList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { todos: [] },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const ErrorState: Story = {
  args: { isError: true },
};

/** `play()`가 있는 스토리는 `bun run test`에서 인터랙션 테스트로 그대로 실행된다. */
export const TogglesAnItem: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('checkbox', { name: items[0].title }));

    await expect(args.onToggle).toHaveBeenCalledWith(items[0].id, true);
  },
};
