---
name: shadcn-here
description: 이 프로젝트에서 shadcn/ui 컴포넌트를 추가·수정·조합하기 전에 읽는다. 공식 shadcn 스킬 위에 이 레포의 4가지 원칙만 얹는다 — Radix가 아닌 Base UI, components 배럴, 프리미티브 수제 금지, 스토리 필수. 트리거 — shadcn, ui:add, Button, Dialog, Field, 프리미티브, 컴포넌트 추가.
---

# 이 레포의 shadcn

공식 `shadcn` 스킬을 먼저 로드한다 — CLI·조합 규칙·컴포넌트 문서는 그쪽 소관이다.
이 파일은 이 프로젝트에만 해당하는 4가지뿐이다.

## 1. Radix가 아니라 Base UI

`components.json`이 `style: "base-nova"`라서 프리미티브는 `@base-ui/react`에서 온다.

합성은 `asChild`가 아니라 **`render` prop**:

```tsx
<Button nativeButton={false} render={<Link to="/">Home</Link>} />
```

인터넷에서 찾은 `asChild` 스니펫은 Radix 스타일용이므로 번역해서 써야 한다.

## 2. 프리미티브를 손으로 만들지 않는다

```sh
bun run ui:add button card dialog
```

그다음 새로 생긴 이름을 `src/common/components/index.ts`에 재export한다.
그 배럴이 앱의 유일한 import 표면이다 — `src/common` 바깥에서
`@/common/components/ui/button`은 린트 에러다.

`ui/` 아래 생성 파일에는 린트 예외가 걸려 있다. 뭔가 잘못됐으면 재생성하거나 업스트림에 알린다.
직접 패치하면 다음 `ui:add`에 덮어써진다.

## 3. 아이콘은 Phosphor이고, CLI가 이미 안다

`iconLibrary`가 `phosphor`라서 `bun run ui:add`가 알아서 `@phosphor-icons/react` import를 뱉는다.
교체 단계가 없다. `Button` 안의 아이콘은 `data-icon="inline-start"`를 붙이고 사이즈 클래스는 안 준다 —
컴포넌트가 크기를 정한다.

## 4. 컴포넌트마다 스토리

프리미티브를 조합해 만든 것도 포함이다. kebab-case 폴더에 `index.tsx` + `index.stories.tsx`,
타이틀은 도메인 접두. 스토리가 브라우저 테스트로 돌기 때문에,
스토리 없는 컴포넌트는 아무도 검증하지 않은 컴포넌트다.

## 스타일 주의사항

- 시맨틱 토큰만(`bg-card`, `text-muted-foreground`). 팔레트 클래스 직접 사용 금지,
  `dark:` 색 오버라이드도 손으로 쓰지 않는다 — 토큰이 이미 뒤집힌다.
- `space-y-*`가 아니라 `gap-*`. 가로세로가 같으면 `size-*`.
- 손으로 쓰는 variants는 `tailwind-variants`의 `tv()`. shadcn의 CVA는 그대로 둔다.
- 클래스 정렬은 prettier가 한다.
