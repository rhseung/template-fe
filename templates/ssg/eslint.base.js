// SHARED — `shared/files/`에서 고치고 모노레포 루트에서 `bun run sync`.
//
// 린트 설정 중 프레임워크에 무관한 절반. 각 템플릿의 `eslint.config.js`가 이걸 펼친 뒤
// 자기 라우터·프레임워크 플러그인을 덧붙인다.
//
// AGENTS.md의 아키텍처 규칙 대부분은 문서로만 두지 않고 여기서 강제한다.
// 규칙이 걸리면 메시지가 고치는 법까지 알려준다.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import prettierConfig from 'eslint-config-prettier';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import boundaries from 'eslint-plugin-boundaries';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import unusedImports from 'eslint-plugin-unused-imports';

/** 계층 내부 파일 직접 접근 금지. 여러 블록에서 재사용한다. */
const LAYER_DEEP_IMPORT = {
  group: [
    '@/features/*/*/*',
    '!@/features/*/*/index',
    './**/models/**',
    '../**/models/**',
    './**/viewmodels/**',
    '../**/viewmodels/**',
    './**/views/**',
    '../**/views/**',
  ],
  message: '계층 내부 세부 파일에 직접 접근하지 말고 각 디렉터리의 index.ts를 사용하세요.',
};

/** common은 depth-1 area 배럴만. `@/common/components` ✅ / `@/common/components/ui/button` ❌ */
const COMMON_DEPTH = {
  group: ['@/common/*/*', '@/common/*/*/**'],
  message:
    'common은 @/common/<area> 배럴만 사용하세요 (예: @/common/components). 더 깊은 경로는 금지입니다.',
};

/** 생성된 API 클라이언트는 정해진 파일에서만 만진다. */
const GENERATED_API = {
  group: ['@/api', '@/api/**'],
  message:
    '생성된 API 클라이언트는 features/*/models(타입·zod), features/*/viewmodels(react-query.gen), common/lib/api.ts, src/mocks 에서만 import 하세요.',
};

