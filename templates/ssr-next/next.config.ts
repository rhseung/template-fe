// #if cloudflare
// // Cloudflare Workers 로컬 dev에서 바인딩(D1·R2·KV 등)을 쓰려면 이 훅이 필요하다.
// // `bun run init`이 타깃을 고르면 아래 주석이 벗겨진다. `import/order`가 `type`
// // import보다 이 값 import를 먼저 요구해서, 호출부(`initOpenNextCloudflareForDev()`)와는
// // 별도 블록으로 여기 최상단에 둔다.
// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// #endif

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;

// #if cloudflare
// initOpenNextCloudflareForDev();
// #endif
