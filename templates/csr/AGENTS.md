# Agent Guide

## 0. 이 파일을 읽는 법

- Claude Code(`CLAUDE.md`가 이 파일을 import한다), Cursor, Copilot이 전부 이 파일 하나를 본다.
- 여기 적힌 규칙 대부분은 **ESLint가 강제**한다. 애매하면 `bun run lint`가 정답이다.
- 규칙이 불편하면 규칙을 끄지 말고 물어봐라. 대부분은 이유가 있고, 없으면 같이 지우면 된다.

## 1. Environment & Tooling

- **Bun만 쓴다.** npm/yarn/pnpm 금지. 설치·스크립트·락파일 전부 Bun.
- **TypeScript는 6.x에 고정**되어 있다. 7은 `typescript-eslint`가 아직 지원하지 않아
  type-aware 린팅이 통째로 깨진다. 올리지 말 것.
- `es-toolkit`이 있다. 유틸을 직접 만들기 전에 먼저 찾아본다.

| 명령                | 언제                                          |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | 개발 (:5173, MSW 켜짐)                        |
| `bun run storybook` | 컴포넌트 작업 (:6006)                         |
| `bun run check`     | **커밋 전** — prettier --write + eslint --fix |
| `bun run verify`    | **PR 전** — format+lint+typecheck+doctor+test |
| `bun run gen`       | 스펙/키/라우트를 바꾼 뒤                      |
| `bun run ui:add`    | shadcn 컴포넌트 추가                          |

### 생성물은 손대지 않는다

`src/api/`, `src/@types/`, `src/routeTree.gen.ts`는 생성물이고 **커밋되어 있다**.
(Bun이 루트 패키지의 `prepare`/`postinstall`을 실행하지 않아서, 설치 시 재생성 훅은
조용히 아무 일도 안 한다. 그래서 커밋한다.)

손으로 고치면 다음 `bun run gen`에 사라진다. 에디터에서도 읽기 전용으로 잠겨 있다.
CI는 `bun run gen` 후 `git diff --exit-code`로 최신인지 검증한다.

## 2. 아키텍처 — MVVM + feature-first

```
src/
├── common/                    # 크로스 피처. 루트 배럴 없음.
│   ├── components/
│   │   ├── ui/                #   프리미티브 (shadcn CLI 생성, 손으로 안 만든다)
│   │   └── layout/            #   앱을 아는 조합 컴포넌트
│   ├── lib/                   #   라이브러리 설정·싱글턴 (i18n, dayjs, api)
│   └── utils/                 #   순수 헬퍼 (cn)
├── features/<name>/
│   ├── index.ts               #   feature 배럴 — 바깥에서 볼 수 있는 유일한 표면
│   ├── models/                #   생성 타입·zod를 도메인 이름으로 재export
│   ├── viewmodels/            #   훅. 쿼리·뮤테이션·클라이언트 상태·순수 로직
│   └── views/
│       ├── components/        #     props만 받는 표현 컴포넌트
│       └── pages/             #     ViewModel을 호출하는 화면 전체 프레임
├── routes/                    # 5줄짜리 마운트 포인트
├── locales/{ko,en}/           # i18next-cli 생성
└── mocks/                     # MSW. dev·Storybook·vitest·Playwright 공유
```

### 계층 접근 규칙

| 계층      | 책임                                 | 생성 API 접근                      |
| --------- | ------------------------------------ | ---------------------------------- |
| Model     | 도메인 타입·zod. 로직 없음.          | `@/api/zod.gen`, `@/api/types.gen` |
| ViewModel | 페치·뮤테이션·무효화·클라이언트 상태 | `@/api/@tanstack/react-query.gen`  |
| View      | UI                                   | **없음** — ViewModel 훅만          |
| Route     | feature page 마운트                  | feature 배럴만                     |

한 방향이다. View↛Model, ViewModel↛View, Model↛상위.
`eslint-plugin-boundaries`가 한국어 메시지로 막는다.

**View가 Model 타입이 필요하면** ViewModel 배럴이 재export한다 (`viewmodels/index.ts`).
이게 정식 경로다. `views/`에서 `../models`를 직접 import하면 린트 에러다.

### import 규칙

- `@/common/<area>`만. `@/common`(루트 배럴)은 없고, `@/common/components/ui/button`은 금지.
- 다른 feature는 `@/features/<name>` 배럴만. 내부 경로 직접 접근 금지.
- 같은 feature 안에서는 `../models`, `../../viewmodels` 처럼 **디렉토리**를 가리킨다.
- `@/api/**`는 위 표에 적힌 파일에서만.

### 배럴 규칙

- named export만. `export { default as X }` 금지, `export *`도 쓰지 않는다
  (예외: `common/lib/index.ts` — 부수효과 트리거를 겸한다).
- `import/no-default-export`가 `src/**`에서 에러다. 스토리 파일만 예외.

### 완결 예시

