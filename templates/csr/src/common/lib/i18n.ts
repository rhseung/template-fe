import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import todosEn from '@/locales/en/todos.json';
import commonKo from '@/locales/ko/common.json';
import todosKo from '@/locales/ko/todos.json';

import { detectLanguage } from './languages';

export const I18N_NAMESPACES = ['common', 'todos'] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

// HTTP 백엔드 대신 정적 import를 쓴다. 첫 페인트에 요청 워터폴이 안 생기고, 몇 KB 수준의
// 리소스라 워커 SSR/SSG로 옮겨도 깨지지 않는다. 로케일 파일이 커지면 그때
// `i18next-resources-to-backend`를 검토한다.
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
