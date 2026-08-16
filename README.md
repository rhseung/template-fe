# template-fe

프론트엔드 패러다임별 프로젝트 템플릿. 각 `templates/*`는 **완전히 독립된 프로젝트**라
그대로 degit해서 쓰면 된다.

```sh
bunx degit rhseung/template-fe/templates/csr my-app && cd my-app && bun run init
```

`bun run init`이 프로젝트명·배포 타겟·예제 유지 여부를 물어보고 설정을 맞춘 뒤
자기 자신을 지우고 `bun install`까지 돌린다. 그다음은 `bun dev`.

## 어느 걸 고를까

|             | 이럴 때                                            | 라우팅          | 렌더링          |
| ----------- | -------------------------------------------------- | --------------- | --------------- |
| **`csr`**   | 대시보드·사내 툴. 로그인 뒤라 SEO가 의미 없을 때   | TanStack Router | 클라이언트 전용 |
| `ssr-start` | TanStack DX 그대로 SSR + 서버 함수까지 원할 때     | TanStack Router | SSR + 스트리밍  |
| `ssr-next`  | 생태계·채용 압력, Vercel 네이티브, RSC가 필요할 때 | App Router      | RSC + SSR       |
| `ssg`       | 마케팅 사이트·문서·블로그. 콘텐츠가 주인공일 때    | 파일 기반       | 정적 + 아일랜드 |

```sh
bunx degit rhseung/template-fe/templates/ssr-start my-app
bunx degit rhseung/template-fe/templates/ssr-next  my-app
bunx degit rhseung/template-fe/templates/ssg       my-app
```

> degit은 비어 있지 않은 디렉토리를 거부한다. 덮어쓰려면 `--force`.

## 공통으로 들어있는 것

- **MVVM을 린트로 강제한다.** `eslint-plugin-boundaries`가 View→Model 직접 접근, ViewModel→View 참조를 에러로 막는다.
- 구조는 `src/features/<name>/{models,viewmodels,views}` + 루트 배럴 없는 `src/common/`.
- **백엔드는 OpenAPI 스펙 하나면 붙는다.** Hey API가 타입·클라이언트·zod·react-query 훅을 한 번에 생성한다.
- i18n은 i18next-cli가 돌린다. `t()` 호출에서 키를 뽑고 `src/@types`에 타입까지 만든다. ko 먼저, en 나중.
- UI는 shadcn/ui(`base-nova` / Base UI) + Tailwind v4 CSS-first + Phosphor 아이콘.
- **Storybook 스토리가 곧 테스트다.** 테마·로케일 툴바 데코레이터가 붙어 있고 vitest 브라우저 프로젝트로 실행된다.
- Playwright e2e와 MSW가 같이 온다 — 백엔드 없이 `bun dev`가 돈다.
- ESLint는 엄격하다. kebab-case, named export만, 배럴 경유 import, React Compiler 룰까지.
- CI는 lint/typecheck/test/build/storybook을 다 돌리고, [react-doctor](https://react.doctor)가 PR을 스캔한다.
- `AGENTS.md` 하나를 Claude Code, Cursor, Copilot이 전부 읽는다.

## 유지보수

이 레포는 **workspace가 아니다.** 루트에서 `bun install`을 해도 템플릿 의존성은 안 깔린다.
의도적이다 — 호이스팅이 생기면 템플릿이 선언하지 않은 패키지를 resolve해버리고,
모노레포에선 빌드가 되는데 degit한 사람에게서만 깨진다.

```sh
cd templates/csr && bun install && bun dev   # 템플릿은 하나씩 연다

# 루트에서
bun run format  # shared/ 와 scripts/ 를 템플릿 prettier 설정으로 포맷
bun run sync    # shared/ → templates/*
bun run check   # drift 검사만 (CI가 쓰는 것)
```

`shared/`를 고쳤으면 **`format` → `sync` 순서**로 돌린다. 반대로 하면 포맷 안 된 파일이
템플릿에 복사되고 그 템플릿의 `bun run verify`가 prettier에서 걸린다.

`shared/files/**`는 트리 그대로 각 템플릿 루트에 복사된다. 매니페스트는 없다 —
디렉토리 구조가 곧 매니페스트다. `shared/package.base.json`의 키는 각 템플릿
`package.json`에 딥머지되고, 템플릿 고유 키는 그대로 살아남는다.

`eslint.config.js`와 `tsconfig.json`은 전체 복사가 아니라 **base 파일 + 얇은 래퍼**다.
flat config는 그냥 배열이고 tsconfig엔 `extends`가 있으니 네이티브 기능을 쓴다.

> `sync`는 추가·덮어쓰기만 한다. `package.base.json`에서 의존성을 지워도 템플릿에서
> 사라지지 않으니 손으로 지운다. 1년에 한 번 있는 일 때문에 remove 목록을 만들어
> 계속 관리하는 것보다 싸다.
