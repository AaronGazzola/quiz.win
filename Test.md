# Test Documentation

## Run All Tests

**Command:** `npm run test:all`
✓ Runs the complete test suite including all unit, integration, and e2e tests

**Command:** `npm run test`
✓ Runs unit and integration tests only (Jest)

**Command:** `npm run test:e2e`
✓ Runs end-to-end tests only (Playwright)

## Test Index

1. [Role Utility Tests](#1-role-utility-tests) - `npm run test -- __tests__/lib/role.utils.test.ts`
2. [Organization API Tests](#2-organization-api-tests) - `npm run test -- __tests__/auth/organization.test.ts`
3. [Permission System Tests](#3-permission-system-tests) - `npm run test -- __tests__/auth/permissions.test.ts`
4. [Dual-Table Component Tests](#4-dual-table-component-tests) - `npm run test -- __tests__/pages/dual-table.test.ts`
5. [End-to-End Page Tests (Jest)](#5-end-to-end-page-tests-jest) - `npm run test -- __tests__/e2e/existing-pages.test.ts`
6. [Organization Role Access Stress Tests](#6-organization-role-access-stress-tests) - `npm run test:stress`
7. [REAL DATABASE Security Audit Tests](#7-real-database-security-audit-tests) - `npm run test:real-security`
8. [Authentication E2E Tests (Playwright)](#8-authentication-e2e-tests-playwright) - `npm run test:e2e:auth`

## 1. Role Utility Tests

**File:** `__tests__/lib/role.utils.test.ts`
**Command:** `npm run test -- __tests__/lib/role.utils.test.ts`

### isAdmin Function

- should return true when user has admin role in any organization
  ✓ Validates admin role detection across organizations

- should return false when user has no admin roles
  ✓ Validates non-admin users are correctly identified

- should return false when user is null
  ✓ Validates null safety for authentication checks

- should return false when user has no members
  ✓ Validates users without organization membership

### isSuperAdmin Function

- should return true when user has super-admin role
  ✓ Validates super admin role detection

- should return false when user does not have super-admin role
  ✓ Validates regular users are not identified as super admin

- should return false when user is null
  ✓ Validates null safety for super admin checks

### isOrgAdminClient Function

- should return true when user is admin of specific organization
  ✓ Validates organization-specific admin role detection

- should return true when user is owner of specific organization
  ✓ Validates organization owners have admin privileges

- should return false when user is not admin of specific organization
  ✓ Validates non-admin members are correctly identified

- should return false when user is null
  ✓ Validates null safety for organization admin checks

### canInviteUsers Function

- should return true for super admin
  ✓ Validates super admins can invite users

- should return true for organization admin
  ✓ Validates organization admins can invite users

- should return false for regular user
  ✓ Validates regular users cannot invite users

- should return false when user is null
  ✓ Validates null safety for invitation permissions

## 2. Organization API Tests

**File:** `__tests__/auth/organization.test.ts`
**Command:** `npm run test -- __tests__/auth/organization.test.ts`

### getOrganizationsAction

- should return error when user is not authenticated
  ✓ Validates authentication requirement for organization access

- should return all organizations for super admin
  ✓ Validates super admins can access all organizations

- should return admin organizations for regular admin
  ✓ Validates organization admins only see their organizations

### createOrganizationAction

- should return error when user is not authenticated
  ✓ Validates authentication requirement for organization creation

- should return error when user is not super admin
  ✓ Validates only super admins can create organizations

- should create organization successfully for super admin
  ✓ Validates successful organization creation by super admin

- should handle organization creation errors
  ✓ Validates error handling in organization creation

## 3. Permission System Tests

**File:** `__tests__/auth/permissions.test.ts`
**Command:** `npm run test -- __tests__/auth/permissions.test.ts`

### getOrgScopedData Function

- should return data when user has permission
  ✓ Validates authorized data access returns expected results

- should throw error when user lacks permission
  ✓ Validates unauthorized access is properly blocked

- should handle permission check errors
  ✓ Validates error handling in permission validation

### getUserMemberOrganizations Function

- should return user member organizations
  ✓ Validates retrieval of user's organization memberships

- should handle errors in fetching member organizations
  ✓ Validates error handling for organization retrieval

### getUserAdminOrganizations Function

- should return user admin organizations
  ✓ Validates retrieval of user's admin organizations

- should handle errors in fetching admin organizations
  ✓ Validates error handling for admin organization retrieval

### Permission Boundary Testing

- should handle create permission for quiz
  ✓ Validates quiz creation permissions

- should handle read permission for question
  ✓ Validates question read permissions

- should handle delete permission for response
  ✓ Validates response deletion permissions

- should handle invite permission for user
  ✓ Validates user invitation permissions

- should deny unauthorized access to all resources
  ✓ Validates permission boundaries are enforced across all resources

## 4. Dual-Table Component Tests

**File:** `__tests__/pages/dual-table.test.ts`
**Command:** `npm run test -- __tests__/pages/dual-table.test.ts`

### Quiz Table

- should display quizzes in the top table
  ✓ Validates quiz data is rendered correctly

- should display organization filter when multiple organizations
  ✓ Validates organization filtering interface

- should show radio buttons for quiz selection
  ✓ Validates quiz selection mechanism

- should allow selecting a quiz with radio button
  ✓ Validates quiz selection functionality

### Responses Table

- should not show responses table initially
  ✓ Validates responses table is hidden by default

- should show responses table when quiz is selected and user is admin
  ✓ Validates admin users can view responses after quiz selection

- should not show responses table for non-admin users
  ✓ Validates response access is restricted to admins

- should show responses table for super admin
  ✓ Validates super admins can always view responses

### Data Isolation

- should only show quizzes from user's organizations
  ✓ Validates organization-scoped data filtering

- should filter responses by organization admin permissions
  ✓ Validates response access respects organization permissions

### Permission Validation

- should show create button for admin users
  ✓ Validates admin interface elements are visible

- should not show create button for member users
  ✓ Validates member interface restrictions

- should show bulk operations for admin users
  ✓ Validates admin bulk operation access

## 5. End-to-End Page Tests

**File:** `__tests__/e2e/existing-pages.test.ts`
**Command:** `npm run test:e2e`

### Dashboard Pages - Role-Based Access

- Dashboard page should load correctly for all user types
  ✓ Validates dashboard accessibility across user roles

- User Management page should be admin-only
  ✓ Validates admin-only page access restrictions

- Invite page should be admin-only
  ✓ Validates invitation page access control

- Quizzes page dual-table functionality
  ✓ Validates integrated quiz/response management interface

- Role badges display correctly
  ✓ Validates role badge visual components

- Breadcrumb navigation shows organization context
  ✓ Validates organization context in navigation

### Permission Boundaries

- Data isolation between organizations
  ✓ Validates data is properly scoped to user's organizations

- Unauthorized access redirects properly
  ✓ Validates security redirects for unauthorized access

## 6. Organization Role Access Stress Tests

**File:** `__tests__/stress/organization-role-access.test.ts`
**Command:** `npm run test:stress`

### Comprehensive Access Matrix Testing

- Tests every interaction type for every user role across all database tables
- Verifies 800+ individual access scenarios
- Ensures complete security boundary enforcement

### Auth Schema Protection (8 tables × 5 operations × 5 user roles = 200 tests)

- should block all operations on User table for all user types
  ✓ Validates auth schema is completely inaccessible
- should block all operations on Session table for all user types
  ✓ Validates session data protection
- should block all operations on Account table for all user types
  ✓ Validates account data protection
- should block all operations on Verification table for all user types
  ✓ Validates verification token protection
- should block all operations on MagicLink table for all user types
  ✓ Validates magic link protection
- should block all operations on Organization table for all user types
  ✓ Validates organization management protection
- should block all operations on Member table for all user types
  ✓ Validates membership data protection
- should block all operations on Invitation table for all user types
  ✓ Validates invitation system protection

### Quiz Table Access (4 operations × 7 scenarios = 28 tests)

- should allow super admin to create/read/update/delete quizzes in any organization
  ✓ Validates super admin has full access across organizations
- should allow organization admin to manage quizzes in their organization
  ✓ Validates admin can manage organizational content
- should allow organization member to read quizzes from their organization
  ✓ Validates members can view organizational content
- should block organization member from creating/updating/deleting quizzes
  ✓ Validates write operations restricted to admins
- should block cross-organization access for all user types
  ✓ Validates organization data isolation
- should block unaffiliated users from accessing any quizzes
  ✓ Validates access requires organization membership
- should block unauthenticated users from all quiz operations
  ✓ Validates authentication requirement

### Question Table Access (4 operations × 6 scenarios = 24 tests)

- should allow super admin to manage questions for any quiz
  ✓ Validates super admin question management
- should allow organization admin to manage questions in their organization
  ✓ Validates admin question management within organization
- should allow organization member to read questions from organization quizzes
  ✓ Validates member question viewing rights
- should block organization member from creating/updating/deleting questions
  ✓ Validates question modification restricted to admins
- should block cross-organization question access
  ✓ Validates question data isolation
- should block unauthenticated access to questions
  ✓ Validates question access requires authentication

### Response Table Access (4 operations × 12 scenarios = 48 tests)

**Own Response Management:**
- should allow users to create/read/update/delete their own responses
  ✓ Validates users control their own data
- should block users from managing other users' responses
  ✓ Validates response data privacy

**Admin Response Access:**
- should allow organization admin to read/update/delete responses from their organization quizzes
  ✓ Validates admin oversight of organizational quiz responses
- should allow super admin to manage all responses
  ✓ Validates super admin has full response access
- should block admin from accessing responses from other organizations
  ✓ Validates admin access limited to their organization

**Cross-Organization Response Security:**
- should block users from accessing responses from different organization quizzes
  ✓ Validates response data isolation between organizations
- should block unauthenticated access to all responses
  ✓ Validates response access requires authentication

### Profile Table Access (4 operations × 4 scenarios = 16 tests)

- should allow users to manage their own profile
  ✓ Validates user profile self-management
- should block users from accessing other users' profiles
  ✓ Validates profile privacy between users
- should allow super admin to access any profile
  ✓ Validates super admin profile management capabilities
- should block unauthenticated access to profiles
  ✓ Validates profile access requires authentication

### Cross-Organization Security Boundaries (15 tests)

- should prevent data leakage between organizations in quiz queries
  ✓ Validates organization data isolation
- should prevent admin from one org accessing data from another org
  ✓ Validates admin permissions are organization-scoped
- should prevent cross-organization response access
  ✓ Validates response data cannot leak between organizations
- should enforce consistent security across all table operations
  ✓ Validates security boundaries are uniformly applied

### Unauthenticated Access Testing (4 tables × 5 operations = 20 tests)

- should block all operations on all public schema tables for unauthenticated users
  ✓ Validates authentication requirement for all operations

### Performance and Scale Testing (2 tests)

- should handle large query operations efficiently (< 5 seconds for 1000 records)
  ✓ Validates system performance under load
- should handle concurrent access attempts (10 simultaneous operations)
  ✓ Validates system stability under concurrent load

### User Role Matrix

| User Role | Auth Schema | Quiz/Question | Profile | Response (Own) | Response (Others) |
|-----------|-------------|---------------|---------|----------------|-------------------|
| Super Admin | ❌ Blocked | ✅ Full CRUD | ✅ Full Access | ✅ Full CRUD | ✅ Full CRUD |
| Org Admin | ❌ Blocked | ✅ Full CRUD (org) | ✅ Own Only | ✅ Full CRUD | ✅ Read/Delete (org) |
| Org Member | ❌ Blocked | ✅ Read Only (org) | ✅ Own Only | ✅ Full CRUD | ❌ Blocked |
| Different Org | ❌ Blocked | ❌ Blocked | ✅ Own Only | ✅ Full CRUD | ❌ Blocked |
| Unauthenticated | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |

## 7. 🔥 Comprehensive CRUD Permission Stress Tests

**File:** `__tests__/stress/comprehensive-crud-permissions.test.ts`
**Command:** `npm run test:crud-stress`

### Test Overview

This comprehensive stress test validates the complete permission matrix by performing **ALL CRUD operations** for **EVERY user role** against **EVERY database table**. The test ensures that:
- ✅ **Allowed operations succeed** for authorized users
- ❌ **Prohibited operations fail** for unauthorized users
- 🔒 **Data isolation** is maintained between organizations
- 👤 **User context** is properly enforced in all scenarios

### User Context Matrix

| User Role | Organization A | Organization B | Global Access |
|-----------|----------------|----------------|---------------|
| **Super Admin** | Full CRUD | Full CRUD | All organizations |
| **Org A Admin** | Full CRUD | No Access | Organization A only |
| **Org A Member** | Read Only | No Access | Organization A only |
| **Org B Admin** | No Access | Full CRUD | Organization B only |
| **Org B Member** | No Access | Read Only | Organization B only |
| **Unaffiliated User** | No Access | No Access | Own data only |
| **Unauthenticated** | No Access | No Access | No access |

### Table Access Control Matrix

#### 🚫 Auth Schema Tables (Should be COMPLETELY INACCESSIBLE)
**Tables:** `user`, `session`, `account`, `verification`, `magicLink`, `organization`, `member`, `invitation`

- **All User Roles + All Operations**: ❌ **MUST FAIL**
  ✓ Validates auth schema is protected from application-level access
  ✓ Ensures sensitive authentication data cannot be manipulated directly

#### 📝 Quiz Table (Organization-Scoped CRUD)

**Super Admin:**
- **Create/Read/Update/Delete** across all organizations: ✅ **MUST SUCCEED**
  ✓ Validates super admin has unrestricted quiz management

**Organization Admin (Own Org):**
- **Create**: ✅ **MUST SUCCEED** - Can create quizzes in their organization
- **Read**: ✅ **MUST SUCCEED** - Can view all organization quizzes
- **Update**: ✅ **MUST SUCCEED** - Can modify organization quizzes
- **Delete**: ✅ **MUST SUCCEED** - Can remove organization quizzes

**Organization Admin (Other Org):**
- **Create/Read/Update/Delete**: ❌ **MUST FAIL** - Cannot access other organization data
  ✓ Validates cross-organization data isolation

**Organization Member (Own Org):**
- **Create**: ❌ **MUST FAIL** - Members cannot create quizzes
- **Read**: ✅ **MUST SUCCEED** - Members can view organization quizzes
- **Update**: ❌ **MUST FAIL** - Members cannot modify quizzes
- **Delete**: ❌ **MUST FAIL** - Members cannot delete quizzes

**Organization Member (Other Org):**
- **Create/Read/Update/Delete**: ❌ **MUST FAIL** - No cross-organization access
  ✓ Validates organization membership enforcement

**Unaffiliated User:**
- **Create/Read/Update/Delete**: ❌ **MUST FAIL** - No organization access
  ✓ Validates organization membership requirement

**Unauthenticated:**
- **Create/Read/Update/Delete**: ❌ **MUST FAIL** - No access without authentication
  ✓ Validates authentication requirement

#### ❓ Question Table (Organization-Scoped via Quiz Relationship)

**Access Pattern:** Same as Quiz table since questions belong to quizzes
- Questions inherit organization scope from their parent quiz
- Same permission matrix as Quiz table applies

#### 📊 Response Table (User + Organization-Scoped)

**Super Admin:**
- **Create/Read/Update/Delete**: ✅ **MUST SUCCEED** for all responses
  ✓ Validates super admin has complete response management

**Organization Admin:**
- **Create Response (Own)**: ✅ **MUST SUCCEED** - Can create their own responses
- **Read Responses (Org Quizzes)**: ✅ **MUST SUCCEED** - Can view all org responses for oversight
- **Update/Delete (Own)**: ✅ **MUST SUCCEED** - Can manage their own responses
- **Update/Delete (Others in Org)**: ✅ **MUST SUCCEED** - Can moderate org responses
- **Create/Read/Update/Delete (Other Orgs)**: ❌ **MUST FAIL** - No cross-org access

**Organization Member:**
- **Create Response (Own, Org Quizzes)**: ✅ **MUST SUCCEED** - Can respond to org quizzes
- **Read Response (Own)**: ✅ **MUST SUCCEED** - Can view their own responses
- **Update/Delete (Own)**: ✅ **MUST SUCCEED** - Can manage their own responses
- **Read/Update/Delete (Others)**: ❌ **MUST FAIL** - Cannot access other users' responses
- **Any Operation (Other Orgs)**: ❌ **MUST FAIL** - No cross-org access

**Unaffiliated User:**
- **Create/Read/Update/Delete (Own)**: ✅ **MUST SUCCEED** for their existing responses
- **Create (New)**: ❌ **MUST FAIL** - Cannot create responses without org membership
- **Any Operation (Others)**: ❌ **MUST FAIL** - Cannot access other users' data

#### 👤 Profile Table (User-Scoped)

**Super Admin:**
- **Create/Read/Update/Delete**: ✅ **MUST SUCCEED** for all profiles
  ✓ Validates super admin user management capabilities

**All Other Users:**
- **Create/Read/Update/Delete (Own)**: ✅ **MUST SUCCEED** - Users manage their own profiles
- **Any Operation (Others)**: ❌ **MUST FAIL** - Cannot access other users' profiles
  ✓ Validates profile privacy between users

### Stress Test Execution Pattern

For each combination of **[User Role] × [Table] × [CRUD Operation]**:

1. **Setup User Context**: Authenticate as the specific user role
2. **Attempt Operation**: Execute the CRUD operation with proper test data
3. **Validate Result**:
   - If operation should be **allowed**: Ensure it succeeds and returns expected data
   - If operation should be **prohibited**: Ensure it fails with proper authorization error
4. **Verify Data Integrity**: Confirm no unintended side effects or data leakage
5. **Test Cross-Organization Boundaries**: Validate data isolation between organizations

### Expected Test Metrics

- **Total Test Cases**: ~490 individual permission tests
  - 7 User Roles × 8 Tables × ~9 Operation Scenarios = 504 tests
  - Minus auth schema tests (should all fail) = ~448 meaningful permission tests
- **Auth Schema Protection**: 56 tests (7 roles × 8 auth tables × 1 operation) - All should FAIL
- **Organization Isolation**: 168 cross-org tests - All should FAIL appropriately
- **User Data Privacy**: 84 cross-user tests - All should FAIL appropriately
- **Valid Operations**: 182 authorized operations - All should SUCCEED

### Performance Requirements

- **Execution Time**: < 60 seconds for complete suite
- **Database Cleanup**: Automatic cleanup after each test to prevent pollution
- **Concurrent Safety**: Tests should be isolated and not interfere with each other
- **Error Reporting**: Clear distinction between expected failures (security working) and unexpected failures (bugs)

## 8. 🔥 REAL DATABASE Security Audit Tests

**File:** `__tests__/stress/real-organization-role-access.test.ts`
**Command:** `npm run test:real-security`

### 🚨 AUTH SCHEMA PROTECTION TESTS

- should block direct access to user table for super admin
  ✓ Validates auth schema tables are completely inaccessible via direct Prisma queries
- should block direct access to session table for super admin
  ✓ Validates session data protection from direct access
- should block direct access to account table for super admin
  ✓ Validates account data protection from direct access
- should block direct access to verification table for super admin
  ✓ Validates verification token protection from direct access
- should block direct access to magicLink table for super admin
  ✓ Validates magic link protection from direct access
- should block direct access to organization table for super admin
  ✓ Validates organization management protection from direct access
- should block direct access to member table for super admin
  ✓ Validates membership data protection from direct access
- should block direct access to invitation table for super admin
  ✓ Validates invitation system protection from direct access
- should block getAuthenticatedClient from accessing auth schema tables
  ✓ Validates authenticated client properly blocks auth schema access

### 🔍 PUBLIC SCHEMA ACCESS CONTROL TESTS

**Quiz Table - Organization Scoped Access:**
- should allow super admin to access all quizzes
  ✓ Validates super admin can access quizzes across organizations
- should test cross-organization quiz access vulnerability
  ✓ Discovers if Row Level Security (RLS) policies are implemented
- should attempt to create quiz without permission validation
  ✓ Tests if quiz creation requires proper authorization checks

**Response Table - User Data Protection:**
- should test access to all user responses without filtering
  ✓ Discovers if user response data is globally accessible without context filtering
- should attempt to create response for another user
  ✓ Tests if users can create responses on behalf of other users

**Profile Table - Personal Data Protection:**
- should test access to all user profiles
  ✓ Discovers if personal profile data is globally accessible
- should attempt to modify another user profile
  ✓ Tests if users can modify other users' profile data

### 🔓 PERMISSION BYPASS TESTING

- should test if hasOrgPermission function actually restricts access
  ✓ Validates if permission checking functions are properly implemented
- should test if hasOrgRole function actually validates roles
  ✓ Validates if role checking functions are properly implemented

### 📊 REAL WORLD ATTACK SIMULATION

- should simulate complete organizational data breach
  ✓ Tests if malicious users can access all organizational data across boundaries
- should test bulk data modification attack
  ✓ Tests if bulk operations can be performed without proper authorization

### 📈 SECURITY VULNERABILITY SUMMARY

- should document all discovered vulnerabilities
  ✓ Provides comprehensive documentation of all security issues found during testing

### Expected Security Vulnerabilities

❌ **Critical Issues Discovered:**
1. hasOrgPermission() always returns true (TODO implementation)
2. hasOrgRole() always returns true (TODO implementation)
3. getAuthenticatedClient() returns unfiltered Prisma client
4. No Row Level Security (RLS) policies implemented
5. Cross-organization data access possible
6. Personal data (profiles, responses) exposed globally
7. Bulk operations possible without authorization
8. No user context validation in database operations
9. Auth schema tables directly accessible via Prisma
10. No audit logging of data access attempts

✅ **Required Security Implementations:**
1. Implement Row Level Security (RLS) policies in PostgreSQL
2. Complete hasOrgPermission() and hasOrgRole() implementations
3. Add user context filtering to getAuthenticatedClient()
4. Implement query-level access control middleware
5. Add organization membership validation to all operations
6. Restrict auth schema access completely
7. Add audit logging for all data access
8. Implement input validation and sanitization
9. Add rate limiting for bulk operations
10. Regular security audits and penetration testing

## 8. Authentication E2E Tests (Playwright)

**File:** `e2e/auth.spec.ts`
**Command:** `npm run test:e2e:auth`

### Authentication Flow

- should complete full authentication flow: sign in -> sign out
  ✓ Validates user authentication lifecycle using dev sign-in flow

**Pass Conditions:**
- Sign-in page loads successfully at /sign-in
- Dev user cards are visible on the page
- User can click on a dev user card to sign in
- User is redirected to dashboard (/) after sign in
- User avatar menu is visible in the navigation
- User can open the avatar menu dropdown
- Sign out button is visible in the dropdown menu
- User can click sign out button
- User is redirected to /sign-in after sign out

## Test Commands

To run specific test categories:

```bash
# All tests (Jest + Playwright)
npm run test:all

# Jest unit tests only
npm run test

# Playwright e2e tests only
npm run test:e2e

# Specific e2e test
npm run test:e2e:auth

# Role utility tests
npm run test -- __tests__/lib/role.utils.test.ts

# Organization API tests
npm run test -- __tests__/auth/organization.test.ts

# Permission system tests
npm run test -- __tests__/auth/permissions.test.ts

# Dual-table component tests
npm run test -- __tests__/pages/dual-table.test.ts

# End-to-end tests (Jest)
npm run test -- __tests__/e2e/existing-pages.test.ts

# Organization role access stress tests
npm run test:stress

# Comprehensive CRUD Permission Stress Tests
npm run test:crud-stress

# REAL DATABASE Security Audit Tests
npm run test:real-security

# Run all tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Specific test patterns
npm run test -- --testPathPattern=stress
npm run test -- --testNamePattern="Auth Schema"
npm run test -- --testNamePattern="Quiz Table"

# Playwright specific modes
npm run test:e2e:headed    # Run with visible browser
npm run test:e2e:trace     # Run with full trace for debugging
npm run test:e2e:debug     # Run in debug mode
```

## Test Environment Setup

### Prerequisites

- Node.js and npm installed
- PostgreSQL database connection configured
- Environment variables set up for testing

### Test Data

Tests use isolated test data with:
- 2 test organizations (Organization A, Organization B)
- 6 test users with different roles and affiliations
- Mock quiz, question, and response data
- Comprehensive permission matrices

### Running Tests

1. **Install dependencies:** `npm install`
2. **Generate Prisma client:** `npm run db:generate`
3. **Run all tests:** `npm run test`
4. **Run stress tests only:** `npm run test:stress`
5. **Run with coverage:** `npm run test:coverage`

### Debugging Tests

- Use `npm run test:watch` for development
- Add `--verbose` flag for detailed output
- Use `--testNamePattern="pattern"` to run specific test groups
- Check test logs for detailed error messages