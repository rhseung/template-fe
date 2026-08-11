/**
 * 지원 언어 목록의 단일 원천.
 *
 * `i18next.config.ts`도 같은 배열을 읽으므로, 로케일을 추가할 때 손댈 곳은 여기 하나다.
 * 그다음 `bun run gen:i18n`이 JSON 파일을 만들어 준다.
 */
export const LANGUAGES = ['ko', 'en'] as const;

export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function detectLanguage(): Language {
  // `navigator?.language`까지만 옵셔널 체이닝하면 안 된다 — Node/Bun의 내장 `navigator`는
  // 존재하지만 `.language`가 없어서, 그다음 `.split()`이 `undefined`에서 터진다(SSR 환경).
  const candidate = globalThis.navigator?.language?.split('-')[0] ?? '';
  return isLanguage(candidate) ? candidate : 'ko';
}
