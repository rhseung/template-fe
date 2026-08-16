import { NotFound } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/NotFound',
  component: NotFound,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
