import { Page, expect } from "@playwright/test";
import { TestId } from "../../test.types";

export async function signInWithDevUser(page: Page, email: string) {
  await page.goto("/sign-in");
  await expect(page).toHaveURL("/sign-in");

  const userCard = page.getByTestId(`user-card-${email}`);
  await expect(userCard).toBeVisible({ timeout: 20000 });
  await userCard.click();

  await expect(page).toHaveURL("/", { timeout: 20000 });
}

export async function signUpNewUser(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  await page.goto("/auth");
  await expect(page).toHaveURL("/auth");

  const signUpLink = page.getByTestId(TestId.AUTH_SIGNUP_LINK);
  await expect(signUpLink).toBeVisible();
  await signUpLink.click();

  const createAccountHeading = page.getByTestId(
    TestId.AUTH_CREATE_ACCOUNT_HEADING
  );
  await expect(createAccountHeading).toBeVisible();

  await page.getByTestId(TestId.AUTH_NAME_INPUT).fill(name);
  await page.getByTestId(TestId.AUTH_EMAIL_INPUT).fill(email);
  await page.getByTestId(TestId.AUTH_PASSWORD_INPUT).fill(password);

  await page.getByTestId(TestId.AUTH_SIGNUP_BUTTON).click();

  await expect(page).toHaveURL("/", { timeout: 20000 });
}

export async function signInExistingUser(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/auth");
  await expect(page).toHaveURL("/auth");

  await page.getByTestId(TestId.AUTH_EMAIL_INPUT).fill(email);
  await page.getByTestId(TestId.AUTH_PASSWORD_INPUT).fill(password);

  await page.getByTestId(TestId.AUTH_SIGNIN_BUTTON).click();

  await expect(page).toHaveURL("/", { timeout: 20000 });
}

export async function signOut(page: Page) {
  const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
  await expect(avatarMenu).toBeVisible({ timeout: 20000 });
  await avatarMenu.click();

  const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
  await expect(signOutButton).toBeVisible();
  await signOutButton.click();

  await expect(page).toHaveURL("/auth", { timeout: 10000 });
}
