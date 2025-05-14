import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';

test('updateUser', async ({ page }) => {
  await page.goto('/');

  const [dinerUser, email] = await registerUser(page);
  await loginUser(page, email, 'toomanysecrets');

  const newName = dinerUser + 'x';

  await page.locator('a[href="/diner-dashboard"]').click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill(newName);
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText(newName);

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('toomanysecrets');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.locator('a[href="/diner-dashboard"]').click();

  await expect(page.getByRole('main')).toContainText(newName);
  await deleteUser(page, newName);
});

test('listUsers', async ({ page }) => {
  await page.goto('/');

  const [dinerUser] = await registerUser(page);
  await loginUser(page, 'a@jwt.com', 'admin');

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByText(`常用名字`, { exact: true })).toBeVisible();

  await page.getByRole('textbox', { name: 'filter' }).fill(dinerUser);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(`user ${dinerUser}`, { exact: true })).toBeVisible();

  await page.getByRole('textbox', { name: 'filter' }).fill('');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(`常用名字`, { exact: true })).toBeVisible();

  await deleteUser(page, dinerUser);
});

async function registerUser(page: Page): Promise<string[]> {
  const name = Math.floor(Math.random() * 10000).toString();
  const email = `user${name}@jwt.com`;
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(`user ${name}`);
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('toomanysecrets');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  return [name, email];
}

async function loginUser(page: Page, email: string, password: string) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

async function deleteUser(page: Page, name: string) {
  await page.getByRole('link', { name: 'Logout' }).click();
  await loginUser(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('textbox', { name: 'filter' }).fill(name);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('row', { name: name }).getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByText("The web's best pizza", { exact: true })).toBeVisible();
}
