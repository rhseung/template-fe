import { defineConfig } from '@hey-api/openapi-ts';

/**
 * `bun run gen:api` → `src/api/`.
 *
 * 기본 입력은 저장소에 들어있는 스펙이다. 그래서 코드젠이 오프라인에서 돌고,
 * 남의 데모 서버가 바뀌었다고 깨지는 일이 없다. 실제 백엔드로 바꾸려면 `.env`에 한 줄:
 *
 *   OPENAPI_INPUT=https://your.api/openapi.json
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
    // `validator: true`가 HTTP 계층에서 응답을 파싱하므로,
    // ViewModel이 SDK가 이미 검증한 걸 다시 파싱할 일이 없다.
    { name: '@hey-api/sdk', validator: true },
    '@tanstack/react-query',
  ],
});
