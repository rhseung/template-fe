import { redirect } from 'next/navigation';

// 예제와 함께 이 페이지도 지운다 — `/`는 각자 정의할 몫이다.
export default function Home() {
  redirect('/todos');
}
