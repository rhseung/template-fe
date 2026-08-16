// 부수효과 트리거 겸용 배럴: import하면 API 클라이언트 설정 + dayjs↔i18next 연동.
import './api';
import './dayjs';

export { client } from './api';
export { dayjs } from './dayjs';
export { I18N_NAMESPACES, i18n, type I18nNamespace } from './i18n';
export { LANGUAGES, detectLanguage, isLanguage, type Language } from './languages';
