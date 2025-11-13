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

1. [Authentication](#1-authentication-tests) - `npm run test:e2e:auth`
2. [Dashboard Role-Based Access](#2-dashboard-role-based-access-tests) - `npm run test:e2e:dashboard`

---

## 1. Authentication Tests

**File:** `e2e/auth.spec.ts`

**Commands:**
- Standard: `npm run test:e2e:auth`
- Headed mode: `npm run test:e2e:auth:headed`
- Trace mode: `npm run test:e2e:auth:trace`

### Test Cases

- should complete full authentication flow: sign in -> sign out
  ✓ User can sign in, see authenticated UI, sign out, and return to sign-in page

---

## 2. Dashboard Role-Based Access Tests

**File:** `e2e/dashboard.spec.ts`

**Commands:**
- Standard: `npm run test:e2e:dashboard`
- Headed mode: `npm run test:e2e:dashboard:headed`
- Trace mode: `npm run test:e2e:dashboard:trace`

### Test Cases

- should show admin dashboard for super admin with all metrics and responses
  ✓ Super admin sees all 4 metrics (Total Quizzes, Completed Today, Team Members, Active Invites)
  ✓ Super admin sees quizzes from all organizations (6 total)
  ✓ Super admin sees Responses column in quiz table
  ✓ Super admin can view responses table for any quiz

- should show admin dashboard for organization owner with org-specific data
  ✓ Organization owner (Dr. Sarah Chen) sees all 4 admin metrics
  ✓ Owner sees only HealthCare Partners quizzes (3 quizzes)
  ✓ Owner sees Responses column in quiz table
  ✓ Total quizzes metric displays correct count

- should show admin dashboard for organization admin
  ✓ Organization admin (Dr. James Wilson) sees all 4 admin metrics
  ✓ Admin sees Responses column in quiz table
  ✓ Admin can view all responses from organization members
  ✓ Admin can access response details

- should show member dashboard without admin features
  ✓ Member (Emily Davis) sees only basic metrics (Total Quizzes, Completed Today)
  ✓ Member does NOT see Team Members or Active Invites metrics
  ✓ Member does NOT see Responses column in quiz table
  ✓ Member sees quiz table with available quizzes
  ✓ When member selects a quiz, they see their own response (not admin responses table)

- should show correct UI based on selected organization for multi-org user
  ✓ Multi-org user (Alex Johnson: HC Admin, TC Member) signs in successfully
  ✓ Dashboard loads with appropriate metrics based on selected organization
  ✓ UI reflects current organization selection

- should display accurate quiz response data for member
  ✓ Member sees quiz table after signing in
  ✓ When selecting a quiz, member can view their own response
  ✓ User response section displays correctly

- should allow admin to view all member responses with search functionality
  ✓ Admin can select a quiz with responses
  ✓ Admin sees responses table with all member responses
  ✓ Admin has access to response search functionality
  ✓ Admin can click on individual responses to view details
  ✓ Response detail view displays correctly with question breakdown

### Test Data References

Based on `scripts/seed.ts`:

**HealthCare Partners Organization:**
- Dr. Sarah Chen (owner)
- Dr. James Wilson (admin)
- Nurse Emily Davis (member) - Has completed Patient Safety (100%) and HIPAA (100%)
- Admin Michael Brown (member) - Has completed Patient Safety (75%)
- Quizzes: Patient Safety Protocols (4 questions), HIPAA Compliance (3 questions), Medical Terminology (3 questions, inactive)

**TechCorp Solutions Organization:**
- John Smith (owner)
- Lisa Anderson (admin)
- David Martinez (member) - Has completed Cybersecurity (100%) and Agile (100%)
- Jennifer Taylor (member) - Has completed Cybersecurity (75%)
- Quizzes: Cybersecurity (4 questions), Agile Project Management (3 questions), SDLC (3 questions, inactive)

**Multi-Organization Users:**
- Alex Johnson (HC: Admin, TC: Member)

---

## Test Output Structure

Each test run creates a timestamped directory:

```
test-results/
└── YYYY-MM-DD_HHMMSS-mmm_testname/
    ├── README.md               # Human-readable test report
    ├── test-report.json        # Structured test data
    ├── artifacts/              # Screenshots, traces, videos
    │   ├── screenshot-1.png
    │   ├── trace.zip
    │   └── video.webm
    └── [other artifacts]
```

## Viewing Trace Files

To view trace files interactively:

```bash
npx playwright show-trace test-results/YYYY-MM-DD_HHMMSS-mmm_testname/artifacts/trace.zip
```

## Test Reports

Consolidated test reports are generated in:

```
docs/test-reports/
└── YYYY-MM-DD_HHMMSS-mmm.md
```

The report includes:
- Overall test statistics
- Test status overview
- Individual test results
- Links to test result directories
