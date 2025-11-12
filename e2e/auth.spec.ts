import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';

test.describe('Authentication Flow', () => {
  test('should complete full authentication flow: sign in -> sign out', async ({ page }) => {
    const logger = new TestStepLogger('Authentication Flow: sign in -> sign out');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Wait for super admin card to be visible', async () => {
      const superAdminCard = page.getByTestId('user-card-superadmin@gazzola.dev');
      await expect(superAdminCard).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Click super admin card to sign in', async () => {
      const superAdminCard = page.getByTestId('user-card-superadmin@gazzola.dev');
      await superAdminCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });

    await logger.step('Wait for avatar menu to be visible', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await expect(avatarMenu).toBeVisible({ timeout: 10000 });
    });

    await logger.step('Click avatar menu', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
    });

    await logger.step('Wait for sign out button to be visible', async () => {
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await expect(signOutButton).toBeVisible();
    });

    await logger.step('Click sign out button', async () => {
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
    });

    await logger.step('Verify redirect back to sign-in page', async () => {
      await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
    });
  });
});
