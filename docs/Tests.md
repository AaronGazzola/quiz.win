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