export default defineConfig(
  {
    ignores: [
      'dist',
      'storybook-static',
      'node_modules',
      'playwright-report',
      'test-results',
      'coverage',
      // 프레임워크별 생성 캐시 (Astro, TanStack Start, Next.js…). 템플릿에 없으면 매칭 안 될 뿐이다.
      '.astro/**',
      '.next/**',
      '.open-next/**',
      'src/api/**',
      'src/@types/**',
      '**/*.gen.ts',
      'public/mockServiceWorker.js',
      // Bun 전용, 한 번 돌고 자기를 지운다. 모노레포 CI가 매 템플릿마다 실제로 실행하는데,
      // 그게 타입체크보다 나은 검증이다.
      'scripts/**',
    ],
  },

  // ── 메인 블록 ────────────────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        // `projectService` 를 쓰면 e2e/, .storybook/, 루트 설정 파일까지
        // 별도 tsconfig 없이 타입 인지 린팅에 들어온다.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      'unused-imports': unusedImports,
      'better-tailwindcss': betterTailwind,
      boundaries,
      'check-file': checkFile,
    },
    settings: {
      ...boundaries.configs.recommended.settings,
      'boundaries/legacy-warnings': false,
      'boundaries/elements': [
        { type: 'model', pattern: ['models/*', 'models'] },
        { type: 'viewmodel', pattern: ['viewmodels/*', 'viewmodels'] },
        { type: 'view', pattern: ['views/*', 'views'] },
        { type: 'common', pattern: 'common/*' },
      ],
      'import/resolver': {
        typescript: { project: './tsconfig.json', alwaysTryTypes: true },
      },
      'better-tailwindcss': { entryPoint: 'src/styles.css' },
    },
    rules: {
      // React Compiler 급 진단이 여기 들어있다 — purity, set-state-in-effect,
      // immutability, preserve-manual-memoization 등. 별도 도구가 필요 없는 이유.
      ...reactHooks.configs.recommended.rules,

      // 미사용 처리는 unused-imports 가 전담한다.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: '@tanstack/**', group: 'external', position: 'before' },
            { pattern: '@/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': ['error', { considerQueryString: true }],

      // MVVM. 문서가 아니라 여기가 진짜 규칙이다.
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'view' } },
              disallow: { to: { element: { type: 'model' } } },
              message: 'View는 Model에 직접 접근할 수 없습니다. ViewModel을 거치세요.',
            },
            {
              from: { element: { type: 'viewmodel' } },
              disallow: { to: { element: { type: 'view' } } },
              message: 'ViewModel은 View(UI)를 참조할 수 없습니다.',
            },
            {
              from: { element: { type: 'model' } },
              disallow: { to: { element: { type: ['viewmodel', 'view'] } } },
              message: 'Model은 최하위 계층이어야 합니다.',
            },
          ],
        },
      ],

      'check-file/filename-naming-convention': [
        'error',
        { 'src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { 'src/**/': 'KEBAB_CASE' }],

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/common',
              message:
                'common 루트 배럴은 없습니다. @/common/<area>를 사용하세요 (예: @/common/components).',
            },
          ],
          patterns: [LAYER_DEEP_IMPORT, COMMON_DEPTH, GENERATED_API],
        },
      ],

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // 클래스 정렬·줄바꿈은 prettier-plugin-tailwindcss 담당. 둘 다 켜면 싸운다.
      // 여기서는 정확성만 본다.
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
      // `w-4 h-4` → `size-4`. shadcn 규약과 같은 방향이라 켜둔다.
      'better-tailwindcss/enforce-shorthand-classes': 'error',
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',

      // 컴포넌트 props를 `export namespace Button { export type Props }` 로 쓰는 관례상 필수.
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // ── common 내부: 상대경로 / shadcn 생성 deep import 허용 ──────────────────
  {
    files: ['src/common/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [LAYER_DEEP_IMPORT, GENERATED_API] }],
    },
  },

  // ── 생성된 API 클라이언트를 만질 수 있는 곳 ──────────────────────────────
  {
    files: [
      'src/features/*/models/**/*.{ts,tsx}',
      'src/features/*/viewmodels/**/*.{ts,tsx}',
      'src/common/lib/api.ts',
      'src/mocks/**/*.ts',
      // 스토리는 앱 코드가 아니라 픽스처다. 진짜 생성 스키마를 쓰는 게 핵심이고,
      // 아니면 앱이 실행하지 않는 걸 검증하는 스토리가 된다.
      '**/*.stories.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: [LAYER_DEEP_IMPORT] }],
    },
  },

  // ── named export 만 ──────────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.stories.{ts,tsx}', 'src/@types/**'],
    rules: { 'import/no-default-export': 'error' },
  },

  // ── shadcn ui: Button + buttonVariants 동시 export 관례 ───────────────────
  {
    files: ['src/common/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      // shadcn CLI 생성물 — 싸우지 말고 재생성한다.
      // 프리미티브가 정말로 접근성이 나쁘면 업스트림에 알린다.
      'better-tailwindcss/no-unknown-classes': 'off',
      'better-tailwindcss/enforce-shorthand-classes': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    },
  },

  // ── e2e / 루트 설정 파일 ─────────────────────────────────────────────────
  {
    files: ['e2e/**/*.ts', '*.config.{ts,js}', '.storybook/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.node },
    rules: {
      'no-restricted-imports': 'off',
      'import/no-default-export': 'off',
      'check-file/filename-naming-convention': 'off',
      // 앱 소스가 아니다 — Storybook 설정에는 Fast Refresh가 적용되지 않는다.
      'react-refresh/only-export-components': 'off',
    },
  },

  ...storybook.configs['flat/recommended'],

  prettierConfig,

  // eslint-config-prettier가 끈 두 규칙을 의도적으로 되살린다.
  // prettier가 이미 붙여주지만, 손으로 쓴 코드가 CI에서 조용히 통과하는 걸 막는다.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
);
