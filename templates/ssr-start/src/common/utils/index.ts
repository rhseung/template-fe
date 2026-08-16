import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 조건부 클래스 + Tailwind 충돌 해소. 뒤에 오는 클래스가 이긴다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
