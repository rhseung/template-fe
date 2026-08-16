import { expect, test } from '@playwright/test';

/**
 * 여정 하나로 라우팅, 생성된 쿼리, 생성된 뮤테이션, 수동 캐시 무효화, MSW 연결,
 * i18n 네임스페이스 로딩, 그리고 dev 서버가 빌드되는지까지 전부 증명된다.
 */
test('목록을 보고, 추가하고, 언어를 바꾼다', async ({ page }) => {
  await page.goto('/todos');

  // `/`가 여기로 리다이렉트하고, MSW가 3개를 시드해둔다.
  const items = page.getByRole('listitem');
  await expect(items).toHaveCount(3);

  await page.getByRole('textbox', { name: '할 일' }).fill('플레이라이트 테스트 작성');
  await page.getByRole('button', { name: '추가' }).click();

  await expect(page.getByText('플레이라이트 테스트 작성')).toBeVisible();
  await expect(items).toHaveCount(4);

  const checkbox = page.getByRole('checkbox', { name: '플레이라이트 테스트 작성' });
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  await page.getByRole('button', { name: '남은 것' }).click();
  await expect(page.getByText('플레이라이트 테스트 작성')).toBeHidden();

  await page.getByRole('button', { name: '언어 바꾸기' }).click();
  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
});
