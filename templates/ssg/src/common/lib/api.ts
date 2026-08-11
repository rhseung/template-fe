import { client } from '@/api/client.gen';

/**
 * 생성된 클라이언트의 런타임 설정.
 *
 * `@/common/lib` 배럴이 부수효과로 이 파일을 가져오고, 앱 엔트리가 그 배럴을 한 번 import한다.
 * 그 외의 코드는 ViewModel 안에서 생성된 `*Options()` / `*Mutation()` 헬퍼로만 API와 대화한다.
 */
client.setConfig({
  // env가 비어 있으면 상대경로 `/api`로 나가고, dev와 테스트에서는 MSW가 받는다.
  baseUrl: import.meta.env.PUBLIC_API_BASE_URL || '/api',

  // 인증은 여기에 붙인다. 예:
  //   auth: () => useToken.getState().accessToken ?? undefined,
  // OpenAPI 스펙에 `security`도 같이 넣어야 SDK가 토큰을 실어 보낸다.
});

export { client };
