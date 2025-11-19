import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';

test.describe('Organization Switcher In Layout Tests', () => {
  test('should work when in dashboard layout header', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL('/sign-in');

    const superAdminCard = page.getByTestId('user-card-superadmin@gazzola.dev');
    await expect(superAdminCard).toBeVisible({ timeout: 10000 });
    await superAdminCard.click();

    await expect(page).toHaveURL('/', { timeout: 20000 });

    await page.goto('/org-switcher-test-layout');
    await expect(page).toHaveURL('/org-switcher-test-layout');

    await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
    await expect(page.getByTestId(TestId.DASHBOARD_METRIC_TOTAL_QUIZZES)).toBeVisible({ timeout: 20000 });

    const orgSelector = page.getByTestId(TestId.ORG_SELECTOR);
    await expect(orgSelector).toBeVisible({ timeout: 20000 });

    await orgSelector.click();
    await page.waitForTimeout(500);

    const orgSwitcher = page.getByTestId(TestId.ORG_SWITCHER);
    await expect(orgSwitcher).toBeVisible({ timeout: 20000 });

    const orgOptions = orgSwitcher.locator('[role="menuitemcheckbox"]');
    const optionCount = await orgOptions.count();
    expect(optionCount).toBeGreaterThan(0);

    if (optionCount > 1) {
      const secondOption = orgOptions.nth(1);
      await secondOption.click();
      await page.waitForTimeout(2000);
    }
  });
});
