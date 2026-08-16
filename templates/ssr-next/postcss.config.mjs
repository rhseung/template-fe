/** Next.js 빌드(webpack/turbopack) 전용 — Storybook/vitest는 `vite.config.ts`의 `@tailwindcss/vite`를 쓴다. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
