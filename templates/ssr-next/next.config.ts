// #if cloudflare
// // Cloudflare Workers 로컬 dev에서 바인딩(D1·R2·KV 등)을 쓰려면 필요한 훅이다.
// // import/order가 타입 import보다 이 값 import를 먼저 두라고 요구해서 호출부와 분리해뒀다.
// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// #endif

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;

// #if cloudflare
// // Storybook(`@storybook/nextjs-vite`)이 이 설정 파일을 불러오는데, 가드 없이 그냥
// // 두면 `bun run test`(vitest) 때도 로컬 workerd dev 런타임이 뜬다 — `next dev`
// // 전용 훅이라 테스트 프로세스 안에서 돌면 SQLite 락 충돌로 죽는다.
// if (!process.env.VITEST) initOpenNextCloudflareForDev();
// #endif
