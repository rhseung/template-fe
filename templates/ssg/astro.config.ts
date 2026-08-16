import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

/**
 * `output: 'static'`(기본값)이 CSR의 `vite build`와 같은 자리다 — 결과물은 정적 파일뿐이고
 * Cloudflare Pages·Vercel 둘 다 어댑터 없이 `dist/`를 그대로 서빙한다. 타깃별 차이는 여기가
 * 아니라 `wrangler.jsonc`/`vercel.json` 중 뭘 남기느냐에 있다(`bun run init` 참고).
 *
 * 나중에 서버 렌더링(API 라우트, 이미지 최적화 등)이 필요해지면 그때 `@astrojs/cloudflare`나
 * `@astrojs/vercel`을 어댑터로 추가하고 `output: 'server'`로 바꾼다.
 */
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': new URL('./src', import.meta.url).pathname },
    },
  },
});
