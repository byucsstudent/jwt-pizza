import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { User, UserRole, UserList, Role } from '../src/service/pizzaService';

let currentUser: User = {};
let allUsers: UserList = { users: [], more: false };

test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ json: { user: currentUser, token: 'abcdef' } });
    } else if (route.request().method() === 'DELETE') {
      currentUser = {};
      await route.fulfill({ json: { message: 'logout successful' } });
    } else {
      await route.continue();
    }
  });

  await page.route('*/**/api/user?*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: allUsers });
    } else {
      await route.continue();
    }
  });

  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { dinerId: currentUser.id, orders: [{ id: 1, franchiseId: 1, storeId: 1, date: '2024-06-05T05:14:40.000Z', items: [{ id: 1, menuId: 1, description: 'Veggie', price: 0.05 }] }], page: 1 } });
    } else {
      await route.continue();
    }
  });

  await page.route('*/**/api/user/*', async (route) => {
    if (route.request().method() === 'PUT') {
      currentUser = { ...currentUser, ...route.request().postDataJSON() };
      await route.fulfill({ json: { user: currentUser, token: 'abcdef' } });
    } else if (route.request().method() === 'GET') {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: currentUser });
    } else {
      await route.continue();
    }
  });

  await page.route('*/**/api/franchise?*', async (route) => {
    if (route.request().method() === 'GET') {
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: 'LotaPizza',
            stores: [
              { id: 4, name: 'Lehi' },
              { id: 5, name: 'Springville' },
              { id: 6, name: 'American Fork' },
            ],
          },
          { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
          { id: 4, name: 'topSpot', stores: [] },
        ],
        more: false,
      };
      await route.fulfill({ json: franchiseRes });
    } else {
      await route.continue();
    }
  });
});

test('updateUser', async ({ page }) => {
  await page.goto('/');

  await loginUser(page, 'diner user', 'd@jwt.com', 'pw', [{ role: Role.Diner }]);

  const newName = 'diner update user';

  await page.locator('a[href="/diner-dashboard"]').click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill(newName);
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
  await expect(page.getByRole('main')).toContainText(newName);
  await page.getByRole('link', { name: 'Logout' }).click();
  await loginUser(page, newName, 'test@jwt.com', 'pw', [{ role: Role.Diner }]);
  await page.locator('a[href="/diner-dashboard"]').click();
  await expect(page.getByRole('main')).toContainText(newName);
});

test('listUsers', async ({ page }) => {
  await page.goto('/');

  await loginUser(page, '常用名字', 'a@jwt.com', 'pw', [{ role: Role.Admin }]);

  const moreUsers = [
    { id: '2', name: 'user 2', email: '2@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '3', name: 'user 3', email: '3@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '4', name: 'user 4', email: '4@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '5', name: 'user 5', email: '5@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '6', name: 'user 6', email: '6@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '7', name: 'user 7', email: '7@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '8', name: 'user 8', email: '8@jwt.com', password: '', roles: [{ role: Role.Diner }] },
    { id: '9', name: 'user 9', email: '9@jwt.com', password: '', roles: [{ role: Role.Diner }] },
  ];

  allUsers = {
    users: [currentUser, ...moreUsers],
    more: true,
  };

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByText(`常用名字`, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '«' }).first()).toBeDisabled();
  await expect(page.getByRole('button', { name: '»' }).first()).toBeEnabled();

  allUsers = {
    users: [currentUser],
    more: false,
  };

  await page.getByRole('textbox', { name: 'Filter users' }).fill('常用名字');
  await page.getByRole('button', { name: 'Submit' }).first().click();

  await expect(page.getByText(`user 3`, { exact: true })).not.toBeVisible();
  await expect(page.getByText(`常用名字`, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '«' }).first()).toBeDisabled();
  await expect(page.getByRole('button', { name: '»' }).first()).toBeDisabled();

  allUsers = {
    users: [currentUser, ...moreUsers],
    more: false,
  };

  await page.getByRole('textbox', { name: 'Filter users' }).fill('');
  await page.getByRole('button', { name: 'Submit' }).first().click();
  await expect(page.getByText(`user 3`, { exact: true })).toBeVisible();
});

async function loginUser(page: Page, name: string, email: string, password: string, roles: UserRole[]) {
  currentUser = { id: '1', name: name, email: email, password: password, roles: roles };

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}
