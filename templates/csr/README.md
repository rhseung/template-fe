# template-fe / csr

Vite + React 19 + TanStack Router. 클라이언트 렌더링 SPA.

```sh
bunx degit rhseung/template-fe/templates/csr my-app && cd my-app && bun run init
```

`bun run init`은 한 번만 돌고 자기 자신을 지운다. 아래 `<!-- template -->` 위쪽은
그때 잘려나가고 아래쪽만 프로젝트 README로 남는다.

<!-- template -->

## 시작하기

```sh
bun install
cp .env.example .env
bun run dev          # http://localhost:5173 — MSW가 켜져 있어 백엔드 없이 돈다
```

## 명령어

| 명령                       | 하는 일                                               |
| -------------------------- | ----------------------------------------------------- |
| `bun run dev`              | 개발 서버 (:5173)                                     |
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
├── routes/            # 5줄짜리 마운트 포인트. feature 배럴만 import.
├── locales/{ko,en}/   # i18next-cli 생성. 손으로 키를 만들지 않는다.
└── mocks/             # MSW. dev·Storybook·vitest·Playwright가 공유.
```

계층 규칙은 ESLint가 강제한다. View→Model 직접 접근, ViewModel→View 참조가 막혀 있고
Model은 항상 최하위다. 어기면 한국어 에러 메시지가 고치는 법까지 알려준다.

자세한 규약은 [`AGENTS.md`](./AGENTS.md) — 사람과 AI 어시스턴트가 같은 파일을 읽는다.

## 예제(todos) 지우기

`bun run init`에서 "예제 유지?"에 `n`을 답하면 자동으로 지워진다. 나중에 지우려면:

```sh
rm -rf src/features/todos src/routes/todos.tsx src/locales/*/todos.json \
       e2e/todos.spec.ts openapi/example.json
```

그다음 세 군데만 손보면 끝이다 — `src/common/lib/i18n.ts`의 `I18N_NAMESPACES`에서
`'todos'` 제거, `src/mocks/handlers.ts` 비우기, `src/routes/index.tsx`의 리다이렉트 제거.

## 생성물에 대하여

`src/api/`, `src/@types/`, `src/routeTree.gen.ts`는 **생성물이지만 커밋한다.**
Bun이 루트 패키지의 `prepare`·`postinstall`을 실행하지 않아 설치 시 재생성 훅은 조용히
아무것도 안 한다. 새로 클론한 사람은 깨진 `bun dev`를 만난다.

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

`bun run init`이 고른 타겟에 맞춰 `wrangler.jsonc` 또는 `vercel.json` 하나만 남기고,
`.github/workflows/deploy-*.yml`도 하나만 남긴다. 필요한 시크릿은 그 워크플로 상단에.

## AI 코드리뷰

아무것도 안 해도 되는 쪽부터: [CodeRabbit](https://github.com/marketplace/coderabbitai)
GitHub App만 설치하면 끝난다. 공개 레포는 영구 무료고 설정 파일도 시크릿도 필요 없고
포크 PR까지 리뷰해준다.

Claude로 하고 싶으면 조금 더 손이 간다. `claude setup-token`으로 `CLAUDE_CODE_OAUTH_TOKEN`
시크릿을 만들고 레포 변수에 `ENABLE_CLAUDE_REVIEW=true`를 추가하면 된다
(`.github/workflows/review.yml` 참고).

공짜로 하나 더 얹고 싶으면 Settings → Code security에서 CodeQL default setup만 켜면 된다.

`react-doctor.yml`은 시크릿이 필요 없어서 애초에 켜져 있다.
