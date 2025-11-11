# New Test Checklist

Use this checklist when adding new tests to ensure consistency with the testing patterns.

## For Every New Test

- [ ] Test file follows naming convention: `*.test.ts` (Jest) or `*.spec.ts` (Playwright)
- [ ] Test file is in correct directory:
  - `__tests__/` for Jest unit/integration tests
  - `e2e/` for Playwright e2e tests
- [ ] No comments in test file (per CLAUDE.md rules)
- [ ] Test imports are correct:
  - Jest: `import { describe, it, expect } from '@jest/globals'` (or defaults)
  - Playwright: `import { test, expect } from "./utils/test-fixtures"`

## For Playwright E2E Tests

### File Structure
- [ ] Imports TestId enum from `"../test.types"`
- [ ] Imports test utilities from `"@/lib/test.utils"`
- [ ] Imports cleanup utilities from `"./utils/test-cleanup"`
- [ ] Imports test fixtures: `import { test, expect } from "./utils/test-fixtures"`

### TestResultLogger Setup
- [ ] Creates TestResultLogger instance: `const logger = new TestResultLogger("suite-name")`
- [ ] Includes afterAll hook with:
  - [ ] `logger.finalizeUnreachedTests()`
  - [ ] Console summary output
  - [ ] JSON file write with serializable data

### Test Data Cleanup
- [ ] Includes beforeAll hook with cleanup function call
- [ ] Includes afterAll hook with cleanup function call
- [ ] Uses unique identifiers (timestamps/UUIDs) for test data

### Test Implementation
- [ ] Uses 10-second timeout for all assertions: `{ timeout: 10000 }`
- [ ] Registers all expected tests at start with `logger.registerExpectedTest()`
- [ ] Uses try/catch blocks for assertions
- [ ] Calls `logTestResult()` after each verification
- [ ] Throws error immediately on first failure
- [ ] Uses helper functions from test.utils.ts:
  - [ ] `clickByTestId()` instead of direct clicks
  - [ ] `fillByTestId()` instead of direct fills
  - [ ] `isVisibleByTestId()` for visibility checks
  - [ ] `waitForButtonVisibility()` for button waits
  - [ ] `formatTestConditions()` for condition strings

### Data Attributes
- [ ] Only uses `data-testid` selectors (never CSS, roles, or text)
- [ ] All TestId values are from test.types.ts enum
- [ ] Uses `data-state` for dynamic UI state checks

## For Jest Unit Tests

### Test Structure
- [ ] Uses `describe()` blocks for grouping
- [ ] Uses `it()` or `test()` for individual tests
- [ ] Test names start with "should"
- [ ] Includes beforeEach/afterEach for cleanup if needed

### Mocking
- [ ] Mocks are properly typed
- [ ] Mocks are cleared in beforeEach: `jest.clearAllMocks()`
- [ ] Mock implementations are realistic

### Assertions
- [ ] Uses appropriate Jest matchers
- [ ] Tests both success and error cases
- [ ] Tests edge cases and null/undefined handling

## Component Updates (When Adding E2E Tests)

### Add data-testid Attributes
- [ ] All interactive elements have `data-testid`
- [ ] TestId enum values are imported from `"@/test.types"`
- [ ] No hardcoded string values for data-testid

### Add data-state Attributes (For Dynamic UI)
- [ ] Container elements have `data-state` attribute
- [ ] State values are descriptive: "editing", "viewing", "loading", "error"
- [ ] State transitions are testable

## Documentation Updates

### Test.md
- [ ] Added new test to Test Index with link and command
- [ ] Added new test section with:
  - [ ] File path
  - [ ] Command to run
  - [ ] Test descriptions with "should" statements
  - [ ] Pass conditions with ✓ symbol
- [ ] Test number follows sequence

### test.types.ts (If New TestIds Added)
- [ ] New TestId enum entries follow naming convention
- [ ] TestId names are descriptive and unique
- [ ] TestId values use kebab-case

## package.json (If New Test Category)

- [ ] Added new test script following naming convention
- [ ] Script properly targets test file or directory
- [ ] Updated test:all script if needed

## Example Checklist for a New Feature

### Adding Quiz Management E2E Test

**Before Starting:**
- [ ] Review `docs/Testing.md` for patterns
- [ ] Review `docs/test.util.md` for examples
- [ ] Review existing `e2e/auth.spec.ts` for reference

**Component Work:**
- [ ] Add `QUIZ_CREATE_BUTTON` to TestId enum
- [ ] Add `QUIZ_FORM_TITLE_INPUT` to TestId enum
- [ ] Add `QUIZ_FORM_DESCRIPTION_INPUT` to TestId enum
- [ ] Add `QUIZ_LIST_ITEM` to TestId enum
- [ ] Add data-testid attributes to QuizForm component
- [ ] Add data-testid attributes to QuizList component
- [ ] Add data-state="creating" to form container

**Test File Creation:**
- [ ] Create `e2e/quiz-management.spec.ts`
- [ ] Import test, expect from fixtures
- [ ] Import TestId enum
- [ ] Import test utilities
- [ ] Create TestResultLogger
- [ ] Set up beforeAll/afterAll hooks
- [ ] Create cleanup function in test-cleanup.ts if needed

**Test Implementation:**
- [ ] Register all expected tests
- [ ] Implement quiz creation test
- [ ] Implement quiz editing test
- [ ] Implement quiz deletion test
- [ ] Use 10-second timeouts
- [ ] Log all test results
- [ ] Fail fast on errors

**Documentation:**
- [ ] Add to Test.md index
- [ ] Add test section with pass conditions
- [ ] Add npm script to package.json: `test:e2e:quiz`
- [ ] Update test:all script if needed

**Testing:**
- [ ] Run test in headed mode: `npm run test:e2e:headed`
- [ ] Verify all tests pass
- [ ] Check test report in test-results/
- [ ] Review README.md output
- [ ] Verify cleanup works properly

**Code Review:**
- [ ] No comments in test file
- [ ] All TestId values from enum
- [ ] All timeouts are 10 seconds
- [ ] Proper error handling
- [ ] Clean code without duplication
