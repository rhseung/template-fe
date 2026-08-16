import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import { i18n } from './i18n';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

dayjs.locale(i18n.language);

// dayjs가 i18next를 따라가게 한다. 여기서 `i18n.changeLanguage`를 호출하면 안 된다 —
// 이 리스너가 막으려는 바로 그 루프가 생긴다.
i18n.on('languageChanged', (language) => {
  dayjs.locale(language);
});

export { dayjs };
