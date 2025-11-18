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
3. [Quiz Taking and Review](#3-quiz-taking-and-review-tests) - `npm run test:e2e:quiz-taking`

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

## 3. Quiz Taking and Review Tests

**File:** `e2e/quiz-taking.spec.ts`

**Commands:**
- Standard: `npm run test:e2e:quiz-taking`
- Headed mode: `npm run test:e2e:quiz-taking:headed`
- Trace mode: `npm run test:e2e:quiz-taking:trace`

### Test Cases

- should complete quiz and verify submission with correct answers
  ✓ User signs in as nurse.emily.davis@gazzola.dev
  ✓ User navigates to dashboard and selects HIPAA Compliance quiz
  ✓ User clicks "Take Quiz" button
  ✓ Quiz taking page loads with all UI elements (title, progress bar, question counter)
  ✓ User answers Question 1 correctly and counter updates to "1 of 3 answered"
  ✓ User navigates to Question 2 using Next button
  ✓ User answers Question 2 correctly
  ✓ User navigates to Question 3 using question nav dots
  ✓ User answers Question 3 correctly and counter shows "3 of 3 answered"
  ✓ Previous button navigation works correctly
  ✓ Submit button appears on last question when all questions answered
  ✓ Submit button is enabled and clickable
  ✓ Quiz submits successfully
  ✓ User is redirected to review mode
  ✓ Review mode displays 100% score

- should display correct review mode with accurate answer indicators matching seed data
  ✓ User signs in as nurse.emily.davis@gazzola.dev
  ✓ User selects Patient Safety Protocols quiz (already completed)
  ✓ Review mode loads automatically (existing response detected)
  ✓ Title displays "Patient Safety Protocols - Review"
  ✓ Score displays 100% (4 of 4 correct)
  ✓ Completion date is displayed with timestamp
  ✓ Question 1 shows correct answer indicator with green checkmark
  ✓ Answer matches seed data: "Check the patient wristband with two identifiers"
  ✓ "Your answer" label is visible on selected answer
  ✓ Question 2 shows correct answer indicator
  ✓ Answer matches seed data: "Before and after patient contact"
  ✓ Question 3 navigation via nav dots works correctly
  ✓ Answer matches seed data: "Report it immediately to the supervising physician"
  ✓ Question 4 shows correct answer indicator
  ✓ Answer matches seed data: "On admission and with any change in condition"
  ✓ All question nav dots display green (indicating all correct)
  ✓ Previous button works in review mode
  ✓ Previous button is disabled on Question 1
  ✓ Next button is disabled on Question 4 (last question)
  ✓ Back to Dashboard button navigates correctly

- should display incorrect answers correctly in review mode
  ✓ User signs in as admin.michael.brown@gazzola.dev (has 75% score)
  ✓ User selects Patient Safety Protocols quiz
  ✓ Review mode shows 75% score (3 of 4 correct)
  ✓ User navigates to Question 2 (the incorrect answer)
  ✓ Question text matches seed data: "How often should hand hygiene be performed?"
  ✓ Result indicator shows "Incorrect" with red X icon
  ✓ "Your answer" label shows user's incorrect selection: "Once per hour"
  ✓ "Correct answer" label shows the right answer: "Before and after patient contact"
  ✓ Both user answer (red border) and correct answer (green border) are visually distinct
  ✓ Other questions show correct indicators (Questions 1, 3, 4)
  ✓ Nav dots reflect status: 3 green (correct), 1 red (incorrect)

### Test Data References

Based on `prisma/seed.ts`:

**Patient Safety Protocols Quiz (HealthCare Partners):**
- 4 questions (lines 346-390)
- Question 1: "What is the first step in patient identification?"
  - Correct: "Check the patient wristband with two identifiers"
- Question 2: "How often should hand hygiene be performed?"
  - Correct: "Before and after patient contact"
- Question 3: "What should you do if you witness a medication error?"
  - Correct: "Report it immediately to the supervising physician"
- Question 4: "When should fall risk assessments be conducted?"
  - Correct: "On admission and with any change in condition"

**HIPAA Compliance Fundamentals Quiz (HealthCare Partners):**
- 3 questions (lines 394-431)
- Question 1: "What does HIPAA stand for?"
  - Correct: "Health Insurance Portability and Accountability Act"
- Question 2: "What is Protected Health Information (PHI)?"
  - Correct: "Any health information that can identify an individual"
- Question 3: "When can PHI be disclosed without patient authorization?"
  - Correct: "For treatment, payment, and healthcare operations"

**Test Users:**
- nurse.emily.davis@gazzola.dev:
  - Completed Patient Safety Protocols with 100% (4/4 correct) on 2024-01-15
  - Completed HIPAA Compliance with 100% (3/3 correct) on 2024-01-20
- admin.michael.brown@gazzola.dev:
  - Completed Patient Safety Protocols with 75% (3/4 correct) on 2024-01-16
  - Incorrect answer on Question 2 (answered "Once per hour" instead of "Before and after patient contact")

### Navigation Testing

**Quiz Taking Mode:**
- Previous button: Disabled on first question, navigates backward on others
- Next button: Enabled until last question, navigates forward
- Question nav dots: Shows answered state (green), current question (primary color), unanswered (gray)
- Submit button: Only appears on last question when all questions answered
- Progress bar: Updates based on current question number

**Review Mode:**
- Previous button: Disabled on first question
- Next button: Disabled on last question
- Question nav dots: Green (correct), red (incorrect), primary (current)
- Back to Dashboard button: Returns to home page

### Answer Validation

All answer indicators are validated against seed data:
- Correct answers show green checkmark icon
- Incorrect answers show red X icon
- User's selected answer is marked with "Your answer" label
- Correct answer (when different from user's) is marked with "Correct answer" label
- Visual styling: Green border/background for correct, red border/background for incorrect

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
