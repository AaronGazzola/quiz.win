# Test Documentation

## Run All Tests

**Command:** `npm run test:e2e`

Runs all end-to-end tests using Playwright

## Test Reports

**Generate Report:** `npm run test:report`

Generates a consolidated test report from the latest test results

**Generate Report with Cleanup:** `npm run test:report:cleanup`

Generates report and removes old test result directories (keeps only latest per suite)

## Test Index

1. [Authentication](e2e/auth.spec.ts) - `npm run test:e2e:auth`
2. [Dashboard Role-Based Access](e2e/dashboard.spec.ts) - `npm run test:e2e:dash`
3. [Quiz Workflow](e2e/quiz-workflow.spec.ts) - `npm run test:e2e:quiz-workflow`

---

## 1. Authentication Tests

**File:** `e2e/auth.spec.ts`

**Commands:**
- Standard: `npm run test:e2e:auth`
- Headed mode: `npm run test:e2e:auth:headed`
- Trace mode: `npm run test:e2e:auth:trace`

### Test Cases

- should complete full authentication flow: sign in -> sign out
  - User can sign in, see authenticated UI, sign out, and return to sign-in page

---

## 2. Dashboard Role-Based Access Tests

**File:** `e2e/dashboard.spec.ts`

**Commands:**
- Standard: `npm run test:e2e:dash`
- Headed mode: `npm run test:e2e:dash:headed`
- Trace mode: `npm run test:e2e:dash:trace`

### Test Cases

- should show admin dashboard for super admin with all metrics and responses
  - Super admin sees all 4 metrics (Total Quizzes, Completed Today, Team Members, Active Invites)
  - Super admin sees quizzes from all organizations
  - Super admin sees Responses column in quiz table

- should show admin dashboard for organization owner with org-specific data
  - Organization owner sees all 4 admin metrics
  - Owner sees only their organization's quizzes
  - Owner sees Responses column in quiz table

- should show admin dashboard for organization admin
  - Organization admin sees all 4 admin metrics
  - Admin sees Responses column in quiz table
  - Admin can view all responses from organization members

- should show member dashboard without admin features
  - Member sees only basic metrics (Total Quizzes, Completed Today)
  - Member does NOT see Team Members or Active Invites metrics
  - Member does NOT see Responses column in quiz table

- should show correct UI based on selected organization for multi-org user
  - Multi-org user signs in successfully
  - Dashboard loads with appropriate metrics based on selected organization

- should display accurate quiz response data for member
  - Member sees quiz table after signing in
  - When selecting a quiz, member can view their own response

- should allow admin to view all member responses with search functionality
  - Admin can select a quiz with responses
  - Admin sees responses table with all member responses
  - Admin has access to response search functionality

- should switch organizations and display organization-specific data for super admin
  - Super admin can switch between organizations
  - Dashboard reloads with organization-specific data
  - Quiz count updates to show only selected organization's quizzes

- should switch organizations and respect role-based permissions for multi-org member
  - User's permissions change based on role in each organization
  - Admin features appear/disappear based on role

- should enforce complete data isolation between organizations
  - Users cannot see data from organizations they don't belong to

- should show only organization-specific quizzes for org owners
  - Owner sees only their organization's quizzes

### Test Data References

Based on `prisma/seed.ts`:

**HealthCare Partners Organization:**
- Dr. Sarah Chen (owner)
- Dr. James Wilson (admin)
- Nurse Emily Davis (member)
- Admin Michael Brown (member)

**TechCorp Solutions Organization:**
- John Smith (owner)
- Lisa Anderson (admin)
- David Martinez (member)
- Jennifer Taylor (member)

**Multi-Organization Users:**
- superadmin@gazzola.dev (Super Admin - has access to all organizations)
- alex.johnson@gazzola.dev (HealthCare Partners: Admin, TechCorp Solutions: Member)

---

## 3. Quiz Workflow Tests

**File:** `e2e/quiz-workflow.spec.ts`

**Commands:**
- Standard: `npm run test:e2e:quiz-workflow`
- Headed mode: `npm run test:e2e:quiz-workflow:headed`
- Trace mode: `npm run test:e2e:quiz-workflow:trace`

### Test Cases

- should complete full quiz workflow: creation -> taking -> viewing results
  - Admin creates a new quiz
  - User takes the quiz
  - Results are displayed correctly

- should handle incorrect answers correctly in review mode
  - User answers questions incorrectly
  - Review mode shows proper incorrect/correct indicators

---

## Test Output Structure

Each test run creates a timestamped directory:

```
test-results/
└── YYYY-MM-DD_HH-MM-SS-mmm_testname/
    ├── README.md
    ├── test-report.json
    └── artifacts/
        ├── screenshot-1.png
        ├── trace.zip
        └── video.webm
```

## Viewing Trace Files

To view trace files interactively:

```bash
npx playwright show-trace test-results/YYYY-MM-DD_HH-MM-SS-mmm_testname/artifacts/trace.zip
```

## Test Reports

Consolidated test reports are generated in:

```
docs/test-reports/
└── YYYY-MM-DD_HH-MM-SS-mmm.md
```

The report includes:
- Overall test statistics
- Test status overview
- Individual test results
- Links to test result directories
