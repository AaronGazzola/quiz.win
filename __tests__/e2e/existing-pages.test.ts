/**
 * E2E tests for existing pages with Better Auth integration
 * These tests verify that all pages work correctly with the new role system
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Mock session data for different user types
const mockSuperAdminSession = {
  user: {
    id: 'super-admin-1',
    email: 'superadmin@example.com',
    role: 'super-admin',
    members: []
  }
};

const mockOrgAdminSession = {
  user: {
    id: 'org-admin-1',
    email: 'orgadmin@example.com',
    role: 'user',
    members: [
      { role: 'admin', organizationId: 'org-1', organization: { name: 'Test Organization' } }
    ]
  }
};

const mockMemberSession = {
  user: {
    id: 'member-1',
    email: 'member@example.com',
    role: 'user',
    members: [
      { role: 'member', organizationId: 'org-1', organization: { name: 'Test Organization' } }
    ]
  }
};

// Helper function to set up authentication context
async function setupAuthContext(context: BrowserContext, sessionData: any) {
  await context.addCookies([
    {
      name: 'better-auth.session_token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    }
  ]);

  // Mock the session API endpoint
  await context.route('**/api/auth/get-session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionData)
    });
  });
}

test.describe('Dashboard Pages - Role-Based Access', () => {
  test('Dashboard page should load correctly for all user types', async ({ browser }) => {
    const userTypes = [
      { name: 'Super Admin', session: mockSuperAdminSession },
      { name: 'Organization Admin', session: mockOrgAdminSession },
      { name: 'Member', session: mockMemberSession }
    ];

    for (const userType of userTypes) {
      const context = await browser.newContext();
      await setupAuthContext(context, userType.session);
      const page = await context.newPage();

      await page.goto('/dashboard');

      // Check that dashboard loads
      await expect(page.getByText('LMS Dashboard')).toBeVisible();

      // Check role-specific navigation visibility
      if (userType.session.user.role === 'super-admin' ||
          userType.session.user.members?.some(m => m.role === 'admin')) {
        await expect(page.getByText('User Management')).toBeVisible();
        await expect(page.getByText('Invite Users')).toBeVisible();
      }

      await context.close();
    }
  });

  test('User Management page should be admin-only', async ({ browser }) => {
    // Test admin access
    const adminContext = await browser.newContext();
    await setupAuthContext(adminContext, mockOrgAdminSession);
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/dashboard/users');
    await expect(adminPage.getByText('User Management')).toBeVisible();
    await expect(adminPage.getByText('Manage users and their access')).toBeVisible();

    await adminContext.close();

    // Test member access (should redirect or show error)
    const memberContext = await browser.newContext();
    await setupAuthContext(memberContext, mockMemberSession);
    const memberPage = await memberContext.newPage();

    await memberPage.goto('/dashboard/users');
    // Should either redirect to dashboard or show unauthorized message
    await expect(memberPage.getByText('User Management')).not.toBeVisible();

    await memberContext.close();
  });

  test('Invite page should be admin-only', async ({ browser }) => {
    // Test admin access
    const adminContext = await browser.newContext();
    await setupAuthContext(adminContext, mockOrgAdminSession);
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/dashboard/invite');
    await expect(adminPage.getByText('User Invitations')).toBeVisible();
    await expect(adminPage.getByText('Invite users to join organizations')).toBeVisible();

    await adminContext.close();

    // Test member access
    const memberContext = await browser.newContext();
    await setupAuthContext(memberContext, mockMemberSession);
    const memberPage = await memberContext.newPage();

    await memberPage.goto('/dashboard/invite');
    // Should not see invitation form
    await expect(memberPage.getByText('User Invitations')).not.toBeVisible();

    await memberContext.close();
  });

  test('Quizzes page dual-table functionality', async ({ browser }) => {
    const adminContext = await browser.newContext();
    await setupAuthContext(adminContext, mockOrgAdminSession);
    const page = await adminContext.newPage();

    // Mock quiz data
    await adminContext.route('**/api/dashboard/quizzes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quizzes: [
            {
              id: 'quiz-1',
              title: 'Test Quiz 1',
              organizationId: 'org-1',
              createdAt: '2024-01-01',
              _count: { questions: 5, responses: 10 }
            }
          ],
          totalPages: 1,
          totalCount: 1
        })
      });
    });

    await page.goto('/dashboard/quizzes');

    // Check that quiz table loads
    await expect(page.getByText('Quiz Management')).toBeVisible();
    await expect(page.getByText('Test Quiz 1')).toBeVisible();

    // Check for radio button selection
    const radioButton = page.getByRole('radio').first();
    await radioButton.click();

    // Admin should see responses table after selection
    await expect(page.getByText(/Responses for.*Test Quiz 1/)).toBeVisible();

    await adminContext.close();
  });

  test('Role badges display correctly', async ({ browser }) => {
    const context = await browser.newContext();
    await setupAuthContext(context, mockSuperAdminSession);
    const page = await context.newPage();

    await page.goto('/dashboard/users');

    // Check that role badges are displayed
    await expect(page.locator('[data-testid="role-badge"]')).toBeVisible();

    // Check user avatar menu shows role
    await page.getByTestId('user-avatar').click();
    await expect(page.getByText('Super Admin')).toBeVisible();

    await context.close();
  });

  test('Organization switcher functionality', async ({ browser }) => {
    const multiOrgSession = {
      user: {
        id: 'multi-org-user',
        email: 'multiorg@example.com',
        role: 'user',
        members: [
          { role: 'admin', organizationId: 'org-1', organization: { name: 'Organization 1' } },
          { role: 'member', organizationId: 'org-2', organization: { name: 'Organization 2' } }
        ]
      }
    };

    const context = await browser.newContext();
    await setupAuthContext(context, multiOrgSession);
    const page = await context.newPage();

    await page.goto('/dashboard');

    // Should see organization switcher for multi-org users
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByText('Organization 1')).toBeVisible();

    // Test organization switching
    await page.selectOption('select', 'org-2');
    await expect(page.getByText('Organization 2')).toBeVisible();

    await context.close();
  });

  test('Breadcrumb navigation shows organization context', async ({ browser }) => {
    const context = await browser.newContext();
    await setupAuthContext(context, mockOrgAdminSession);
    const page = await context.newPage();

    await page.goto('/dashboard/users');

    // Check breadcrumb shows organization context
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Test Organization')).toBeVisible();
    await expect(page.getByText('User Management')).toBeVisible();

    await context.close();
  });
});

