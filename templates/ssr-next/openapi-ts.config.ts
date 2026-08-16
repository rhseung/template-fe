import { defineConfig } from '@hey-api/openapi-ts';

/**
 * `bun run gen:api` → `src/api/`. 기본 입력은 저장소에 든 로컬 스펙이라 오프라인에서 돈다.
 * 실제 백엔드로 바꾸려면 `.env`에 `OPENAPI_INPUT=https://your.api/openapi.json` 한 줄.
 */
export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? './openapi/example.json',
  // postProcess 없음: prettier와 eslint 모두 `src/api`를 무시하므로,
  // 생성물을 포맷해봐야 diff 노이즈만 생긴다.
  output: { path: 'src/api', postProcess: [] },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    'zod',
    { name: '@hey-api/sdk', validator: true },
    '@tanstack/react-query',
  ],
});
