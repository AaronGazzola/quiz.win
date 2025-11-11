import { Page, Locator } from "@playwright/test";
import { TestId } from "../test.types";
import * as fs from "fs";
import * as path from "path";

interface TestLog {
  testNumber: number;
  testName: string;
  passed: boolean;
  timestamp: string;
  conditions?: string;
  expectation?: string;
  observed?: string;
  screenshotPath?: string;
  errorToast?: string;
}

export class TestResultLogger {
  private logs: TestLog[] = [];
  private testSuiteName: string;
  private expectedTests: Map<
    string,
    { conditions: string; expectation: string }
  > = new Map();

  constructor(testSuiteName: string = "default") {
    this.testSuiteName = testSuiteName;
  }

  registerExpectedTest(
    testName: string,
    conditions: string,
    expectation: string
  ): void {
    this.expectedTests.set(testName, { conditions, expectation });
  }

  log(
    testName: string,
    conditions: string,
    expectation: string,
    observed: string,
    passed: boolean,
    screenshotPath?: string,
    errorToast?: string
  ): void {
    this.expectedTests.delete(testName);

    this.logs.push({
      testNumber: this.logs.length + 1,
      testName,
      passed,
      timestamp: new Date().toISOString(),
      ...(passed
        ? {}
        : { conditions, expectation, observed, screenshotPath, errorToast }),
    });
  }

  finalizeUnreachedTests(): void {
    for (const [testName, { conditions, expectation }] of this.expectedTests) {
      this.logs.push({
        testNumber: this.logs.length + 1,
        testName,
        passed: false,
        timestamp: new Date().toISOString(),
        conditions,
        expectation,
        observed: "Test did not execute - previous assertion failed",
      });
    }
    this.expectedTests.clear();
  }

  getStats() {
    const total = this.logs.length > 0 ? 1 : 0;
    const firstFailure = this.logs.find((log) => !log.passed);
    const passed = firstFailure ? 0 : total;
    const failed = firstFailure ? 1 : 0;

    return { total, passed, failed };
  }

  getSummary(): string {
    const stats = this.getStats();
    if (stats.total === 0) return "";

    const lines: string[] = [];
    lines.push(`${this.testSuiteName} Test Results:`);
    lines.push(
      `  Total: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed}`
    );

    const firstFailure = this.logs.find((log) => !log.passed);
    if (firstFailure) {
      lines.push(`\nFirst Failure:`);
      lines.push(`  ${firstFailure.testName}`);
      if (firstFailure.conditions)
        lines.push(`  Conditions: ${firstFailure.conditions}`);
      if (firstFailure.expectation)
        lines.push(`  Expected: ${firstFailure.expectation}`);
      if (firstFailure.observed)
        lines.push(`  Observed: ${firstFailure.observed}`);
    }

    return lines.join("\n");
  }

  getSerializableData() {
    return {
      stats: this.getStats(),
      tests: this.logs,
      testSuiteName: this.testSuiteName,
    };
  }
}

export function formatTestConditions(
  conditions: Record<string, string | number | boolean>
): string {
  return Object.entries(conditions)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

export async function captureFailureScreenshot(
  page: Page | null,
  testName: string
): Promise<string | undefined> {
  if (!page) return undefined;

  const sanitizedName = testName.toLowerCase().replace(/\s+/g, "-");
  const timestamp = Date.now();
  const screenshotDir = path.join(process.cwd(), "test-results", "failures");

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const screenshotPath = path.join(
    screenshotDir,
    `${sanitizedName}-${timestamp}.png`
  );

  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  } catch (error) {
    return undefined;
  }
}

export async function checkForErrorToast(
  page: Page | null,
  timeout: number = 3000
): Promise<string | null> {
  if (!page) return null;

  const selectors = [
    '[data-testid="toast-error"]',
    '[data-testid="toast-success"]',
    '[data-testid="toast-info"]',
    '[role="status"]',
    '[role="alert"]',
  ];

  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout });
      if (isVisible) {
        return await element.textContent();
      }
    } catch (error) {
    }
  }

  return null;
}

