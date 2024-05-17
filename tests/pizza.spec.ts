import { test, expect } from 'playwright-test-coverage';

test('login/profile/logout', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByLabel('Global')).toContainText('KC');
  await page.getByRole('link', { name: 'KC' }).click();
  await expect(page.getByRole('main')).toContainText('Kai Chen');
  await expect(page.getByRole('main')).toContainText('d@jwt.com');
  await expect(page.getByRole('main')).toContainText('diner');
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('heading')).toContainText("The web's best pizza");
});
