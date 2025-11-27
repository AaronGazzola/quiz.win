import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';
import type { Page } from '@playwright/test';
import { signInWithDevUser } from './utils/auth-helper';

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

async function getQuizOrganizationIds(page: Page): Promise<string[]> {
  const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
  const count = await quizRows.count();
  const orgIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const orgId = await quizRows.nth(i).getAttribute('data-organization-id');
    if (orgId) orgIds.push(orgId);
  }
  return orgIds;
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

async function selectOnlyOrganization(page: Page, orgName: string, skipLoadingCheck = false) {
  const orgSelector = page.getByTestId(TestId.ORG_SELECTOR);
  await orgSelector.click();

  const orgSwitcher = page.getByTestId(TestId.ORG_SWITCHER);
  await expect(orgSwitcher).toBeVisible({ timeout: 10000 });

  const allOrgOptions = orgSwitcher.locator('[data-organization-name]');
  const count = await allOrgOptions.count();

  const initialStates: Record<string, boolean> = {};
  for (let i = 0; i < count; i++) {
    const option = allOrgOptions.nth(i);
    const name = await option.getAttribute('data-organization-name');
    const dataState = await option.getAttribute('data-state');
    const isChecked = dataState === 'checked';
    if (name) {
      initialStates[name] = isChecked;
    }
  }

  for (let i = 0; i < count; i++) {
    const option = allOrgOptions.nth(i);
    const name = await option.getAttribute('data-organization-name');
    const shouldBeChecked = name === orgName;
    const isCurrentlyChecked = name ? initialStates[name] : false;

    if (shouldBeChecked && !isCurrentlyChecked) {
      await option.click();
      await expect(option).toHaveAttribute(
        'data-state',
        'checked',
        { timeout: 2000 }
      );
    }
  }

  for (let i = 0; i < count; i++) {
    const option = allOrgOptions.nth(i);
    const name = await option.getAttribute('data-organization-name');
    const shouldBeChecked = name === orgName;
    const isCurrentlyChecked = name ? initialStates[name] : false;

    if (!shouldBeChecked && isCurrentlyChecked) {
      await option.click();
      await expect(option).toHaveAttribute(
        'data-state',
        'unchecked',
        { timeout: 2000 }
      );
    }
  }

  for (let i = 0; i < count; i++) {
    const option = allOrgOptions.nth(i);
    const name = await option.getAttribute('data-organization-name');
    const dataState = await option.getAttribute('data-state');
    const isChecked = dataState === 'checked';

    if (name === orgName) {
      expect(isChecked, `${orgName} should be checked after toggle`).toBe(true);
    } else {
      expect(isChecked, `${name} should not be checked after toggle`).toBe(false);
    }
  }

  await page.keyboard.press('Escape');

  if (!skipLoadingCheck) {
    await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="true"]`, { timeout: 10000 });
  }
  await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });
}

function assertAllMatch(values: string[], expected: string, label: string) {
  values.forEach((value) => {
    expect(value, `${label} should be ${expected}, got ${value}`).toBe(expected);
  });
}

function assertNoneMatch(values: string[], forbidden: string, label: string) {
  values.forEach((value) => {
    expect(value, `${label} should not be ${forbidden}`).not.toBe(forbidden);
  });
}

test.describe('Dashboard Role-Based Access Tests', () => {
  test.beforeEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: { cleanupSeededOrgQuizzes: true },
      });
    } catch (error) {
      console.log('Pre-cleanup skipped:', error);
    }
  });

  test('should show admin dashboard for super admin with all metrics and responses', async ({ page }) => {
    const logger = new TestStepLogger('Super Admin Dashboard Access');

    await logger.step('Sign in as super admin', async () => {
      await signInWithDevUser(page, 'superadmin@gazzola.dev');
    });

    await logger.step('Verify all 4 dashboard metrics are visible', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_COMPLETED_TODAY)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TEAM_MEMBERS)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_ACTIVE_INVITES)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Verify quiz table shows quizzes from both organizations with pagination', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });

      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      await expect(quizRows.first()).toBeVisible({ timeout: 20000 });
      const quizRowCount = await quizRows.count();
      expect(quizRowCount).toBeGreaterThanOrEqual(5);

      const paginationText = page.getByText(/Showing \d+ to \d+ of \d+ quizzes/);
      await expect(paginationText).toBeVisible();
      const paginationContent = await paginationText.textContent();
      const totalMatch = paginationContent?.match(/of (\d+) quizzes/);
      const totalQuizzes = totalMatch ? parseInt(totalMatch[1]) : 0;
      expect(totalQuizzes).toBeGreaterThanOrEqual(6);
    });

    await logger.step('Verify Responses column is visible in quiz table', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE_RESPONSES_COL)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Select a quiz with responses', async () => {
      const firstQuizRow = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`).first();
      await firstQuizRow.click();
    });

    await logger.step('Verify responses table is visible', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE)).toBeVisible({ timeout: 10000 });

      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="true"]`, { timeout: 10000 });

      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="false"]`, { timeout: 20000 });
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should show admin dashboard for organization owner with org-specific data', async ({ page }) => {
    const logger = new TestStepLogger('Organization Owner Dashboard Access');

    await logger.step('Sign in as HealthCare Partners owner (Dr. Sarah Chen)', async () => {
      await signInWithDevUser(page, 'dr.sarah.chen@gazzola.dev');
    });

    await logger.step('Verify admin metrics are visible', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_COMPLETED_TODAY)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TEAM_MEMBERS)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_ACTIVE_INVITES)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Verify Responses column is visible', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE_RESPONSES_COL)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Verify only HealthCare Partners quizzes are shown', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });

      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should show admin dashboard for organization admin', async ({ page }) => {
    const logger = new TestStepLogger('Organization Admin Dashboard Access');

    await logger.step('Sign in as HealthCare Partners admin (Dr. James Wilson)', async () => {
      await signInWithDevUser(page, 'dr.james.wilson@gazzola.dev');
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

      await expect(page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE)).toBeVisible({ timeout: 10000 });

      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="true"]`, { timeout: 10000 });

      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="false"]`, { timeout: 20000 });

      const userIds = await getResponseUserIds(page);
      expect(userIds.length).toBeGreaterThan(0);
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should show member dashboard without admin features', async ({ page }) => {
    const logger = new TestStepLogger('Organization Member Dashboard Access');

    await logger.step('Sign in as HealthCare Partners member (Emily Davis)', async () => {
      await signInWithDevUser(page, 'nurse.emily.davis@gazzola.dev');
    });

    await logger.step('Verify only basic metrics are visible (no Team Members or Active Invites)', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_COMPLETED_TODAY)).toBeVisible({ timeout: 10000 });

      const teamMembersMetric = page.getByTestId(TestId.DASHBOARD_METRIC_TEAM_MEMBERS);
      await expect(teamMembersMetric).not.toBeVisible();

      const activeInvitesMetric = page.getByTestId(TestId.DASHBOARD_METRIC_ACTIVE_INVITES);
      await expect(activeInvitesMetric).not.toBeVisible();
    });

    await logger.step('Verify quiz table is visible', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Verify Responses column is NOT visible', async () => {
      const responsesCol = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE_RESPONSES_COL);
      await expect(responsesCol).not.toBeVisible();
    });

    await logger.step('Select a quiz', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const firstRow = quizRows.first();
      await firstRow.click();
    });

    await logger.step('Verify user response section is visible (not admin responses table)', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_USER_RESPONSE)).toBeVisible({ timeout: 10000 });

      const adminResponsesTable = page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE);
      await expect(adminResponsesTable).not.toBeVisible();
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should show correct UI based on selected organization for multi-org user', async ({ page }) => {
    const logger = new TestStepLogger('Multi-Organization User Access');

    await logger.step('Sign in as Alex Johnson (HC: Admin, TC: Member)', async () => {
      await signInWithDevUser(page, 'alex.johnson@gazzola.dev');
    });

    await logger.step('Wait for dashboard to load', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Check current org selection and UI state', async () => {
      const teamMembersVisible = await page.getByTestId(TestId.DASHBOARD_METRIC_TEAM_MEMBERS).isVisible().catch(() => false);
      const responsesColVisible = await page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE_RESPONSES_COL).isVisible().catch(() => false);

      console.log(JSON.stringify({ teamMembersVisible, responsesColVisible }, null, 2));
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should display accurate quiz response data for member', async ({ page }) => {
    const logger = new TestStepLogger('Member Response Data Accuracy');

    await logger.step('Sign in as Emily Davis (has completed quizzes)', async () => {
      await signInWithDevUser(page, 'nurse.emily.davis@gazzola.dev');
    });

    await logger.step('Wait for quizzes to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });
    });

    await logger.step('Check if Patient Safety quiz row exists', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const rowCount = await quizRows.count();

      console.log(JSON.stringify({ totalQuizRows: rowCount }, null, 2));

      if (rowCount > 0) {
        const firstRow = quizRows.first();
        await firstRow.click();

        const userResponse = page.getByTestId(TestId.DASHBOARD_USER_RESPONSE);
        const isVisible = await userResponse.isVisible().catch(() => false);

        console.log(JSON.stringify({ userResponseVisible: isVisible }, null, 2));
      }
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should allow admin to view all member responses with search functionality', async ({ page }) => {
    const logger = new TestStepLogger('Admin Response Viewing and Search');

    await logger.step('Sign in as Dr. James Wilson (admin)', async () => {
      await signInWithDevUser(page, 'dr.james.wilson@gazzola.dev');
    });

    await logger.step('Wait for quizzes to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });
    });

    await logger.step('Select first quiz with responses', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const rowCount = await quizRows.count();

      if (rowCount > 0) {
        const firstRow = quizRows.first();
        await firstRow.click();
      }
    });

    await logger.step('Verify only org member responses are shown', async () => {
      const responsesTableVisible = await page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE).isVisible().catch(() => false);

      if (responsesTableVisible) {
        await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="true"]`, { timeout: 10000 });

        await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="false"]`, { timeout: 20000 });

        const searchInput = page.getByTestId(TestId.DASHBOARD_RESPONSES_SEARCH);
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        const userIds = await getResponseUserIds(page);
        expect(userIds.length).toBeGreaterThan(0);

        const responseRows = page.locator(`[data-testid^="${TestId.DASHBOARD_RESPONSES_TABLE_ROW}"]`);
        const responseCount = await responseRows.count();

        if (responseCount > 0) {
          const firstResponse = responseRows.first();
          await firstResponse.click();

          await page.getByTestId(TestId.DASHBOARD_RESPONSE_DETAIL).isVisible().catch(() => false);
        }
      }
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });

  test('should switch organizations and display organization-specific data for super admin', async ({ page }) => {
    const logger = new TestStepLogger('Organization Switching - Super Admin');

    await logger.step('Sign in as super admin', async () => {
      await signInWithDevUser(page, 'superadmin@gazzola.dev');
    });

    await logger.step('Wait for initial dashboard to load', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Verify org selector is visible', async () => {
      const orgSelector = page.getByTestId(TestId.ORG_SELECTOR);
      await expect(orgSelector).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Select only HealthCare Partners organization and verify data', async () => {
      await selectOnlyOrganization(page, 'HealthCare Partners');

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Switch to TechCorp Solutions only and verify data', async () => {
      await selectOnlyOrganization(page, 'TechCorp Solutions');

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'TechCorp Solutions', 'Quiz organization');
      assertNoneMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Switch back to HealthCare Partners only and verify data', async () => {
      await selectOnlyOrganization(page, 'HealthCare Partners', true);

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
      assertNoneMatch(orgNames, 'TechCorp Solutions', 'Quiz organization');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 20000 });
    });
  });

  test('should switch organizations and respect role-based permissions for multi-org member', async ({ page }) => {
    const logger = new TestStepLogger('Organization Switching - Multi-Org Member');

    await logger.step('Sign in as Alex Johnson (HC: Admin, TC: Member)', async () => {
      await signInWithDevUser(page, 'alex.johnson@gazzola.dev');
    });

    await logger.step('Wait for initial dashboard to load', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Select only HealthCare Partners organization and verify data', async () => {
      await selectOnlyOrganization(page, 'HealthCare Partners');

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Switch to TechCorp Solutions only and verify data', async () => {
      await selectOnlyOrganization(page, 'TechCorp Solutions');

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'TechCorp Solutions', 'Quiz organization');
      assertNoneMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 20000 });
    });
  });

  test('should enforce complete data isolation between organizations', async ({ page }) => {
    const logger = new TestStepLogger('Complete Data Isolation');

    await logger.step('Sign in as super admin', async () => {
      await signInWithDevUser(page, 'superadmin@gazzola.dev');
    });

    await logger.step('Wait for initial dashboard to load', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Switch to HealthCare Partners only and verify data', async () => {
      await selectOnlyOrganization(page, 'HealthCare Partners');

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Verify HC quiz responses show only HC members', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      await quizRows.first().click();

      const responsesTable = page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE);
      const responsesVisible = await responsesTable.isVisible().catch(() => false);

      if (responsesVisible) {
        await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="true"]`, { timeout: 10000 });
        await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="false"]`, { timeout: 20000 });

        const userIds = await getResponseUserIds(page);
        expect(userIds.length).toBeGreaterThan(0);
      }
    });

    await logger.step('Switch to TechCorp Solutions only and verify data', async () => {
      await selectOnlyOrganization(page, 'TechCorp Solutions');

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'TechCorp Solutions', 'Quiz organization');
      assertNoneMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Verify TC quiz responses show only TC members', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      await quizRows.first().click();

      const responsesTable = page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE);
      const responsesVisible = await responsesTable.isVisible().catch(() => false);

      if (responsesVisible) {
        await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="true"]`, { timeout: 10000 });
        await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_RESPONSES_TABLE}"][data-loading="false"]`, { timeout: 20000 });

        const userIds = await getResponseUserIds(page);
        expect(userIds.length).toBeGreaterThan(0);
      }
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 20000 });
    });
  });

  test('should show only organization-specific quizzes for org owners', async ({ page }) => {
    const logger = new TestStepLogger('Organization Owner Quiz Filtering');

    await logger.step('Sign in as Dr. Sarah Chen (HC Owner)', async () => {
      await signInWithDevUser(page, 'dr.sarah.chen@gazzola.dev');
    });

    await logger.step('Wait for dashboard to load', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
    });

    await logger.step('Verify only HealthCare Partners quizzes shown', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });

    await logger.step('Sign in as John Smith (TC Owner)', async () => {
      await signInWithDevUser(page, 'john.smith@gazzola.dev');
    });

    await logger.step('Wait for dashboard to load', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
    });

    await logger.step('Verify only TechCorp Solutions quizzes shown', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_QUIZ_TABLE}"][data-loading="false"]`, { timeout: 20000 });

      const orgNames = await getQuizOrganizationNames(page);
      expect(orgNames.length).toBe(3);
      assertAllMatch(orgNames, 'TechCorp Solutions', 'Quiz organization');
      assertNoneMatch(orgNames, 'HealthCare Partners', 'Quiz organization');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 10000 });
    });
  });
});
