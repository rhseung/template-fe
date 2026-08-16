// 프레임워크에 무관한 절반은 `eslint.base.js`에 있다(템플릿 모노레포에서 동기화됨).
// 여기에는 라우팅·프레임워크 플러그인만 온다.
import tanstackQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';

import base from './eslint.base.js';

export default [
  ...base,
  ...tanstackRouter.configs['flat/recommended'],
  ...tanstackQuery.configs['flat/recommended'],
  {
    // TanStack Router 파일 라우트: `$id.tsx`, `_authenticated/` — kebab-case가 적용되지 않고,
    // `Route`와 컴포넌트가 한 파일에 같이 있는 게 의도된 관례다.
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'check-file/filename-naming-convention': 'off',
      'check-file/folder-naming-convention': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
];
