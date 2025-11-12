import {
  TestResultLogger,
  clickByTestId,
  formatTestConditions,
  logTestResult,
  waitForButtonVisibility,
} from "@/lib/test.utils";
import * as fs from "fs";
import * as path from "path";
import { TestId } from "../test.types";
import { test } from "./utils/test-fixtures";

test.describe("Authentication Tests", () => {
  const logger = new TestResultLogger("auth");
  const TEST_USER_EMAIL_DOMAIN =
    process.env.NEXT_PUBLIC_TEST_USER_EMAIL_DOMAIN || "gazzola.dev";
  const TEST_USER_EMAIL = `dr.sarah.chen@${TEST_USER_EMAIL_DOMAIN}`;

  test.afterAll(async () => {
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

  test("should complete full authentication flow: signin -> signout -> signin", async ({
    page,
  }) => {
    logger.registerExpectedTest(
      "Auth - User card visible",
      formatTestConditions({ page: "sign-in", action: "initial load" }),
      "User card should be visible"
    );
    logger.registerExpectedTest(
      "Auth - First signin successful",
      formatTestConditions({ page: "sign-in", action: "user card clicked" }),
      "User should be redirected to root"
    );
    logger.registerExpectedTest(
      "Auth - Signout successful",
      formatTestConditions({ page: "dashboard", action: "signout clicked" }),
      "User should be redirected to sign-in and see user cards"
    );
    logger.registerExpectedTest(
      "Auth - Second signin successful",
      formatTestConditions({ page: "sign-in", action: "user card clicked" }),
      "User should be redirected to root"
    );

    await page.goto("/sign-in");

    let userCardVisible = false;
    try {
      await page.waitForSelector(
        `[data-testid="${TestId.AUTH_USER_CARD}-${TEST_USER_EMAIL}"]`,
        { timeout: 10000 }
      );
      userCardVisible = true;
    } catch (error) {
      userCardVisible = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - User card visible",
      formatTestConditions({ page: "sign-in", action: "initial load" }),
      "User card should be visible",
      userCardVisible,
      "User card visible",
      "User card not found"
    );

    if (!userCardVisible) {
      throw new Error("User card not visible");
    }

    await page.click(
      `[data-testid="${TestId.AUTH_USER_CARD}-${TEST_USER_EMAIL}"]`
    );

    let firstSigninSuccessful = false;
    try {
      await page.waitForURL("/", { timeout: 10000 });
      firstSigninSuccessful = true;
    } catch (error) {
      firstSigninSuccessful = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - First signin successful",
      formatTestConditions({ page: "sign-in", action: "user card clicked" }),
      "User should be redirected to root",
      firstSigninSuccessful,
      "Redirected to root",
      "Failed to redirect to root"
    );

    if (!firstSigninSuccessful) {
      throw new Error("First signin failed");
    }

    const avatarMenuVisible = await waitForButtonVisibility(
      page,
      TestId.AUTH_AVATAR_MENU,
      10000
    );
    if (avatarMenuVisible) {
      await clickByTestId(page, TestId.AUTH_AVATAR_MENU);
      const signoutButtonVisible = await waitForButtonVisibility(
        page,
        TestId.AUTH_SIGNOUT_BUTTON,
        10000
      );
      if (signoutButtonVisible) {
        await clickByTestId(page, TestId.AUTH_SIGNOUT_BUTTON);
      }
    }

    let signoutSuccessful = false;
    try {
      await page.waitForURL("/sign-in", { timeout: 10000 });
      await page.waitForSelector(
        `[data-testid="${TestId.AUTH_USER_CARD}-${TEST_USER_EMAIL}"]`,
        { timeout: 10000 }
      );
      signoutSuccessful = true;
    } catch (error) {
      signoutSuccessful = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - Signout successful",
      formatTestConditions({ page: "dashboard", action: "signout clicked" }),
      "User should be redirected to sign-in and see user cards",
      signoutSuccessful,
      "Signout successful",
      "Signout failed"
    );

    if (!signoutSuccessful) {
      throw new Error("Signout failed");
    }

    await page.goto("/sign-in");
    await page.click(
      `[data-testid="${TestId.AUTH_USER_CARD}-${TEST_USER_EMAIL}"]`
    );

    let secondSigninSuccessful = false;
    try {
      await page.waitForURL("/", { timeout: 10000 });
      secondSigninSuccessful = true;
    } catch (error) {
      secondSigninSuccessful = false;
    }

    await logTestResult(
      logger,
      page,
      "Auth - Second signin successful",
      formatTestConditions({ page: "sign-in", action: "user card clicked" }),
      "User should be redirected to root",
      secondSigninSuccessful,
      "Signin successful",
      "Signin failed"
    );

    if (!secondSigninSuccessful) {
      throw new Error("Second signin failed");
    }
  });
});
