# Test Documentation

## Run All Tests

**Command:** `npm run test:e2e`
- Runs the complete test suite across all test files

## Test Index

1. [Authentication](#1-authentication-tests) - `npm run test:e2e:auth`
2. [Dashboard Role-Based Access](#2-dashboard-role-based-access-tests) - `npm run test:e2e:dash`
3. [Quiz Workflow](#3-quiz-workflow-tests) - `npm run test:e2e:quiz-workflow`
4. [Gamification](#4-gamification-tests) - `npm run test:e2e:game`

---

## 1. Authentication Tests

**File:** `e2e/auth.spec.ts`
**Command:** `npm run test:e2e:auth`

### Sign Up Flow

- should allow new user to sign up and access dashboard
  - Validates user can create account with name, email, password
  - Validates redirect to dashboard after successful sign up

### Sign In Flow

- should allow existing user to sign in
  - Validates user can sign in with email and password
  - Validates redirect to dashboard after successful sign in

### Sign Out Flow

- should allow user to sign out
  - Validates user can sign out via avatar menu
  - Validates redirect to auth page after sign out

---

## 2. Dashboard Role-Based Access Tests

**File:** `e2e/dashboard.spec.ts`
**Command:** `npm run test:e2e:dash`

### Super Admin Access

- should show all metrics and data for super admin
  - Validates all 4 metric cards visible
  - Validates quiz table with responses column
  - Validates organization selector available

### Org Owner Access

- should show all org metrics for organization owner
  - Validates all 4 metric cards visible
  - Validates quiz table with responses for own organization

### Org Admin Access

- should show all org metrics for organization admin
  - Validates all 4 metric cards visible
  - Validates quiz table with responses column

### Org Member Access

- should show limited metrics for organization member
  - Validates only 2 metric cards visible (Total Quizzes, Completed Today)
  - Validates quiz table without responses column
  - Validates user can only see their own responses

### Multi-Organization User

- should allow user to switch between organizations
  - Validates organization switcher functionality
  - Validates data changes when switching organizations

---

## 3. Quiz Workflow Tests

**File:** `e2e/quiz-workflow.spec.ts`
**Command:** `npm run test:e2e:quiz-workflow`

### Full Quiz Workflow

- should complete full quiz workflow: creation -> taking -> viewing results
  - Validates quiz creation with title, description, questions
  - Validates quiz taking with progress tracking
  - Validates 100% score display in review mode
  - Validates navigation through questions in review mode

### Mixed Answers Review

- should handle incorrect answers correctly in review mode
  - Validates quiz completion with mixed correct/incorrect answers
  - Validates 50% score display
  - Validates correct and incorrect indicators shown

---

## 4. Gamification Tests

**File:** `e2e/gamification.spec.ts`
**Command:** `npm run test:e2e:game`

### Gamification Workflow Test

- should update gamification data and leaderboard after quiz completion by two users
  - User 1 completes quiz with 100% score and earns ~90 points
  - User 1's stats show 1 quiz completed, 1 perfect score, 100% average
  - User 2 completes same quiz with 50% score and earns ~35 points
  - User 2's stats show 1 quiz completed, 0 perfect scores, 50% average
  - Leaderboard shows User 1 ranked above User 2
