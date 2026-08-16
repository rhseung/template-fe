import { SiteHeader } from '.';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Common/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 툴바의 테마·로케일 스위처로 4가지 조합을 다 확인할 수 있다. */
export const Default: Story = {};
