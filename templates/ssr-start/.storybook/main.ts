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

  // 루트 `vite.config.ts`의 플러그인 배열이 그대로 여기로도 들어온다. `tanstackStart()`는
  // TanStack Start 앱 빌드 전용 서브플러그인 여러 개를 등록하는데(라우트 코드스플리터·
  // 클라이언트 엔트리 주입·매니페스트 캡처 등, `tanstack-start:*`/`tanstack-router:*`/
  // `tanstack:*` 이름 다 섞여 있다), Storybook도 자기 엔트리를 주입하려다 부딪혀서 "multiple
  // entries detected"나 "Cannot get config before root is resolved"로 빌드가 깨진다.
  // `@cloudflare/vite-plugin`/`nitro`도 마찬가지로 앱 셰이프를 전제하므로 같이 걸러낸다 —
  // Storybook엔 react+tailwind만 있으면 된다.
  async viteFinal(viteConfig) {
    // 배열로 여러 서브플러그인을 반환하는 게 있다 — Vite가 나중에 평탄화하지만 여기서 먼저 편다.
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
