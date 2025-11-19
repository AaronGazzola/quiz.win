import { test, expect } from '@playwright/test';
import { TestId } from '../test.types';

test.describe('Organization Switcher Component Tests', () => {
  test('should switch organizations like in dashboard test', async ({ page }) => {
    await page.goto('/org-switcher-test');

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
