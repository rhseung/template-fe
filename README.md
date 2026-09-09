# template-fe

프론트엔드 패러다임별 프로젝트 템플릿입니다. `templates/*`는 각각 완전히 독립된
프로젝트이므로, degit으로 복사해서 그대로 사용하실 수 있습니다.

```sh
bunx degit rhseung/template-fe/templates/csr my-app && cd my-app && bun run init
```

`bun run init`을 실행하면 프로젝트명, 배포 타겟, 예제 유지 여부를 물어본 뒤에 설정을
맞추고, 스크립트 자신을 삭제한 다음 `bun install`까지 실행합니다. 그다음에는 `bun dev`
를 실행합니다.

## 템플릿

| | 적합한 상황 | 라우팅 | 렌더링 |
| --- | --- | --- | --- |
| **`csr`** | 대시보드나 사내 툴. 로그인한 뒤에 보는 화면이라 SEO가 의미 없을 때 | TanStack Router | client 전용 |
| `ssr-start` | TanStack DX를 그대로 유지하면서 SSR과 서버 함수까지 필요할 때 | TanStack Router | SSR + streaming |
| `ssr-next` | 생태계와 채용 압력, Vercel 네이티브 지원, RSC가 필요할 때 | App Router | RSC + SSR |
| `ssg` | 마케팅 사이트, 문서, 블로그. 콘텐츠가 중심일 때 | 파일 기반 | 정적 + island |

```sh
bunx degit rhseung/template-fe/templates/ssr-start my-app
bunx degit rhseung/template-fe/templates/ssr-next  my-app
bunx degit rhseung/template-fe/templates/ssg       my-app
```

> degit은 비어 있지 않은 디렉토리를 거부합니다. 덮어쓰려면 `--force`를 붙입니다.

## 공통 기능

- MVVM 구조를 lint로 강제합니다. `eslint-plugin-boundaries`가 View에서 Model로 직접 접근하는 것과 ViewModel이 View를
참조하는 것을 에러로 막습니다.
- 디렉토리 구조는 `src/features/<name>/{models,viewmodels,views}` 와 root barrel이 없는 `src/common/`으로 구성됩니다.
- 백엔드는 OpenAPI spec 하나만 있으면 연결됩니다. Hey API가 type, client, zod, react-query hook을 한 번에 생성합니다.
- i18n은 i18next-cli가 처리합니다. `t()` 호출에서 key를 추출하고 `src/@types`에 type까지 생성합니다. ko를 먼저
작성하고 en을 나중에 채웁니다.
- UI는 shadcn/ui (`base-nova`, Base UI), Tailwind v4 CSS-first, Phosphor 아이콘으로 구성합니다.
- Storybook story를 그대로 테스트로 사용합니다. theme과 locale toolbar decorator가 붙어 있고, vitest browser
프로젝트로 실행됩니다.
- Playwright e2e와 MSW를 함께 제공합니다. 백엔드를 실행하지 않아도 `bun dev`가 정상적으로 동작합니다.
- ESLint 설정은 엄격합니다. kebab-case, named export만 허용, barrel을 경유하는 import, React Compiler rule까지
  적용합니다.
- lint, typecheck, test는 pre-commit hook (husky, `bun run verify`)이 커밋할 때마다 실행합니다. CI는 build,
storybook, e2e만 담당하고, [react-doctor](https://react.doctor) 와 Claude (`review.yml`)가 PR을 리뷰합니다. 배포는
Cloudflare Pages와 Vercel의 git 연동이 처리하므로, 별도의 배포 워크플로는 없습니다.
- `AGENTS.md` 파일 하나를 Claude Code, Cursor, Copilot이 모두 읽습니다.

## 유지보수

이 저장소는 workspace가 아닙니다. 루트에서 `bun install`을 실행해도 템플릿 의존성이
설치되지 않는데, 이는 의도한 동작입니다. hoisting이 발생하면 템플릿이 선언하지 않은
패키지까지 resolve 되기 때문입니다. 그러면 모노레포 안에서는 빌드가 성공하지만, degit으로
복사해 간 사람의 환경에서만 빌드가 실패합니다.

```sh
cd templates/csr && bun install && bun dev   # 템플릿은 하나씩 실행

# 루트에서
bun run format  # shared/와 scripts/를 템플릿 prettier 설정으로 포맷
bun run sync    # shared/를 templates/*로 복사
bun run check   # drift 검사만 (CI에서 사용)
```

`shared/`를 수정했다면 `format`을 먼저 실행하고 `sync`를 나중에 실행합니다. 순서를
반대로 하면 포맷되지 않은 파일이 템플릿에 복사되고, 그 템플릿에서 `bun run verify`를
실행할 때 prettier 검사에 걸립니다.

`shared/files/**`는 디렉토리 트리 그대로 각 템플릿 루트에 복사됩니다. 별도의 manifest
파일은 없으며, 디렉토리 구조가 manifest 역할을 합니다. `shared/package.base.json`의
key는 각 템플릿의 `package.json`에 deep merge 되고, 템플릿 고유의 key는 그대로 유지됩니다.

`eslint.config.js`와 `tsconfig.json`은 전체를 복사하지 않고 base 파일과 얇은 wrapper로
나눕니다. flat config는 단순한 배열이고 tsconfig에는 `extends`가 있으므로, 각 도구의
네이티브 기능을 그대로 활용합니다.

> `sync`는 파일을 추가하거나 덮어쓰기만 합니다. `package.base.json`에서 의존성을
> 삭제해도 템플릿에서는 사라지지 않으므로 직접 삭제해야 합니다. 1년에 한 번 발생하는 일
> 때문에 remove 목록을 만들어 계속 관리하는 것보다 이 편이 비용이 적습니다.
