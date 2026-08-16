// #if cloudflare
// // Cloudflare Workers 로컬 dev에서 바인딩(D1·R2·KV 등)을 쓰려면 필요한 훅이다.
// // `bun run init`이 타깃을 고르면 이 주석이 풀린다. import/order가 타입 import보다
// // 이 값 import를 먼저 두라고 요구해서, 아래 호출부(`initOpenNextCloudflareForDev()`)와
// // 떨어뜨려 여기 맨 위에 둔 것뿐이다.
// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// #endif

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;

// #if cloudflare
// initOpenNextCloudflareForDev();
// #endif
