import { test, expect } from "./utils/test-fixtures";
import { TestId } from "../test.types";
import {
  TestResultLogger,
  formatTestConditions,
  logTestResult,
  fillByTestId,
  clickByTestId,
  isVisibleByTestId,
  waitForButtonVisibility,
  generateUniqueEmail,
} from "@/lib/test.utils";
import { cleanupTestUser } from "./utils/test-cleanup";
import * as fs from "fs";
import * as path from "path";

test.describe("Authentication Tests", () => {
  const logger = new TestResultLogger("auth");
  const TEST_EMAIL = generateUniqueEmail("test@example.com");
  const TEST_PASSWORD = "Test123!";
  const TEST_NAME = "Test User";

  test.beforeAll(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL);

    logger.finalizeUnreachedTests();

    const summary = logger.getSummary();
    if (summary) {
      console.log("\n📊 Test Logger Summary:");
      console.log(summary);
    }

    const testResultsDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    const data = logger.getSerializableData();
    const callTimestamp = Date.now();
    const callPath = path.join(
      testResultsDir,
      `afterall-call-${callTimestamp}.json`
    );

    fs.writeFileSync(
      callPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          callId: callTimestamp,
          stats: data.stats,
          testsCount: data.tests.length,
          tests: data.tests,
          testSuiteName: data.testSuiteName,
        },
        null,
        2
      )
    );
  });

  test("should complete full authentication flow: signup -> signout -> signin", async ({
    page,
  }) => {
    logger.registerExpectedTest(
      "Auth - Signup form visible",
      formatTestConditions({ page: "auth", action: "initial load" }),
      "Signup form should be visible"
    );
    logger.registerExpectedTest(
      "Auth - Account created",
      formatTestConditions({ page: "auth", action: "form submitted" }),
      "User should be redirected to dashboard"
    );
    logger.registerExpectedTest(
      "Auth - Signout successful",
      formatTestConditions({ page: "dashboard", action: "signout clicked" }),
      "User should be redirected to home and see signin button"
    );
    logger.registerExpectedTest(
      "Auth - Signin successful",
      formatTestConditions({ page: "auth", action: "signin submitted" }),
      "User should be redirected to dashboard"
    );

    await page.goto("/auth/signup");

    let signupFormVisible = false;
    try {
      await expect(page.getByTestId(TestId.AUTH_EMAIL_INPUT)).toBeVisible({
        timeout: 10000,
      });
      signupFormVisible = await isVisibleByTestId(
        page,
        TestId.AUTH_EMAIL_INPUT,
        10000
      );
    } catch (error) {
      signupFormVisible = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - Signup form visible",
      formatTestConditions({ page: "auth", action: "initial load" }),
      "Signup form should be visible",
      signupFormVisible,
      "Signup form visible",
      "Signup form not found"
    );

    if (!signupFormVisible) {
      throw new Error("Signup form not visible");
    }

    await fillByTestId(page, TestId.AUTH_EMAIL_INPUT, TEST_EMAIL);
    await fillByTestId(page, TestId.AUTH_PASSWORD_INPUT, TEST_PASSWORD);
    await fillByTestId(page, TestId.AUTH_NAME_INPUT, TEST_NAME);
    await clickByTestId(page, TestId.AUTH_SIGNUP_BUTTON);

    let accountCreated = false;
    try {
      await page.waitForURL("/dashboard", { timeout: 10000 });
      accountCreated = true;
    } catch (error) {
      accountCreated = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - Account created",
      formatTestConditions({ page: "auth", action: "form submitted" }),
      "User should be redirected to dashboard",
      accountCreated,
      "Redirected to dashboard",
      "Failed to redirect to dashboard"
    );

    if (!accountCreated) {
      throw new Error("Account creation failed");
    }

    const signoutButtonVisible = await waitForButtonVisibility(
      page,
      TestId.AUTH_SIGNOUT_BUTTON,
      10000
    );
    if (signoutButtonVisible) {
      await clickByTestId(page, TestId.AUTH_SIGNOUT_BUTTON);
    }

    let signoutSuccessful = false;
    try {
      await page.waitForURL("/", { timeout: 10000 });
      const signinVisible = await waitForButtonVisibility(
        page,
        TestId.NAV_SIGNIN_BUTTON,
        10000
      );
      signoutSuccessful = signinVisible;
    } catch (error) {
      signoutSuccessful = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - Signout successful",
      formatTestConditions({ page: "dashboard", action: "signout clicked" }),
      "User should be redirected to home and see signin button",
      signoutSuccessful,
      "Signout successful",
      "Signout failed"
    );

    if (!signoutSuccessful) {
      throw new Error("Signout failed");
    }

    await page.goto("/auth/signin");
    await fillByTestId(page, TestId.AUTH_EMAIL_INPUT, TEST_EMAIL);
    await fillByTestId(page, TestId.AUTH_PASSWORD_INPUT, TEST_PASSWORD);
    await clickByTestId(page, TestId.AUTH_SIGNIN_BUTTON);

    let signinSuccessful = false;
    try {
      await page.waitForURL("/dashboard", { timeout: 10000 });
      signinSuccessful = true;
    } catch (error) {
      signinSuccessful = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - Signin successful",
      formatTestConditions({ page: "auth", action: "signin submitted" }),
      "User should be redirected to dashboard",
      signinSuccessful,
      "Signin successful",
      "Signin failed"
    );

    if (!signinSuccessful) {
      throw new Error("Signin failed");
    }
  });
});
