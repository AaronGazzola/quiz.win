# quiz.win - E2E Test Suite

This document describes the complete end-to-end test suite for quiz.win, covering authentication, dashboard, quiz workflow, and quiz taking functionality.

## Test Philosophy

Tests focus on **user-facing features and functionality**, validating the complete user journey through the application. All tests use the Playwright framework with custom test fixtures for enhanced diagnostics.

## Test Index

### Authentication Tests (2 tests)
1. [User authentication with pre-configured accounts](#1-user-authentication-with-pre-configured-accounts) - `npm run test:e2e:auth`
2. [User logout clears session](#2-user-logout-clears-session) - `npm run test:e2e:auth`

### Dashboard Tests (12 tests)
3. [Dashboard displays correctly for different user roles](#3-dashboard-displays-correctly-for-different-user-roles) - `npm run test:e2e:dash`
4. [Organization filtering](#4-organization-filtering) - `npm run test:e2e:dash`
5. [Quiz table interaction](#5-quiz-table-interaction) - `npm run test:e2e:dash`
6. [View quiz responses](#6-view-quiz-responses) - `npm run test:e2e:dash`
7. [Response detail view](#7-response-detail-view) - `npm run test:e2e:dash`
8. [Organization switching](#8-organization-switching) - `npm run test:e2e:dash`
9. [Data isolation between organizations](#9-data-isolation-between-organizations) - `npm run test:e2e:dash`
10. [Role-based access control](#10-role-based-access-control) - `npm run test:e2e:dash`

### Quiz Workflow Tests (2 tests)
11. [Complete quiz workflow: creation → taking → viewing results](#11-complete-quiz-workflow-creation-taking-viewing-results) - `npm run test:e2e:quiz-workflow`
12. [Quiz workflow with mixed correct/incorrect answers](#12-quiz-workflow-with-mixed-correctincorrect-answers) - `npm run test:e2e:quiz-workflow`

### Quiz Taking Tests (3 tests)
13. [Complete quiz with all correct answers](#13-complete-quiz-with-all-correct-answers) - `npm run test:e2e:quiz-taking`
14. [Review mode with all correct answers](#14-review-mode-with-all-correct-answers) - `npm run test:e2e:quiz-taking`
15. [Review mode with incorrect answers](#15-review-mode-with-incorrect-answers) - `npm run test:e2e:quiz-taking`

---

## Authentication Tests

### 1. User authentication with pre-configured accounts

**File:** `e2e/auth.spec.ts`
**Command:** `npm run test:e2e:auth`

**Pass Conditions:**
- User can navigate to sign-in page (`/sign-in`)
- Pre-configured user cards are visible via `user-card-{email}` test IDs
- Clicking user card authenticates the user
- User is redirected to dashboard (`/`)
- User menu displays authenticated state via `auth-avatar-menu`

**Test Data:**
- Pre-seeded users from database seed file

**Related Test IDs:** `user-card-*`, `auth-avatar-menu`

---

### 2. User logout clears session

**File:** `e2e/auth.spec.ts`
**Command:** `npm run test:e2e:auth`

**Pass Conditions:**
- Authenticated user can click avatar menu `auth-avatar-menu`
- Sign out button `auth-signout-button` is visible
- Clicking sign out redirects to `/sign-in`
- Session is cleared
- User cannot access protected routes

**Related Test IDs:** `auth-avatar-menu`, `auth-signout-button`

---

## Dashboard Tests

### 3. Dashboard displays correctly for different user roles

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Dashboard container `dashboard-container` loads
- Quiz table `dashboard-quiz-table` displays
- Metrics display appropriate data for user role
- Take/View buttons shown based on permissions

**Related Test IDs:** `dashboard-container`, `dashboard-quiz-table`, `dashboard-metric-*`

---

### 4. Organization filtering

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Organization filter `org-filter` displays available organizations
- Selecting organization filters quiz table
- Only quizzes from selected organization(s) are shown
- Filter persists across page refreshes

**Related Test IDs:** `org-filter`, `dashboard-quiz-table`

---

### 5. Quiz table interaction

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Quiz rows `dashboard-quiz-table-row` are clickable
- Clicking row expands details or selects quiz
- Take Quiz button appears for available quizzes
- Response count displays correctly

**Related Test IDs:** `dashboard-quiz-table-row`, `dashboard-quiz-take-button`, `dashboard-quiz-responses-button`

---

### 6. View quiz responses

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Responses button visible for admin/instructor roles
- Clicking responses shows response table `dashboard-responses-table`
- Response table shows all submissions for quiz
- Each response row displays user, score, timestamp

**Related Test IDs:** `dashboard-quiz-responses-button`, `dashboard-responses-table`, `dashboard-responses-table-row`

---

### 7. Response detail view

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Clicking response row shows detail view `dashboard-response-detail`
- Detail shows all questions and user answers
- Correct/incorrect indicators displayed
- User information visible

**Related Test IDs:** `dashboard-response-detail`, `dashboard-response-detail-question`, `dashboard-user-response`

---

### 8. Organization switching

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Organization switcher `org-switcher` allows changing active organization
- Dashboard data refreshes on organization change
- Quiz table updates to show new organization's quizzes
- User permissions respect new organization context

**Related Test IDs:** `org-switcher`, `dashboard-quiz-table`

---

### 9. Data isolation between organizations

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Quizzes from Organization A not visible when Organization B selected
- Responses isolated by organization
- Users only see data from organizations they belong to
- No data leakage between organizations

**Related Test IDs:** `org-filter`, `dashboard-quiz-table`

---

### 10. Role-based access control

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

**Pass Conditions:**
- Admin users can view all responses
- Instructor users can view responses for their quizzes
- Student users can only take quizzes
- Edit/Delete buttons only shown for authorized users

**Related Test IDs:** `dashboard-quiz-responses-button`, `quiz-edit-button`, `quiz-delete-button`

---

## Quiz Workflow Tests

### 11. Complete quiz workflow: creation → taking → viewing results

**File:** `e2e/quiz-workflow.spec.ts`
**Command:** `npm run test:e2e:quiz-workflow`

**Pass Conditions:**
- **Quiz Creation:**
  - Click Add Quiz button `dashboard-add-quiz-button`
  - Navigate to `/take-quiz/new`
  - Quiz creation container `quiz-create-container` loads
  - Enter title via `quiz-create-title-input`
  - Enter description via `quiz-create-description-input`
  - Add questions using `quiz-create-add-question-button`
  - Enter question text via `quiz-create-question-input`
  - Add options via `quiz-create-add-option-button`
  - Fill option inputs `quiz-create-option-input-{index}`
  - Select correct answer via `quiz-create-correct-answer-radio-{index}`
  - Progress bar `quiz-create-progress-bar` updates
  - Question counter `quiz-create-question-counter` shows progress
  - Navigate between questions using `quiz-create-next-button` and `quiz-create-previous-button`
  - Save quiz via `quiz-create-save-button`
  - Redirect to dashboard

- **Quiz Taking:**
  - Find newly created quiz by title in quiz table
  - Click Take Quiz button
  - Quiz taking container `quiz-take-container` loads
  - Title displays correctly via `quiz-take-title`
  - Progress bar `quiz-take-progress-bar` visible
  - Question counter `quiz-take-question-counter` shows "Question 1 of X"
  - Question text displays via `quiz-take-question-text`
  - Answer options shown with `quiz-take-answer-label-{index}`
  - Select answers by clicking labels
  - Answered counter `quiz-take-answered-counter` updates
  - Navigate using `quiz-take-next-button` and `quiz-take-previous-button`
  - Question nav dots `quiz-take-question-nav-dot-{index}` allow jumping
  - Submit button `quiz-take-submit-button` appears when all answered
  - Submit quiz

- **Viewing Results:**
  - Review container `quiz-review-container` loads
  - Score section `quiz-review-score` displays
  - Score percentage `quiz-review-score-percentage` shows 100%
  - Completion date `quiz-review-completion-date` visible
  - Result indicator `quiz-review-result-indicator` shows "Correct!" for each question
  - Your answer label `quiz-review-your-answer-label` visible
  - Can navigate through questions in review mode
  - Back to dashboard button `quiz-take-back-to-dashboard` works

**Test Data:**
- Creates quiz with 3 questions
- Each question has 2-4 options
- All questions answered correctly

**Related Test IDs:**
- Creation: `quiz-create-*`
- Taking: `quiz-take-*`
- Review: `quiz-review-*`

---

### 12. Quiz workflow with mixed correct/incorrect answers

**File:** `e2e/quiz-workflow.spec.ts`
**Command:** `npm run test:e2e:quiz-workflow`

**Pass Conditions:**
- Create quiz with 2 questions
- Take quiz answering one correctly, one incorrectly
- Review mode shows 50% score
- First question shows "Correct!" indicator
- Second question shows "Incorrect" indicator
- Both "Your Answer" and "Correct Answer" labels visible for incorrect question
- Score displays "1 of 2 correct"

**Test Data:**
- 2-question quiz
- 1 correct answer, 1 incorrect answer
- 50% final score

**Related Test IDs:** `quiz-review-result-indicator`, `quiz-review-your-answer-label`, `quiz-review-correct-answer-label`

---

## Quiz Taking Tests

### 13. Complete quiz with all correct answers

**File:** `e2e/quiz-taking.spec.ts`
**Command:** `npm run test:e2e:quiz-taking`

**Pass Conditions:**
- Sign in as test user
- Navigate to dashboard
- Select "Medical Terminology Basics" quiz
- Click Take Quiz button
- Quiz taking page loads with all UI elements
- Answer all 3 questions correctly
- Test Previous/Next button navigation
- Test question nav dots navigation
- Submit quiz
- Redirect to review mode
- Verify 100% score

**Test Data:**
- Pre-seeded "Medical Terminology Basics" quiz
- User: nurse.emily.davis@gazzola.dev

**Related Test IDs:** `quiz-take-*`, `quiz-review-*`

---

### 14. Review mode with all correct answers

**File:** `e2e/quiz-taking.spec.ts`
**Command:** `npm run test:e2e:quiz-taking`

**Pass Conditions:**
- Sign in as user with completed quiz
- Navigate to "Patient Safety Protocols" quiz
- Click Take Quiz (loads existing response)
- Review mode displays
- Score shows 100% (4 of 4 correct)
- Completion date visible
- All questions show "Correct!" indicator
- Previous button disabled on first question
- Next button disabled on last question
- Can navigate through all questions

**Test Data:**
- Pre-seeded completed response
- User: nurse.emily.davis@gazzola.dev

**Related Test IDs:** `quiz-review-*`

---

### 15. Review mode with incorrect answers

**File:** `e2e/quiz-taking.spec.ts`
**Command:** `npm run test:e2e:quiz-taking`

**Pass Conditions:**
- Sign in as user with 75% score
- Navigate to quiz with incorrect answer
- Review mode shows 75% (3 of 4 correct)
- Navigate to incorrect question
- "Incorrect" indicator displayed
- Both "Your Answer" and "Correct Answer" labels shown
- User can see what they answered vs correct answer

**Test Data:**
- Pre-seeded response with 1 incorrect answer
- User: admin.michael.brown@gazzola.dev

**Related Test IDs:** `quiz-review-result-indicator`, `quiz-review-your-answer-label`, `quiz-review-correct-answer-label`

---

## Test Execution

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test Suites
```bash
npm run test:e2e:auth           # Authentication tests
npm run test:e2e:dash           # Dashboard tests
npm run test:e2e:quiz-workflow  # Quiz workflow tests
npm run test:e2e:quiz-taking    # Quiz taking tests
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:auth:headed
npm run test:e2e:dash:headed
npm run test:e2e:quiz-workflow:headed
npm run test:e2e:quiz-taking:headed
```

### Trace Mode (Full Debugging)
```bash
npm run test:e2e:auth:trace
npm run test:e2e:dash:trace
npm run test:e2e:quiz-workflow:trace
npm run test:e2e:quiz-taking:trace
```

## Test Reports

After test runs, comprehensive reports are generated in `test-results/{TEST_RUN_ID}/README.md` with:
- Test summary statistics
- Failed test diagnostics
- Screenshots (automatically captured on failure)
- Trace files for debugging
- Console logs and network failures
- Diagnostic data from custom fixtures

Use the test report generator to create consolidated reports:
```bash
npm run test:report
```

Clean up old test results:
```bash
npm run test:report:cleanup
```

## Test Data Management

All tests use pre-seeded data from `prisma/seed.ts`:
- Test users with various roles (admin, instructor, student)
- Test organizations
- Sample quizzes with questions
- Pre-completed quiz responses

Tests that create new data (like quiz-workflow tests) use timestamped identifiers to avoid conflicts.

## Test Configuration

Tests are configured with:
- **Workers:** 1 (sequential execution for database consistency)
- **Timeout:** 20 seconds for most operations
- **Retries:** Configured in `playwright.config.ts`
- **Custom Fixtures:** Enhanced diagnostics for console logs, network failures, and page errors

## Core Testing Rules

1. **Synchronize test changes with documentation** - Update Tests.md when tests change
2. **Always prefer data attributes** - Use `data-testid` attributes, never CSS selectors
3. **Share test IDs** - All test IDs defined in `test.types.ts`
4. **20-second timeout standard** - All operations should complete within 20s
5. **Descriptive test names** - Start with "should" and describe expected behavior
6. **Automatic screenshots** - Never take manual screenshots (automatic on failure)
7. **Fail immediately** - Tests fail on first assertion failure
8. **Minimum workers** - Use `workers: 1` for tests requiring database consistency

---

**Last Updated:** 2025-11-24
**Total Tests:** 19
**Version:** 1.0.0
