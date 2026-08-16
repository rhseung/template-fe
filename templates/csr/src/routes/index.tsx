import { createFileRoute, redirect } from '@tanstack/react-router';

// 예제와 함께 이 라우트도 지운다 — `/`는 각자 정의할 몫이다.
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/todos' });
  },
});
