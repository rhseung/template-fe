import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import todosEn from '@/locales/en/todos.json';
import commonKo from '@/locales/ko/common.json';
import todosKo from '@/locales/ko/todos.json';

import { detectLanguage } from './languages';

export const I18N_NAMESPACES = ['common', 'todos'] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

// 리소스를 런타임 HTTP 백엔드가 아니라 정적으로 import한다 — 워커 위의 SSR/SSG에서
// 요청 워터폴 없이 그대로 돈다. 로케일 파일이 커지면 그때 재검토.
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
