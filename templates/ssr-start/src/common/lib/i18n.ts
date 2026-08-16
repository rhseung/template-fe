import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import todosEn from '@/locales/en/todos.json';
import commonKo from '@/locales/ko/common.json';
import todosKo from '@/locales/ko/todos.json';

import { detectLanguage } from './languages';

/** feature를 추가하면 여기에 이름을 넣고 위쪽 JSON import 두 줄도 같이 추가한다. */
export const I18N_NAMESPACES = ['common', 'todos'] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

// 정적 import. HTTP 백엔드로 지연 로드하면 첫 페인트에 워터폴이 생기고 SSR에서 더 꼬인다 —
// 로케일 파일이 커지면 그때 `i18next-resources-to-backend`를 검토한다.
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
