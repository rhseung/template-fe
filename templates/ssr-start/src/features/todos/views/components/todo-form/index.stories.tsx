import { expect, fn, userEvent, within } from 'storybook/test';

import { zCreateTodo } from '@/api/zod.gen';

import { TodoForm } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Todos/TodoForm',
  component: TodoForm,
  args: {
    defaultValues: { title: '' },
    schema: zCreateTodo,
    maxLength: 120,
    onSubmit: fn(async () => {}),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TodoForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { isPending: true },
};

export const SubmitsAndResets: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, '스토리에서 폼 제출하기');
    await userEvent.click(canvas.getByRole('button'));

    await expect(args.onSubmit).toHaveBeenCalledWith({ title: '스토리에서 폼 제출하기' });
    await expect(input).toHaveValue('');
  },
};

/** 빈 제목은 생성된 zod 스키마(minLength: 1)가 막는다. */
export const RejectsEmptyTitle: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button'));

    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
