import { defineConfig } from 'i18next-cli';

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
    // 문자열 키(`t('form.submit')`) 대신 셀렉터 함수(`t($ => $.form.submit)`)로 접근한다.
    // 자동완성·정의로 이동·오타 시 컴파일 에러가 생긴다. react-i18next 17.0.7+ / i18next 26.0.10+ 필요.
    enableSelector: true,
  },
});
