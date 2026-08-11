---
description: MVVM 전 계층·배럴·로케일 네임스페이스·라우트까지 갖춘 feature를 스캐폴드한다
argument-hint: <feature-name>
---

`AGENTS.md` §2·§3을 그대로 따라 `$1` feature를 만든다.

`src/features/todos/`를 본으로 삼는다 — 베끼라고 있는 디렉토리다. 먼저 읽어라.

## 파일

```
src/features/$1/
├── index.ts                       # feature 배럴: 타입·훅·뷰
├── models/index.ts                # 생성된 타입·zod를 도메인 이름으로 재export
├── viewmodels/
│   ├── index.ts                   # View가 필요한 Model 타입도 여기서 재export
│   └── use-$1.ts                  # 쿼리 + 뮤테이션 + 수동 invalidate
└── views/
    ├── index.ts
    ├── components/index.ts
    └── pages/{index.ts,$1-page.tsx}
```

여기에 라우트 파일 하나. 이 템플릿의 라우팅 관례는 `AGENTS.md` §2 참고.

## 다들 까먹는 두 스텝

4. `src/locales/ko/$1.json`, `src/locales/en/$1.json` 생성
5. `src/common/lib/i18n.ts`의 `I18N_NAMESPACES`**와** `resources` **둘 다**에 `'$1'` 등록

하나라도 빠지면 `t('$1:…')`이 i18n과 무관해 보이는 메시지로 타입체크에서 깨진다.

## 걸려 넘어질 규칙

- 무효화(`invalidateQueries`)는 ViewModel이 직접 쓴다. 코드젠이 안 넣어준다.
- ViewModel은 도메인 액션과 zod 스키마를 반환한다. mutation 객체를 그대로 넘기지 않는다.
- View는 `../models`를 import할 수 없다. Model 타입이 필요하면 `viewmodels/index.ts`에서
  재export하고 거기서 가져온다.
- 컴포넌트마다 `index.stories.tsx`를 만든다.
- 네임스페이스를 명시 바인딩한다: `useTranslation(['$1', 'common'])`.

## 마무리

`bun run gen && bun run check`, 그다음 `bun run verify`.
로케일 JSON을 손으로 쓰지 않는다 — `t()` 호출을 먼저 넣고 `bun run gen:i18n`이 키를 만들게 한 뒤
한국어부터 채운다.
