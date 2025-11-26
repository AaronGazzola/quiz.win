import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { signInWithDevUser } from './utils/auth-helper';

test.describe('Organization Switcher Auth-Protected Tests', () => {
  test('should work after signing in as super admin', async ({ page }) => {
    await signInWithDevUser(page, 'superadmin@gazzola.dev');

    await page.goto('/org-switcher-test-auth');
    await expect(page).toHaveURL('/org-switcher-test-auth');

    const orgSelector = page.getByTestId(TestId.ORG_SELECTOR);
    await expect(orgSelector).toBeVisible({ timeout: 20000 });

    await orgSelector.click();
    await page.waitForTimeout(500);

    const orgSwitcher = page.getByTestId(TestId.ORG_SWITCHER);
    await expect(orgSwitcher).toBeVisible({ timeout: 20000 });

    const orgOptions = orgSwitcher.locator('[role="menuitemcheckbox"]');
    const optionCount = await orgOptions.count();

    if (optionCount > 1) {
      const secondOption = orgOptions.nth(1);
      await secondOption.click();
      await page.waitForTimeout(2000);
    }
  });
});
