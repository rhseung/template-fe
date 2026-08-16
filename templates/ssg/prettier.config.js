// 프레임워크에 무관한 절반은 `prettier.base.json`에 있다(템플릿 모노레포에서 동기화됨).
// 여기엔 이 템플릿 전용 플러그인만 온다 — `.astro`를 포맷하려면 astro 플러그인이 필요하다.
import base from './prettier.base.json' with { type: 'json' };

export default {
  ...base,
  plugins: [...base.plugins, 'prettier-plugin-astro'],
};
