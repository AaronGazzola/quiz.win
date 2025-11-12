import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';

test.describe('Authentication Flow', () => {
  test('should complete full authentication flow: sign in -> sign out', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page).toHaveURL('/sign-in');

    const superAdminCard = page.getByTestId('user-card-superadmin@gazzola.dev');
    await expect(superAdminCard).toBeVisible({ timeout: 10000 });

    await superAdminCard.click();

    await expect(page).toHaveURL('/', { timeout: 10000 });

    const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
    await expect(avatarMenu).toBeVisible();

    await avatarMenu.click();

    const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
    await expect(signOutButton).toBeVisible();

    await signOutButton.click();

    await expect(page).toHaveURL('/sign-in', { timeout: 10000 });
  });
});
