# template-fe / ssr-start

TanStack Start. TanStack DX 그대로 SSR + 스트리밍.

```sh
bunx degit rhseung/template-fe/templates/ssr-start my-app && cd my-app && bun run init
```

`bun run init`은 한 번만 돌고 자기 자신을 지운다. 아래 `<!-- template -->` 위쪽은
그때 잘려나가고, 아래쪽만 프로젝트 README로 남는다.

<!-- template -->

## 시작하기

```sh
bun install
cp .env.example .env
bun run dev          # http://localhost:3000 — MSW가 켜져 있어 백엔드 없이 돈다
```

## 명령어

| 명령                       | 하는 일                                               |
| -------------------------- | ----------------------------------------------------- |
| `bun run dev`              | 개발 서버 (:3000)                                     |
| `bun run storybook`        | Storybook (:6006)                                     |
| `bun run check`            | prettier --write + eslint --fix — **커밋 전**         |
| `bun run verify`           | format + lint + typecheck + doctor + test — **PR 전** |
| `bun run test`             | vitest — 스토리(브라우저) + 순수 로직(jsdom)          |
| `bun run test:e2e`         | Playwright (최초 1회 `bun run test:e2e:install`)      |
| `bun run gen`              | API 클라이언트 + i18n 타입 + 라우트 트리 재생성       |
| `bun run test:e2e:install` | Playwright 브라우저 설치 (최초 1회)                   |
| `bun run ui:add button`    | shadcn 컴포넌트 추가                                  |

## 구조

```
src/
├── common/            # 크로스 피처. 루트 배럴 없음 — @/common/<area> 만.
│   ├── components/    #   ui/ (프리미티브) + layout/ (조합)
│   ├── lib/           #   라이브러리 설정·싱글턴 (i18n, dayjs, api)
│   └── utils/         #   순수 헬퍼 (cn)
├── features/<name>/   # 도메인 하나 = 폴더 하나
│   ├── models/        #   생성된 타입·zod를 도메인 이름으로 재export
│   ├── viewmodels/    #   훅. 쿼리·뮤테이션·클라이언트 상태
│   └── views/         #   components/ (props만 받음) + pages/ (VM 호출, 화면 전체)
├── routes/            # TanStack Router 파일 라우트 + __root.tsx (SSR 셸)
├── router.tsx         # getRouter() — 서버·클라이언트 엔트리가 공유
├── locales/{ko,en}/   # i18next-cli 생성. 손으로 키를 만들지 않는다.
└── mocks/             # MSW. dev·Storybook·vitest·Playwright가 공유.
```

`csr`과 라우터가 같다(둘 다 TanStack Router). `main.tsx`/`index.html`이 없고,
`routes/__root.tsx`가 `component` 대신 `shellComponent`로 `<html>` 전체를 그린다.

계층 규칙은 ESLint가 강제한다. View→Model 직접 접근, ViewModel→View 참조가 막혀 있고
Model은 항상 최하위다. 어기면 한국어 에러 메시지가 고치는 법까지 알려준다.

`routes/__root.tsx`의 `RootDocument`는 마운트 전엔 아무것도 안 그린다. 서버엔
`navigator`가 없어 언어 감지가 클라이언트와 달라지고 MSW도 비동기로 뜬다. 서버·클라이언트
첫 렌더를 강제로 맞춰둔 이유다. 대신 자바스크립트가 실행되기 전까진 빈 화면이라는
트레이드오프를 감수한다. 자세한 내용은 [`AGENTS.md`](./AGENTS.md).

자세한 규약은 [`AGENTS.md`](./AGENTS.md) — 사람과 AI 어시스턴트가 같은 파일을 읽는다.

## 예제(todos) 지우기

`bun run init`에서 "예제 유지?"에 `n`을 답하면 자동으로 지워진다. 나중에 지우려면:

```sh
rm -rf src/features/todos src/routes/todos.tsx src/locales/*/todos.json \
       e2e/todos.spec.ts openapi/example.json
```

그다음 두 군데만 손보면 끝이다 — `src/common/lib/i18n.ts`의 `I18N_NAMESPACES`에서
`'todos'` 제거, `src/mocks/handlers.ts` 비우기. `src/routes/index.tsx`는 `/todos`로
리다이렉트하는 대신 직접 화면을 그리도록 다시 쓴다.

