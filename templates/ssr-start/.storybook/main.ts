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
  // 라우트 코드스플리터·클라이언트 엔트리 주입·매니페스트 캡처 같은 TanStack Start 앱 빌드
  // 전용 서브플러그인을 잔뜩 등록하는데(`tanstack-start:*`/`tanstack-router:*`/`tanstack:*`),
  // Storybook도 자기 엔트리를 주입하려다 이것들과 부딪혀서 "multiple entries detected"나
  // "Cannot get config before root is resolved"로 빌드가 깨진다. `@cloudflare/vite-plugin`과
  // `nitro`도 앱 셰이프를 전제하는 건 마찬가지라 같이 걸러낸다. Storybook엔 react+tailwind만
  // 있으면 충분하다.
  async viteFinal(viteConfig) {
    // 서브플러그인 중 일부는 배열로 여러 개를 한꺼번에 반환한다. Vite가 나중에 평탄화하긴
    // 하지만 필터링을 위해 여기서 먼저 편다.
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
