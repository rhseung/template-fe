// 프레임워크에 무관한 절반은 `eslint.base.js`에 있다(템플릿 모노레포에서 동기화됨).
// 여기에는 라우팅·프레임워크 플러그인만 온다.
import tanstackQuery from '@tanstack/eslint-plugin-query';

import nextPlugin from '@next/eslint-plugin-next';

import base from './eslint.base.js';

export default [
  ...base,
  nextPlugin.configs['core-web-vitals'],
  ...tanstackQuery.configs['flat/recommended'],
  {
    // App Router 예약 파일(`page.tsx`, `layout.tsx`, `not-found.tsx`…)은 default export가
    // 강제고, 파일명도 Next 컨벤션이라 kebab-case 검사와 안 맞는다.
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
      'check-file/filename-naming-convention': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
];
