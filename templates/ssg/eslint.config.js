// 프레임워크에 무관한 절반은 `eslint.base.js`에 있다(템플릿 모노레포에서 동기화됨).
// 여기에는 라우팅·프레임워크 플러그인만 온다.
import tanstackQuery from '@tanstack/eslint-plugin-query';
import astro from 'eslint-plugin-astro';

import base from './eslint.base.js';

export default [
  ...base,
  ...astro.configs.recommended,
  ...tanstackQuery.configs['flat/recommended'],
  {
    // `.astro`는 라우팅 셸일 뿐이다 — 실제 UI·번역 문자열은 전부 `.tsx` 아일랜드에 있다.
    // boundaries·no-default-export가 `.astro` 파일 구조와 안 맞아서 여기서만 끈다.
    files: ['src/pages/**/*.astro', 'src/layouts/**/*.astro'],
    rules: {
      'check-file/filename-naming-convention': 'off',
      'import/no-default-export': 'off',
    },
  },
];
