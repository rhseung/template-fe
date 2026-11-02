# 리뷰 지침

claude-review-plugin이 PR을 검토할 때 `AGENTS.md`와 함께 읽는 파일입니다.

## 볼 것

- `eslint-plugin-boundaries`가 놓친 MVVM 레이어 위반
- View가 `@/api`를 import하거나 ViewModel이 UI에 손대는 경우
- `index.stories.tsx` 없이 추가된 컴포넌트
- i18n namespace를 거치지 않은 사용자 문구
- stale closure, effect 순서, 실행되지 않는 캐시 무효화
- 쓸모없는 추상화: 구현이 하나뿐인 인터페이스, 바뀌지 않는 값의 설정, 전달만 하는 래퍼

## 보지 않을 것

- ESLint, Prettier, TypeScript가 이미 잡는 것