## 생성물

`src/api/`, `src/@types/`, `src/routeTree.gen.ts`는 **생성물이지만 커밋한다.** Bun은
루트 패키지의 `prepare`·`postinstall`을 실행하지 않는다. 그래서 설치 시 재생성 훅은
조용히 아무것도 안 하고 새로 클론한 사람은 `bun dev`가 깨진 상태로 만난다.

대신 CI가 `bun run gen` 후 `git diff --exit-code`로 체크인된 파일이 최신인지 검증한다.
손으로 고치지 말 것 — 다음 `bun run gen`에 사라진다. 에디터에서도 읽기 전용으로 잠가뒀다.

## 백엔드 붙이기

`.env`에 한 줄:

```sh
OPENAPI_INPUT=https://your.api/openapi.json
VITE_API_BASE_URL=https://your.api
VITE_ENABLE_MSW=false
```

그리고 `bun run gen:api`. `src/api/`가 통째로 다시 생성되고
`getXxxOptions()` / `postXxxMutation()` / `zXxx` 가 바로 쓸 수 있게 나온다.

## 배포

`bun run init`이 타겟을 고른다.

- **Cloudflare** — `@cloudflare/vite-plugin` + `wrangler.jsonc`. csr/ssg/ssr-next와
  같은 성숙도. 단, Bun의 `ws` 구현이 workerd 웹소켓 브리지를 아직 지원하지 않아서
  이 타깃에서만 `bun run dev`/`preview`가 내부적으로 Node로 vite를 돌린다(`init`이
  자동으로 스크립트를 바꿔준다) — 자세한 이유는 [`AGENTS.md`](./AGENTS.md).
- **Vercel** — `nitro`(`nitro/vite` 플러그인) 경유. **2026-08 기준 `nitro`가 여전히
  베타(`3.0.260610-beta`)다** — 실제 배포 전에
  [nitro 릴리스](https://github.com/nitrojs/nitro/releases)에서 정식 버전이 나왔는지
  확인해라. 이 템플릿이 네 개 중 마지막으로 만들어진 이유가 이 베타 의존성이다.

배포는 각 플랫폼의 git 연동이 push마다 알아서 한다 — 별도 GHA 워크플로는 없다.
Cloudflare Workers Builds(git 연동)는 `wrangler.jsonc`의 빌드 설정을 보지 않는다 — 락파일
그대로 쓰게 하려면 대시보드에서 직접: Settings > Build > Build Variables에
`SKIP_DEPENDENCY_INSTALL=1`을 추가하고, Build command를
`bun install --frozen-lockfile && bun run build`로 바꾼다.

## AI 코드리뷰

PR 리뷰를 Claude 에 맡긴다 ([claude-review-plugin](https://github.com/rhseung/claude-review-plugin)).
PR 생성과 push 마다 `AGENTS.md` 의 규칙을 기준으로 변경분을 검토하고, 위반 지점에 인라인 코멘트를
남긴다. 수정 후 push 하면 해결된 스레드를 닫고 새 변경분만 재검토하며, 남은 사항이 없으면
approve 한다.

활성화:

```sh
open https://github.com/apps/claude/installations/new   # Claude GitHub App. 레포 선택. 한 번만
claude setup-token                                      # 구독 OAuth 토큰(1년). Pro/Max/Team
gh secret set CLAUDE_CODE_OAUTH_TOKEN                   # 위 토큰 붙여넣기
gh variable set ENABLE_CLAUDE_REVIEW --body true
```

- 코멘트에는 스레드 답글로 응답한다. 타당하면 스레드를 닫는다.
- 지시는 PR 코멘트에 `@claude` 멘션으로 한다. `@claude review` 는 push 없는 재검토.
- 비활성화: `gh variable set ENABLE_CLAUDE_REVIEW --body false`.
- 포크 PR 은 검토 대상에서 제외한다.
- 토큰 만료 시 `claude setup-token` 과 `gh secret set` 을 재실행한다.

`react-doctor.yml` 은 시크릿 없이 처음부터 켜져 있다. CodeQL 은 Settings → Code security 에서
default setup 을 켠다.
