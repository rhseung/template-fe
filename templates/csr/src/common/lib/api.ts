import { client } from '@/api/client.gen';

client.setConfig({
  // env가 비어 있으면 상대경로 `/api`로 나가고, dev와 테스트에서는 MSW가 받는다.
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  // 인증은 여기에 붙인다. 예:
  //   auth: () => useToken.getState().accessToken ?? undefined,
  // OpenAPI 스펙에 `security`도 같이 넣어야 SDK가 토큰을 실어 보낸다.
});

export { client };
