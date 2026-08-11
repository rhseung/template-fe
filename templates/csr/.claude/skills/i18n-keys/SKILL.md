---
name: i18n-keys
description: 이 프로젝트에서 사용자에게 보이는 문자열을 추가·수정·삭제할 때 쓴다 — 버튼 라벨, 제목, 에러, 빈 상태, aria-label. i18next-cli 추출 루프, 네임스페이스 등록, 키가 조용히 사라지는 두 가지 경우를 다룬다. 트리거 — i18n, 번역, 로케일, 다국어, translation key, t(), useTranslation, locale JSON, ko/en.
---

# i18n 키

키는 코드에서 **써서** 만든다. 키를 추가하려고 JSON을 직접 편집하지 않는다 —
`removeUnusedKeys`가 켜져 있어서 호출부가 없는 키는 다음 실행에 지워진다.

## 루프

1. 컴포넌트에서 네임스페이스 하나를 바인딩한다: `useTranslation('todos')`
2. 키는 문자열이 아니라 **셀렉터 함수**로 부른다: `t(($) => $.form.submit)`
   (`enableSelector: true` — 다른 네임스페이스는 `t(($) => $.actions.switchLanguage, { ns: 'common' })`,
   보간값도 같은 자리에 옵션으로: `t(($) => $.page.remaining, { value: n })`)
3. `bun run gen:i18n`
4. `src/locales/ko/<ns>.json`을 먼저 채우고, 그다음 `src/locales/en/<ns>.json`
5. `bun run typecheck` — 생성된 `resources.d.ts`가 이제 그 키를 안다

## 새 네임스페이스

feature 하나당 네임스페이스 하나, 거기에 `common`. feature를 추가하면
`src/common/lib/i18n.ts`를 **두 군데** 고친다:

```ts
export const I18N_NAMESPACES = ['common', 'todos', '<new>'] as const;

resources: {
  ko: { common: commonKo, todos: todosKo, '<new>': newKo },
  en: { common: commonEn, todos: todosEn, '<new>': newEn },
}
```

위쪽 정적 import 두 줄도 같이 추가한다. 빠뜨리면 타입체크는 통과하는데
런타임에 키 문자열이 그대로 화면에 찍힌다.

## 키가 사라지는 두 가지 경우

**동적 키.** 셀렉터는 함수라 애초에 문자열 보간이 안 된다 — `t($ => $[x])` 같은 건 타입도,
추출도 안 통한다. 정적 조회로 바꾼다:

```tsx
const label: Record<Filter, string> = {
  all: t(($) => $.filter.all),
  active: t(($) => $.filter.active),
};
```

**주석.** `extractFromComments`가 켜져 있다. 주석 안에 번역 호출을 써두면 JSON에 진짜 키가 생긴다.
설명은 산문으로 쓰고 호출 형태를 붙여넣지 않는다.

## 도구가 JSON을 소유한다

`src/locales/**`를 손으로 열지 않는다. 키 이름을 바꿀 때도 마찬가지다:

```sh
bunx i18next-cli rename-key todos:form.submit todos:form.add   # 소스 + JSON 동시에 (rename-key는 ns:key 형태 유지)
bun run i18n:status                                            # 언어별 진행률
bun run i18n:sync                                              # 보조 언어를 ko 구조에 맞춤
bun run i18n:lint                                              # 하드코딩 문자열 탐지
```

## 검사

- CI가 `bun run gen` 후 `git diff --exit-code`를 돌린다. 트리가 더러워지면 키를 추가하고
  재생성을 안 했거나, 마지막 호출부가 사라진 키가 남아 있다는 뜻이다.
- `bun run i18n:lint`가 키로 빠져야 할 하드코딩 문자열을 보고한다.
- `aria-label`과 `data-testid`는 추출 대상에서 빠져 있지만, `aria-label`도 번역은 필요하다.
  셀렉터를 명시적으로 넣는다.

## `enableSelector`를 끄고 싶으면

`src/@types/i18next.d.ts`를 열어서 고치지 않는다 — 이미 존재하는 파일은 i18next-cli가
다시 쓰지 않는다(최초 생성 시에만 `i18next.config.ts`의 `types.enableSelector`를 반영한다).
`i18next.config.ts`를 고치고 `rm src/@types/i18next.d.ts && bun run gen:i18n`.

## 날짜

`dayjs.locale()`을 직접 호출하지 않는다. `src/common/lib/dayjs.ts`가 i18next의
`languageChanged`를 구독해 동기화하고 있어서, 수동 호출은 그 리스너와 싸운다.
