/** 지원 언어의 단일 원천. `i18next.config.ts`도 같은 배열을 읽는다. */
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
