import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import todosEn from '@/locales/en/todos.json';
import commonKo from '@/locales/ko/common.json';
import todosKo from '@/locales/ko/todos.json';

import { detectLanguage } from './languages';

/** feature 추가 시 여기 이름 추가 + 위 JSON import 두 줄도 같이. */
export const I18N_NAMESPACES = ['common', 'todos'] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

// 런타임 fetch 대신 정적 import — 네임스페이스 2개 × 언어 2개는 몇 KB라 워터폴을
// 감수할 이유가 없다. 로케일 파일이 커지면 `i18next-resources-to-backend` 검토.
void i18next.use(initReactI18next).init({
  resources: {
    ko: { common: commonKo, todos: todosKo },
    en: { common: commonEn, todos: todosEn },
  },
  lng: detectLanguage(),
  fallbackLng: 'ko',
  defaultNS: 'common',
  ns: [...I18N_NAMESPACES],
  nsSeparator: ':',
  keySeparator: '.',
  interpolation: { escapeValue: false },
});

export const i18n = i18next;
