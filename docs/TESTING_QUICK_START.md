# Testing Quick Start Guide

Quick reference for writing and running tests in this repository.

## Running Tests

```bash
npm run test:all          # Run all tests (Jest + Playwright)
npm run test              # Run Jest unit tests only
npm run test:e2e          # Run Playwright e2e tests
npm run test:e2e:headed   # Run e2e tests with visible browser
npm run test:e2e:trace    # Run e2e tests with full trace for debugging
npm run test:watch        # Run Jest tests in watch mode
npm run test:coverage     # Run Jest tests with coverage report
```

## Writing a Simple Jest Unit Test

```typescript
import { myFunction } from "@/lib/my-module";

describe("My Module", () => {
  describe("myFunction", () => {
    it("should return expected value when given valid input", () => {
      const result = myFunction("valid input");
      expect(result).toBe("expected output");
    });

    it("should throw error when given invalid input", () => {
      expect(() => myFunction(null)).toThrow("Invalid input");
    });
  });
});
```

## Writing a Playwright E2E Test

### 1. Import Required Dependencies

```typescript
import { test, expect } from "./utils/test-fixtures";
import { TestId } from "../test.types";
import {
  TestResultLogger,
  formatTestConditions,
  logTestResult,
  fillByTestId,
  clickByTestId,
  isVisibleByTestId,
} from "@/lib/test.utils";
import { cleanupTestUser } from "./utils/test-cleanup";
import * as fs from "fs";
import * as path from "path";
```

### 2. Set Up Test Suite

```typescript
test.describe("Feature Tests", () => {
  const logger = new TestResultLogger("feature-name");

  test.beforeAll(async () => {
  });

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
      JSON.stringify({
        timestamp: new Date().toISOString(),
        callId: callTimestamp,
        stats: data.stats,
        testsCount: data.tests.length,
        tests: data.tests,
        testSuiteName: data.testSuiteName,
      }, null, 2)
    );
  });

  test("should perform expected behavior", async ({ page }) => {

  });
});
```

### 3. Write Test with TestResultLogger

```typescript
test("should complete user flow", async ({ page }) => {
  logger.registerExpectedTest(
    "Step 1 - Element visible",
    formatTestConditions({ page: "home", userType: "guest" }),
    "Element should be visible"
  );
  logger.registerExpectedTest(
    "Step 2 - Form submitted",
    formatTestConditions({ page: "form", userType: "authenticated" }),
    "Form should submit successfully"
  );

  await page.goto("/");

  let elementVisible = false;
  try {
    await expect(page.getByTestId(TestId.ELEMENT)).toBeVisible({ timeout: 10000 });
    elementVisible = await isVisibleByTestId(page, TestId.ELEMENT, 10000);
  } catch (error) {
    elementVisible = false;
  }

  await logTestResult(
    logger,
    page,
    "Step 1 - Element visible",
    formatTestConditions({ page: "home", userType: "guest" }),
    "Element should be visible",
    elementVisible,
    "Element visible",
    "Element not found"
  );

  if (!elementVisible) {
    throw new Error("Element not visible");
  }

});
```

## Adding data-testid to Components

```tsx
import { TestId } from "@/test.types";

export function MyComponent() {
  return (
    <div data-testid={TestId.FORM_CONTAINER}>
      <input
        data-testid={TestId.FORM_EMAIL_INPUT}
        type="email"
      />
      <button data-testid={TestId.FORM_SUBMIT_BUTTON}>
        Submit
      </button>
    </div>
  );
}
```

## Adding data-state for Dynamic UI

```tsx
import { TestId } from "@/test.types";
import { useState } from "react";

export function EditableComponent() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      data-testid={TestId.FORM_CONTAINER}
      data-state={isEditing ? "editing" : "viewing"}
    >
      <button
        data-testid={TestId.EDIT_BUTTON}
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "Cancel" : "Edit"}
      </button>
      {isEditing ? <EditForm /> : <ViewContent />}
    </div>
  );
}
```

## Common Test Utilities

### Element Interaction
```typescript
await clickByTestId(page, TestId.SUBMIT_BUTTON);
await fillByTestId(page, TestId.EMAIL_INPUT, "test@example.com");
const text = await getTextByTestId(page, TestId.HEADING);
const count = await countByTestId(page, TestId.LIST_ITEM);
```

### Visibility Checks
```typescript
const isVisible = await isVisibleByTestId(page, TestId.ELEMENT, 10000);
const buttonVisible = await waitForButtonVisibility(page, TestId.BUTTON, 10000);
```

### Element Counting
```typescript
const hasExactly3 = await waitForElementCount(page, TestId.CARD, 3, 10000);
const hasAtLeast2 = await waitForMinimumElementCount(page, TestId.CARD, 2, 10000);
```

### Loading States
```typescript
await waitForLoadingComplete(page, 10000);
```

### Authentication
```typescript
import { signIn, signOut, generateUniqueEmail } from "@/lib/test.utils";

const testEmail = generateUniqueEmail("test@example.com");
await signIn(page, testEmail, "password");
await signOut(page);
```

## Test Rules

1. **Always use 10-second timeout**: `{ timeout: 10000 }`
2. **Always use data-testid**: Never use CSS selectors, roles, or text content
3. **Import test/expect from fixtures**: `import { test, expect } from "./utils/test-fixtures"`
4. **Clean up test data**: Use beforeAll/afterAll hooks
5. **Fail fast**: Throw error immediately on first failure
6. **No comments**: Remove all comments from test files
7. **Use TestResultLogger**: For tests with 3+ verification points

## Viewing Test Results

### After Running Tests

Test results are generated in:
- `test-results/{TEST_RUN_ID}/` - Individual test run results
  - `README.md` - Human-readable report
  - `test-report.json` - Machine-readable data
  - Screenshots and traces (if test failed)

### Viewing Traces

```bash
npx playwright show-trace test-results/2025-11-11_12-34-56-789_auth.spec/trace.zip
```

## Debugging Tests

### Run with Visible Browser
```bash
npm run test:e2e:headed
```

### Run with Full Trace
```bash
npm run test:e2e:trace
```

### Run in Debug Mode
```bash
npm run test:e2e:debug
```

### Run Playwright UI Mode
```bash
npm run test:e2e:ui
```

## Full Documentation

- **Testing Guidelines**: `docs/Testing.md`
- **Test Utility Examples**: `docs/test.util.md`
- **Test Documentation**: `Test.md`
- **Refactor Summary**: `docs/TESTING_REFACTOR_SUMMARY.md`
