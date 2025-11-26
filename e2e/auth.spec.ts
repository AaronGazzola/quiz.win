import { TestId } from "../test.types";
import { expect, test } from "./utils/test-fixtures";
import { TestStepLogger } from "./utils/test-logger";

test.describe("Authentication Flow", () => {
  let testEmail: string;
  let testName: string;
  const testPassword = "TestPassword123!";

  test.beforeEach(async ({ request }) => {
    try {
      await request.post("/api/test-cleanup", {
        data: { cleanupOrphanedOrgs: true },
      });
    } catch (error) {
      console.log("Pre-cleanup skipped:", error);
    }

    const timestamp = Date.now();
    testEmail = `test-auth-${timestamp}@example.com`;
    testName = `Test User ${timestamp}`;
  });

  test.afterEach(async ({ request }) => {
    if (testEmail) {
      try {
        await request.post("/api/test-cleanup", {
          data: { email: testEmail },
        });
      } catch (error) {
        console.log("Cleanup skipped:", error);
      }
    }
  });

  test("should complete full authentication flow: sign up -> sign in -> sign out", async ({
    page,
  }) => {
    const logger = new TestStepLogger(
      "Authentication Flow: sign up -> sign in -> sign out"
    );

    await logger.step("Navigate to auth page", async () => {
      await page.goto("/auth");
      await expect(page).toHaveURL("/auth");
    });

    await logger.step("Toggle to sign up form", async () => {
      const signUpLink = page.getByTestId(TestId.AUTH_SIGNUP_LINK);
      await expect(signUpLink).toBeVisible();
      await signUpLink.click();
    });

    await logger.step("Wait for Create Account heading", async () => {
      const createAccountHeading = page.getByTestId(TestId.AUTH_CREATE_ACCOUNT_HEADING);
      await expect(createAccountHeading).toBeVisible();
    });

    await logger.step("Fill in sign up form", async () => {
      const nameInput = page.getByTestId(TestId.AUTH_NAME_INPUT);
      const emailInput = page.getByTestId(TestId.AUTH_EMAIL_INPUT);
      const passwordInput = page.getByTestId(TestId.AUTH_PASSWORD_INPUT);

      await nameInput.fill(testName);
      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);
    });

    await logger.step("Submit sign up form", async () => {
      const signUpButton = page.getByTestId(TestId.AUTH_SIGNUP_BUTTON);
      await signUpButton.click();
    });

    await logger.step("Verify redirect to home page after sign up", async () => {
      await expect(page).toHaveURL("/", { timeout: 20000 });
    });

    await logger.step("Wait for avatar menu to be visible", async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await expect(avatarMenu).toBeVisible({ timeout: 20000 });
    });

    await logger.step("Click avatar menu", async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
    });

    await logger.step("Wait for sign out button to be visible", async () => {
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await expect(signOutButton).toBeVisible();
    });

    await logger.step("Click sign out button", async () => {
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
    });

    await logger.step("Verify redirect back to auth page", async () => {
      await expect(page).toHaveURL("/auth", { timeout: 10000 });
    });

    await logger.step("Fill in sign in form with same credentials", async () => {
      const emailInput = page.getByTestId(TestId.AUTH_EMAIL_INPUT);
      const passwordInput = page.getByTestId(TestId.AUTH_PASSWORD_INPUT);

      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);
    });

    await logger.step("Submit sign in form", async () => {
      const signInButton = page.getByTestId(TestId.AUTH_SIGNIN_BUTTON);
      await signInButton.click();
    });

    await logger.step("Verify redirect to home page after sign in", async () => {
      await expect(page).toHaveURL("/", { timeout: 20000 });
    });

    await logger.step("Verify user is signed in", async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await expect(avatarMenu).toBeVisible({ timeout: 20000 });
    });
  });
});
