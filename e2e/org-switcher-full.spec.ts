import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { signInWithDevUser } from './utils/auth-helper';

test.describe('Organization Switcher Full Dashboard Tests', () => {
  test('should switch organizations exactly like failing dashboard test', async ({ page }) => {
    await signInWithDevUser(page, 'superadmin@gazzola.dev');

    await page.goto('/org-switcher-test-full');

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

    if (optionCount > 1) {
      const techCorpOption = orgOptions.nth(1);
      await techCorpOption.click();
      await page.waitForTimeout(2000);
    }

    await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
    await page.waitForTimeout(1000);

    await orgSelector.click();
    await page.waitForTimeout(500);

    const orgSwitcher2 = page.getByTestId(TestId.ORG_SWITCHER);
    await expect(orgSwitcher2).toBeVisible({ timeout: 20000 });

    const healthCareOption = orgSwitcher2.locator('[role="menuitemcheckbox"]').first();
    await healthCareOption.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector(`[data-testid="${TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}"][data-loading="false"]`, { timeout: 20000 });
  });
});