`src/features/todos/`가 전 계층을 한 번씩 다 보여준다. 새 기능을 만들 땐 여기를 그대로 베낀다.

- `models/index.ts` — 생성 zod 재export + `TODO_TITLE_MAX` 같은 UI 상수
- `viewmodels/sort-todos.ts` — React 없는 순수 로직 (+ `.test.ts`)
- `viewmodels/use-todos.ts` — `useQuery(getTodosOptions())` + 뮤테이션 + **수동 invalidate**
- `viewmodels/use-todo-filter.ts` — zustand + persist
- `views/components/todo-list/` — props만 받음. `namespace Props`, `tv()`, dayjs
- `views/components/todo-form/` — TanStack Form + ViewModel이 넘겨준 zod 스키마
- `views/pages/todos-page.tsx` — 두 ViewModel 호출 + 화면 전체 조립
- `routes/todos.tsx` — 5줄

## 3. 새 기능 추가 절차

`/new-feature <name>` 커맨드가 아래를 다 해준다. 손으로 할 때 빠뜨리기 쉬운 게 4·5번이다.

1. `src/features/<name>/{models,viewmodels,views/{components,pages}}` + 각 `index.ts`
2. `models/index.ts`에 생성 타입·zod 재export
3. `viewmodels/use-<name>.ts` — 쿼리/뮤테이션. **invalidate는 여기서 손으로 쓴다** (코드젠이 안 넣어준다)
4. `src/locales/{ko,en}/<name>.json` 생성
5. `src/common/lib/i18n.ts`의 `I18N_NAMESPACES`와 `resources`에 등록
6. `src/routes/<name>.tsx` — feature 배럴만 import
7. `bun run gen && bun run check`

## 4. UI

### shadcn/ui

- **프리미티브를 손으로 만들지 않는다.** `bun run ui:add <name>` 후
  `src/common/components/index.ts`에 재export.
- 스타일은 `base-nova` = **Base UI**. Radix가 아니다.
  → 합성은 `asChild`가 아니라 **`render` prop**: `<Button render={<Link to="/">…</Link>} />`
- 아이콘은 **Phosphor**. `components.json`의 `iconLibrary`가 `phosphor`라 CLI가 알아서
  `@phosphor-icons/react`로 생성한다. 손으로 바꿀 일 없다.
- 생성된 `ui/**`는 린트 예외가 걸려 있다. 고치지 말고 재생성한다.

### 컴포넌트 규약

- 폴더 = 컴포넌트 이름(kebab-case). 구현은 `index.tsx`, 스토리는 `index.stories.tsx`.
- **스토리 없는 컴포넌트는 만들지 않는다.** ViewModel을 목킹하고 faker를 쓰면 된다.
- 스토리 `title`은 도메인 접두: `Common/…`, `<Feature>/…`, `<Feature>/Pages/…`
- props 타입은 declaration-merged namespace:
  ```tsx
  export declare namespace Button {
    export type Props = { … };
  }
  ```
  `declare`를 빼면 `react-refresh/only-export-components`가 경고한다.

### 스타일

- 손으로 쓰는 variants는 `tailwind-variants`(`tv()`). shadcn이 만든 CVA는 그대로 둔다.
- 색을 하드코딩하지 않는다. `src/styles.css`의 시맨틱 토큰(`bg-card`, `text-muted-foreground`)만.
- 정렬은 `prettier-plugin-tailwindcss`가 한다. 손으로 정렬하지 않는다.

## 5. 데이터

### Hey API 코드젠

`openapi/example.json`(또는 `.env`의 `OPENAPI_INPUT`) → `bun run gen:api` → `src/api/`.

| 필요한 것          | 어디서                                               |
| ------------------ | ---------------------------------------------------- |
| 타입               | `@/api/types.gen` (models에서만)                     |
| zod 스키마         | `@/api/zod.gen` (models에서만)                       |
| 쿼리/뮤테이션 옵션 | `@/api/@tanstack/react-query.gen` (viewmodels에서만) |

- GET → `getXxxOptions()` + `useQuery`
- POST/PATCH/DELETE → `xxxMutation()` + `useMutation`
- **무효화는 ViewModel에서 손으로.** `queryClient.invalidateQueries({ queryKey: getXxxQueryKey() })`
- SDK가 `validator: true`로 응답을 이미 검증한다. ViewModel에서 다시 parse하지 않는다.
- ViewModel은 mutation 객체를 그대로 반환하지 않는다. 좁은 도메인 액션·불리언·스키마만 준다.

### 폼

`@tanstack/react-form`. react-hook-form 금지.
zod v4는 Standard Schema라서 resolver 패키지 없이 `validators`에 그대로 넣는다.
스키마는 ViewModel이 prop으로 넘긴다 — View가 Model을 import하지 않게.

### 상태

- 서버 상태 → TanStack Query. **zustand에 복사하지 않는다.**
- 전역 클라이언트 상태 → zustand (`viewmodels/` 안에).
- 화면 상태 → page의 `useState`.

## 6. i18n & dayjs

