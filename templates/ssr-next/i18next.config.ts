import { defineConfig } from 'i18next-cli';

/** `bun run gen:i18n` = 추출 + 타입 생성. AGENTS.md §6 참고. */
export default defineConfig({
  locales: ['ko', 'en'],

  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'src/locales/{{language}}/{{namespace}}.json',

    defaultNS: 'common',
    nsSeparator: ':',
    keySeparator: '.',

    primaryLanguage: 'ko',
    secondaryLanguages: ['en'],

    removeUnusedKeys: true,
    sort: true,
    indentation: 2,
    defaultValue: '',

    functions: ['t', '*.t'],
    transComponents: ['Trans'],
    useTranslationNames: ['useTranslation'],
    extractFromComments: true,
  },

  lint: {
    ignoredAttributes: ['data-testid', 'aria-label'],
    ignoredTags: ['pre', 'code'],
    ignore: ['**/*.stories.@(ts|tsx)'],
  },

  types: {
    // 키 구조의 원천은 한국어 파일이다 — `t()` 자동완성도 여기서 나온다.
    input: ['src/locales/ko/*.json'],
    output: 'src/@types/i18next.d.ts',
    resourcesFile: 'src/@types/resources.d.ts',
    // react-i18next 17.0.7+ / i18next 26.0.10+ 필요.
    enableSelector: true,
  },
});
