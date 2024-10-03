import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('login', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('demo@jwt.com');
  await page.getByPlaceholder('Password').fill('d');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'd', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'd', exact: true }).click();
  await expect(page.getByText('demo@jwt.com')).toBeVisible();
});
