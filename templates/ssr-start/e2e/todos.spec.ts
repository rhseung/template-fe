import { expect, test } from '@playwright/test';

test('목록을 보고, 추가하고, 언어를 바꾼다', async ({ page }) => {
  await page.goto('/todos');

  // `/`가 여기로 리다이렉트하고, MSW가 3개를 시드해둔다.
  const items = page.getByRole('listitem');
  await expect(items).toHaveCount(3);

  // 생성 → 무효화 → 재조회
  await page.getByRole('textbox', { name: '할 일' }).fill('플레이라이트 테스트 작성');
  await page.getByRole('button', { name: '추가' }).click();

  await expect(page.getByText('플레이라이트 테스트 작성')).toBeVisible();
  await expect(items).toHaveCount(4);

  // 토글 → PATCH → 무효화
  const checkbox = page.getByRole('checkbox', { name: '플레이라이트 테스트 작성' });
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  // 필터는 클라이언트 상태
  await page.getByRole('button', { name: '남은 것' }).click();
  await expect(page.getByText('플레이라이트 테스트 작성')).toBeHidden();

  // 로케일 전환이 제목까지 반영되는지
  await page.getByRole('button', { name: '언어 바꾸기' }).click();
  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
});
