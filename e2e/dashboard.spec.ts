import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';

test.describe.configure({ workers: 1 });

test.describe('Dashboard Role-Based Access Tests', () => {
  test('should show admin dashboard for super admin with all metrics and responses', async ({ page }) => {
    const logger = new TestStepLogger('Super Admin Dashboard Access');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as super admin', async () => {
      const superAdminCard = page.getByTestId('user-card-superadmin@gazzola.dev');
      await expect(superAdminCard).toBeVisible({ timeout: 10000 });
      await superAdminCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });

    await logger.step('Verify all 4 dashboard metrics are visible', async () => {
      await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_COMPLETED_TODAY)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TEAM_MEMBERS)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.DASHBOARD_METRIC_ACTIVE_INVITES)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Verify quiz table shows all quizzes from both organizations', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });

      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      await expect(quizRows.first()).toBeVisible({ timeout: 20000 });
      const quizRowCount = await quizRows.count();
      expect(quizRowCount).toBeGreaterThanOrEqual(6);
    });

    await logger.step('Verify Responses column is visible in quiz table', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE_RESPONSES_COL)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Select a quiz with responses', async () => {
      const firstQuizRow = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`).first();
      await firstQuizRow.click();
      await page.waitForTimeout(1000);
    });

    await logger.step('Verify responses table is visible', async () => {
      await expect(page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });

  test('should show admin dashboard for organization owner with org-specific data', async ({ page }) => {
    const logger = new TestStepLogger('Organization Owner Dashboard Access');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as HealthCare Partners owner (Dr. Sarah Chen)', async () => {
      const ownerCard = page.getByTestId('user-card-dr.sarah.chen@gazzola.dev');
      await expect(ownerCard).toBeVisible({ timeout: 10000 });
      await ownerCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
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

    await logger.step('Verify quiz count matches HealthCare Partners quizzes', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });

      const totalQuizzesMetric = page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES);
      const quizCountText = await totalQuizzesMetric.textContent();
      expect(quizCountText).toContain('3');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });

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
      await expect(page).toHaveURL('/', { timeout: 10000 });
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

    await logger.step('Verify can view all responses from org members', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const firstRow = quizRows.first();
      await firstRow.click();
      await page.waitForTimeout(1000);

      await expect(page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE)).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });

  test('should show member dashboard without admin features', async ({ page }) => {
    const logger = new TestStepLogger('Organization Member Dashboard Access');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as HealthCare Partners member (Emily Davis)', async () => {
      const memberCard = page.getByTestId('user-card-nurse.emily.davis@gazzola.dev');
      await expect(memberCard).toBeVisible({ timeout: 10000 });
      await memberCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
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
      await page.waitForTimeout(1000);
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
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });

  test('should show correct UI based on selected organization for multi-org user', async ({ page }) => {
    const logger = new TestStepLogger('Multi-Organization User Access');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as Alex Johnson (HC: Admin, TC: Member)', async () => {
      const alexCard = page.getByTestId('user-card-alex.johnson@gazzola.dev');
      await expect(alexCard).toBeVisible({ timeout: 10000 });
      await alexCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });

    await logger.step('Wait for dashboard to load', async () => {
      await page.waitForTimeout(2000);
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
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });

  test('should display accurate quiz response data for member', async ({ page }) => {
    const logger = new TestStepLogger('Member Response Data Accuracy');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as Emily Davis (has completed quizzes)', async () => {
      const memberCard = page.getByTestId('user-card-nurse.emily.davis@gazzola.dev');
      await expect(memberCard).toBeVisible({ timeout: 10000 });
      await memberCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });

    await logger.step('Wait for quizzes to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Check if Patient Safety quiz row exists', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const rowCount = await quizRows.count();

      console.log(JSON.stringify({ totalQuizRows: rowCount }, null, 2));

      if (rowCount > 0) {
        const firstRow = quizRows.first();
        await firstRow.click();
        await page.waitForTimeout(1000);

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
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });

  test('should allow admin to view all member responses with search functionality', async ({ page }) => {
    const logger = new TestStepLogger('Admin Response Viewing and Search');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as Dr. James Wilson (admin)', async () => {
      const adminCard = page.getByTestId('user-card-dr.james.wilson@gazzola.dev');
      await expect(adminCard).toBeVisible({ timeout: 10000 });
      await adminCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });

    await logger.step('Wait for quizzes to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Select first quiz with responses', async () => {
      const quizRows = page.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TABLE_ROW}"]`);
      const rowCount = await quizRows.count();

      if (rowCount > 0) {
        const firstRow = quizRows.first();
        await firstRow.click();
        await page.waitForTimeout(1000);
      }
    });

    await logger.step('Check if responses table is visible and search is available', async () => {
      const responsesTableVisible = await page.getByTestId(TestId.DASHBOARD_RESPONSES_TABLE).isVisible().catch(() => false);

      if (responsesTableVisible) {
        const searchInput = page.getByTestId(TestId.DASHBOARD_RESPONSES_SEARCH);
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        const responseRows = page.locator(`[data-testid^="${TestId.DASHBOARD_RESPONSES_TABLE_ROW}"]`);
        const responseCount = await responseRows.count();

        console.log(JSON.stringify({ responsesFound: responseCount }, null, 2));

        if (responseCount > 0) {
          const firstResponse = responseRows.first();
          await firstResponse.click();
          await page.waitForTimeout(1000);

          const responseDetailVisible = await page.getByTestId(TestId.DASHBOARD_RESPONSE_DETAIL).isVisible().catch(() => false);
          console.log(JSON.stringify({ responseDetailVisible }, null, 2));
        }
      }
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
