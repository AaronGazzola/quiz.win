import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { signInWithDevUser } from './utils/auth-helper';

test.describe('Organization Switcher Real Data Tests', () => {
  test('should work with real user data and stores', async ({ page }) => {
    await signInWithDevUser(page, 'superadmin@gazzola.dev');

    await page.goto('/org-switcher-test-data');
    await expect(page).toHaveURL('/org-switcher-test-data');

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
