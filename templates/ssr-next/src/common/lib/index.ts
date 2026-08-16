// 이 배럴은 부수효과 트리거를 겸한다. `@/common/lib`를 어디서든 import하면
// API 클라이언트가 설정되고 dayjs가 i18next에 연결된다.
import './api';
import './dayjs';

export { client } from './api';
export { dayjs } from './dayjs';
export { I18N_NAMESPACES, i18n, type I18nNamespace } from './i18n';
export { LANGUAGES, detectLanguage, isLanguage, type Language } from './languages';
