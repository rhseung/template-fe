import { withThemeByClassName } from '@storybook/addon-themes';
import { mswLoader } from 'msw-storybook-addon/csf3';

import { withLocale, withQueryClient, withRouter } from './decorators';
import { handlers } from '../src/mocks/handlers';

import type { Preview } from '@storybook/react-vite';

import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'i18n locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'ko' },

  parameters: {
    layout: 'centered',
    // dev·vitest·Playwright가 쓰는 것과 같은 핸들러. 픽스처 하나, 소비자 넷.
    msw: handlers,
    // 위반이 있으면 vitest 실행이 실패한다. 백로그를 못 치우고 먼저 머지해야 하면
    // 'todo'로 낮추되, 의식적으로 낮춘다.
    a11y: { test: 'error' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },

  loaders: [mswLoader()],

  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    withLocale,
    withQueryClient,
    withRouter,
  ],
};

export default preview;