### 로케일 JSON은 전부 i18next-cli가 만든다

`src/locales/**`를 **손으로 편집하지 않는다.** 키는 코드에서 `t()`를 쓰면 생기고,
호출부를 지우면 `removeUnusedKeys`가 키도 지운다. 사람이 채우는 건 값(번역문)뿐이다.

| 명령                                      | 하는 일                                         |
| ----------------------------------------- | ----------------------------------------------- |
| `bun run gen:i18n`                        | 추출 + 타입 생성. 키를 추가/삭제한 뒤 항상 이것 |
| `bun run i18n:status`                     | 언어별 번역 진행률                              |
| `bun run i18n:sync`                       | 보조 언어 파일을 기준 언어(ko) 구조에 맞춤      |
| `bun run i18n:lint`                       | 키로 빠져야 할 하드코딩 문자열 탐지             |
| `bunx i18next-cli rename-key <old> <new>` | 소스와 JSON을 한 번에 리네임                    |

키 이름을 바꿀 때도 JSON을 열지 않는다 — `rename-key`가 호출부와 파일을 같이 고친다.
CI는 `bun run gen` 후 `git diff --exit-code`로 JSON이 최신인지 검증한다.

- 네임스페이스 = feature 이름 + `common`. `defaultNS`는 `common`.
- 컴포넌트는 **네임스페이스 하나를 바인딩**한다: `useTranslation('todos')`,
  그 안에서는 `t('form.submit')`처럼 **키를 그대로** 쓴다 (`ns:` 접두 없음).
- 다른 네임스페이스 키가 필요하면 `t('actions.switchLanguage', { ns: 'common' })`처럼
  옵션으로 넘긴다. `t('common:actions.switchLanguage')` 형태는 쓰지 않는다.
- 새 키를 넣었으면 `bun run gen:i18n`. ko를 먼저 채우고 en을 채운다.
- **`extractFromComments`가 켜져 있다.** 주석 안에 번역 호출을 그대로 써두면 진짜 키가 생긴다.
  주석에는 설명만 쓰고 호출 형태를 붙여넣지 않는다.
- 동적 키(``t(`ns:${x}`)``)는 추출되지 않고 `removeUnusedKeys`에 지워진다.
  정적 맵을 만들어서 쓴다 (`todos-page.tsx`의 `filterLabel` 참고).
- dayjs 로케일은 `common/lib/dayjs.ts`가 i18next를 따라가게 해뒀다. 직접 `dayjs.locale()`을 부르지 않는다.

## 7. 테스트

- **스토리가 곧 테스트다.** 모든 `*.stories.tsx`가 vitest 브라우저 프로젝트(chromium)에서 실행되고,
  `play()`가 있으면 인터랙션 테스트가 된다. a11y 위반은 실패다.
- 순수 로직만 `*.test.ts` (jsdom 프로젝트).
- e2e는 사용자 여정 하나에 spec 하나. 컴포넌트 상태 조합은 Storybook이 이미 커버한다.
- 목 데이터는 `src/mocks/handlers.ts` 한 곳. 네 군데가 공유한다.
- 비동기로 갱신되는 컨트롤은 Playwright `check()` 말고 `click()` + `toBeChecked()`.
  `check()`는 상태가 오기 전에 다시 클릭해서 되돌린다.

## 8. es-toolkit

- 유틸을 직접 만들기 전에 `es-toolkit`에 있는지 본다. lodash는 쓰지 않는다.
- 변환 파이프라인은 `es-toolkit/fp` + `pipe`.
- `es-toolkit/compat`은 피한다 (lodash 호환 레이어).
- **안 쓰는 경우**: 날짜는 dayjs, 클래스 병합은 `cn`, 네이티브 한 줄로 되는 것.

## 9. Commits & PRs

`<type>: <title>`, 명령형. PR 전에 `bun run verify`.

`feat` 새 기능 · `fix` 버그 · `docs` 문서 · `style` 서식 · `refactor` 구조 ·
`test` 테스트 · `chore` 잡무 · `ci` CI 설정

## 10. LLM 지침

- **한국어로 답한다.**
- `git reset --hard` 같은 파괴적 명령은 명시적으로 요청받았을 때만.
- 컴포넌트를 만들면 스토리도 만든다. 예외 없다.
- 린트 규칙을 끄는 커밋을 만들지 않는다. 막히면 물어본다.
- 생성물(`src/api`, `src/@types`, `routeTree.gen.ts`)을 편집하지 않는다.

## 11. 예제 지우기

`bun run init`에서 이미 물어봤다면 끝났다. 나중에 지우려면:

```sh
rm -rf src/features/todos src/routes/todos.tsx src/locales/*/todos.json \
       e2e/todos.spec.ts openapi/example.json
```

그리고 `src/common/lib/i18n.ts`(네임스페이스), `src/mocks/handlers.ts`(빈 배열),
`src/routes/index.tsx`(리다이렉트) 세 군데를 정리한다.