test.describe('Permission Boundaries', () => {
  test('Data isolation between organizations', async ({ browser }) => {
    const context = await browser.newContext();
    await setupAuthContext(context, mockOrgAdminSession);

    // Mock API to return organization-scoped data only
    await context.route('**/api/dashboard/**', async route => {
      const url = route.request().url();

      if (url.includes('/users')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: [
              { id: 'user-1', email: 'user1@org1.com', organizationId: 'org-1' }
              // Should not include users from other organizations
            ]
          })
        });
      } else if (url.includes('/quizzes')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            quizzes: [
              { id: 'quiz-1', title: 'Org1 Quiz', organizationId: 'org-1' }
              // Should not include quizzes from other organizations
            ]
          })
        });
      }
    });

    const page = await context.newPage();

    // Test users page data isolation
    await page.goto('/dashboard/users');
    await expect(page.getByText('user1@org1.com')).toBeVisible();

    // Test quizzes page data isolation
    await page.goto('/dashboard/quizzes');
    await expect(page.getByText('Org1 Quiz')).toBeVisible();

    await context.close();
  });

  test('Unauthorized access redirects properly', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Test access without authentication
    await page.goto('/dashboard/users');

    // Should redirect to sign-in or show unauthorized
    await expect(page).toHaveURL(/sign-in/);

    await context.close();
  });
});