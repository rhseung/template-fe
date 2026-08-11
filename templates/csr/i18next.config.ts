import { defineConfig } from 'i18next-cli';

/**
 * `bun run gen:i18n` = 추출 + 타입 생성.
 *
 * 키는 JSON을 편집해서가 아니라 코드에서 *써서* 만든다. 컴포넌트에 `t('todos:x')`가
 * 나타나면 → 추출이 키를 만들고 → 사람이 한국어를 채운다.
 * `removeUnusedKeys` 덕에 호출부를 지우면 키도 지워지므로, CI는 `git diff --exit-code`
 * 한 줄로 누락 키와 유령 키를 동시에 잡는다.
 */
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
    enableSelector: false,
  },
});
