// #if cloudflare
// // Cloudflare Workers 로컬 dev에서 바인딩(D1·R2·KV 등)을 쓰려면 필요한 훅이다.
// // import/order가 타입 import보다 이 값 import를 먼저 두라고 요구해서 호출부와 분리해뒀다.
// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// #endif

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;

// #if cloudflare
// initOpenNextCloudflareForDev();
// #endif
