# Test Documentation

## Run All Tests

**Command:** `npm run test`
✓ Runs the complete test suite across all test files

## Test Index

1. [Role Utility Tests](#1-role-utility-tests) - `npm run test:role-utils`
2. [Organization API Tests](#2-organization-api-tests) - `npm run test:organization`
3. [Permission System Tests](#3-permission-system-tests) - `npm run test:permissions`
4. [Dual-Table Component Tests](#4-dual-table-component-tests) - `npm run test:dual-table`
5. [End-to-End Page Tests](#5-end-to-end-page-tests) - `npm run test:e2e`

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

- Organization switcher functionality
  ✓ Validates multi-organization user experience

- Breadcrumb navigation shows organization context
  ✓ Validates organization context in navigation

### Permission Boundaries

- Data isolation between organizations
  ✓ Validates data is properly scoped to user's organizations

- Unauthorized access redirects properly
  ✓ Validates security redirects for unauthorized access

## Test Commands

To run specific test categories:

```bash
# Role utility tests
npm run test -- __tests__/lib/role.utils.test.ts

# Organization API tests
npm run test -- __tests__/auth/organization.test.ts

# Permission system tests
npm run test -- __tests__/auth/permissions.test.ts

# Dual-table component tests
npm run test -- __tests__/pages/dual-table.test.ts

# End-to-end tests
npm run test:e2e

# Run all tests with coverage
npm run test -- --coverage

# Watch mode for development
npm run test -- --watch
```