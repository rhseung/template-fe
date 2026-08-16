import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
    'msw-storybook-addon',
  ],
  staticDirs: ['../public'],

  // 루트 `vite.config.ts`의 플러그인이 그대로 들어온다. `tanstackStart()`/`cloudflare()`/
  // `nitro()`는 실제 앱 빌드 셰이프를 전제해서, Storybook이 자기 엔트리를 주입하려다
  // "multiple entries detected" 같은 에러로 부딪힌다 — 걸러낸다. Storybook엔 react+tailwind면 된다.
  async viteFinal(viteConfig) {
    // 일부 서브플러그인은 배열로 여러 개를 반환하므로 필터링 전에 먼저 편다.
    const flatten = (plugins: unknown[]): unknown[] =>
      plugins.flatMap((p) => (Array.isArray(p) ? flatten(p) : [p]));

    viteConfig.plugins = flatten(viteConfig.plugins ?? []).filter((plugin) => {
      const name = plugin && typeof plugin === 'object' && 'name' in plugin ? plugin.name : '';
      return typeof name !== 'string' || !/^tanstack[-:]|cloudflare|^nitro/.test(name);
    }) as typeof viteConfig.plugins;

    return viteConfig;
  },
};

export default config;
