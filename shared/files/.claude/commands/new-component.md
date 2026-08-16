---
description: namespace props 관례와 스토리를 갖춘 컴포넌트 폴더를 만든다
argument-hint: <common|feature/<name>> <ComponentName>
---

`AGENTS.md` §4를 따라 `$1` 아래에 컴포넌트 `$2`를 만든다.

## 위치

- `common` → `src/common/components/layout/<kebab-name>/`,
  그리고 `src/common/components/index.ts`에 재export
- `feature/<name>` → `src/features/<name>/views/components/<kebab-name>/`,
  그리고 그 feature의 `views/components/index.ts`에 재export

`src/common/components/ui/`는 건드리지 않는다. 거긴 `bun run ui:add`가 만드는 곳이다.

## 파일

`index.tsx`:

```tsx
export function $2({ ... }: $2.Props) { ... }

export declare namespace $2 {
  export type Props = { ... };
}
```

`declare`는 필수다. 빼면 `react-refresh/only-export-components`가 경고하고,
CI는 `--max-warnings=0`으로 돈다.

`index.stories.tsx`: 도메인 접두 타이틀(`Common/$2`, `<Feature>/$2`), `@faker-js/faker`로 채운 args,
의미 있는 상태마다 스토리 하나(비어 있음 / 로딩 / 에러).
어서션할 만한 인터랙션이 있으면 `play()`를 붙인다 — 그대로 진짜 테스트가 된다.

## 규칙

- 표현 전용. ViewModel 호출도, `@/api`도, 페칭도 없다. props는 page가 내려준다.
- 아이템/행 모양은 Model 타입을 가져오지 말고 namespace 안에 직접 정의한다.
- 손으로 쓰는 variants는 `tailwind-variants`의 `tv()`.
- 시맨틱 색 토큰만. 팔레트 클래스를 그대로 쓰지 않는다.
- 레이아웃은 `space-y-*`가 아니라 `gap-*`. 가로세로가 같으면 `size-*`.

마무리는 `bun run check`.