export async function logTestResult(
  logger: TestResultLogger,
  page: Page | null,
  testName: string,
  conditions: string,
  expectation: string,
  passed: boolean,
  observedSuccess: string,
  observedFailure: string
): Promise<void> {
  const observed = passed ? observedSuccess : observedFailure;
  let screenshotPath: string | undefined;
  let errorToast: string | undefined;

  if (!passed && page) {
    screenshotPath = await captureFailureScreenshot(page, testName);
    const toast = await checkForErrorToast(page);
    errorToast = toast || undefined;
  }

  logger.log(
    testName,
    conditions,
    expectation,
    observed,
    passed,
    screenshotPath,
    errorToast
  );
}

export async function getElementByTestId(
  page: Page,
  testId: TestId
): Promise<Locator> {
  return page.getByTestId(testId);
}

export async function clickByTestId(page: Page, testId: TestId): Promise<void> {
  await page.getByTestId(testId).click();
}

export async function fillByTestId(
  page: Page,
  testId: TestId,
  value: string
): Promise<void> {
  await page.getByTestId(testId).fill(value);
}

export async function isVisibleByTestId(
  page: Page,
  testId: TestId,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.getByTestId(testId).waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

export async function getTextByTestId(
  page: Page,
  testId: TestId
): Promise<string> {
  try {
    const text = await page.getByTestId(testId).textContent();
    return text || "";
  } catch {
    return "";
  }
}

export async function countByTestId(
  page: Page,
  testId: TestId
): Promise<number> {
  try {
    return await page.getByTestId(testId).count();
  } catch {
    return 0;
  }
}

export async function waitForElement(
  page: Page,
  testId: TestId,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.getByTestId(testId).waitFor({ state: "attached", timeout });
    return true;
  } catch {
    return false;
  }
}

export async function waitForButtonVisibility(
  page: Page,
  testId: TestId,
  timeout: number = 10000
): Promise<boolean> {
  const attached = await waitForElement(page, testId, timeout);
  if (!attached) return false;
  return await isVisibleByTestId(page, testId, timeout);
}

export async function waitForElementCount(
  page: Page,
  testId: TestId,
  expectedCount: number,
  timeout: number = 10000
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const count = await countByTestId(page, testId);
    if (count === expectedCount) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

export async function waitForMinimumElementCount(
  page: Page,
  testId: TestId,
  minimumCount: number,
  timeout: number = 10000
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const count = await countByTestId(page, testId);
    if (count >= minimumCount) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

export async function waitForLoadingComplete(
  page: Page,
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch (error) {
  }

  try {
    await page.waitForSelector('[data-testid*="loading"]', {
      state: "hidden",
      timeout,
    });
  } catch (error) {
  }

  try {
    const loadingElements = await page.locator('[data-testid*="loading"]').all();
    for (const element of loadingElements) {
      await element.waitFor({ state: "hidden", timeout: 1000 });
    }
  } catch (error) {
  }

  return true;
}

export function generateUniqueEmail(baseEmail: string): string {
  const [local, domain] = baseEmail.split("@");
  return `${local}+${Date.now()}@${domain}`;
}

export interface AuthTestUser {
  email: string;
  password: string;
  fullName: string;
}

export async function signIn(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/auth/signin");
  await fillByTestId(page, TestId.AUTH_EMAIL_INPUT, email);
  await fillByTestId(page, TestId.AUTH_PASSWORD_INPUT, password);
  await clickByTestId(page, TestId.AUTH_SIGNIN_BUTTON);
  await page.waitForURL("/", { timeout: 10000 });
}

export async function signOut(page: Page): Promise<void> {
  await clickByTestId(page, TestId.AUTH_SIGNOUT_BUTTON);
  await page.waitForURL("/", { timeout: 10000 });
}
