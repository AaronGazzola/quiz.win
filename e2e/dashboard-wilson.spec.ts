import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';
import type { Page } from '@playwright/test';

test.describe.configure({ workers: 1 });

async function getQuizOrganizationNames(page: Page): Promise<string[]> {
  const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
  const count = await quizRows.count();
  const orgNames: string[] = [];
  for (let i = 0; i < count; i++) {
    const orgName = await quizRows.nth(i).getAttribute('data-organization-name');
    if (orgName) orgNames.push(orgName);
  }
  return orgNames;
}

async function getResponseUserIds(page: Page): Promise<string[]> {
  const responseRows = page.locator(`[data-testid^="${TestId.DASHBOARD_RESPONSES_TABLE_ROW}"]`);
  const count = await responseRows.count();
  const userIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const userId = await responseRows.nth(i).getAttribute('data-user-id');
    if (userId) userIds.push(userId);
  }
  return userIds;
}

function assertAllMatch(values: string[], expected: string, label: string) {
  values.forEach((value) => {
    expect(value, `${label} should be ${expected}, got ${value}`).toBe(expected);
  });
}

test.describe('Dashboard Organization Admin Test', () => {
  test('should show admin dashboard for organization admin', async ({ page }) => {
    const logger = new TestStepLogger('Organization Admin Dashboard Access');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as HealthCare Partners admin (Dr. James Wilson)', async () => {
      const adminCard = page.getByTestId('user-card-dr.james.wilson@gazzola.dev');
      await expect(adminCard).toBeVisible({ timeout: 10000 });
      await adminCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 20000 });
    });

    await logger.step('Verify all admin metrics are visible', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_COMPLETED_TODAY)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TEAM_MEMBERS)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_ACTIVE_INVITES)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Verify Responses column is visible', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE_RESPONSES_COL)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Verify only HealthCare Partners quizzes are shown', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Verify can view responses from org members only', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const firstRow = quizRows.first();
      await firstRow.click();
      await page.waitForTimeout(1000);

      await expect(page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE)).toBeVisible({ timeout: 10000 });

      const userIds = await getResponseUserIds(page);
      expect(userIds.length).toBeGreaterThan(0);
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });
});
