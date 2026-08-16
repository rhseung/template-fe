// 프레임워크에 무관한 절반은 `prettier.base.json`에 있다(템플릿 모노레포에서 동기화됨).
// 여기엔 이 템플릿 전용 플러그인만 온다 — CSR엔 추가할 게 없다.
import base from './prettier.base.json' with { type: 'json' };

export default base;
