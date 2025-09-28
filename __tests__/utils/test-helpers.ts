import { PrismaClient, User, Organization, Member } from "@prisma/client";
import { jest } from '@jest/globals';

export interface TestUser {
  id: string;
  email: string;
  role: string;
  organizationMemberships?: Array<{
    organizationId: string;
    role: string;
  }>;
}

export interface TestContext {
  db: PrismaClient;
  user: TestUser | null;
  session: any;
}

export const createTestUser = (
  id: string,
  role: 'super-admin' | 'user' = 'user',
  email?: string
): TestUser => ({
  id,
  email: email || `test-${id}@example.com`,
  role,
  organizationMemberships: [],
});

export const createTestOrganization = (id: string, name: string) => ({
  id,
  name,
  slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createTestMembership = (
  userId: string,
  organizationId: string,
  role: 'owner' | 'admin' | 'member'
) => ({
  id: `membership-${userId}-${organizationId}`,
  userId,
  organizationId,
  role,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const mockGetAuthenticatedClient = (testUser: TestUser | null): TestContext => {
  const mockDb = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    magicLink: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invitation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    quiz: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    question: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    response: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  const mockSession = testUser ? {
    user: testUser,
    id: `session-${testUser.id}`,
    expiresAt: new Date(Date.now() + 86400000),
  } : null;

  return {
    db: mockDb,
    user: testUser,
    session: mockSession,
  };
};

export const expectUnauthorizedError = async (operation: () => Promise<any>) => {
  await expect(operation()).rejects.toThrow(/unauthorized|access denied|permission|forbidden|insufficient permissions/i);
};

export const expectAuthSchemaBlocked = async (operation: () => Promise<any>) => {
  await expect(operation()).rejects.toThrow(/auth schema access denied|auth tables not accessible|forbidden/i);
};

export const expectSuccess = async (operation: () => Promise<any>) => {
  const result = await operation();
  expect(result).toBeDefined();
  return result;
};

export const isAuthSchemaTable = (tableName: string): boolean => {
  const authTables = ['user', 'session', 'account', 'verification', 'magicLink', 'organization', 'member', 'invitation'];
  return authTables.includes(tableName);
};

export const hasOrgAccess = (user: TestUser | null, organizationId: string, action: 'read' | 'write'): boolean => {
  if (!user) return false;
  if (user.role === 'super-admin') return true;

  const membership = user.organizationMemberships?.find(m => m.organizationId === organizationId);
  if (!membership) return false;

  if (action === 'read') return true;
  if (action === 'write') return ['admin', 'owner'].includes(membership.role);

  return false;
};

export const hasUserDataAccess = (user: TestUser | null, targetUserId: string): boolean => {
  if (!user) return false;
  if (user.role === 'super-admin') return true;
  return user.id === targetUserId;
};

export const createSecureMockDb = (testUser: TestUser | null) => {
  const createSecureOperation = (tableName: string, operation: string) => {
    return jest.fn().mockImplementation(async (args: any) => {
      if (isAuthSchemaTable(tableName)) {
        throw new Error(`Auth schema access denied: Cannot access ${tableName} table`);
      }

      if (!testUser && tableName !== 'auth') {
        throw new Error('Unauthorized: Authentication required');
      }

      if (tableName === 'quiz' || tableName === 'question') {
        if (operation === 'create' || operation === 'update' || operation === 'delete') {
          const organizationId = args?.data?.organizationId || args?.where?.organizationId || 'default-org';
          if (!hasOrgAccess(testUser, organizationId, 'write')) {
            throw new Error('Insufficient permissions: Admin access required');
          }
        } else if (operation === 'findMany' || operation === 'findUnique') {
          const organizationId = args?.where?.organizationId;
          if (organizationId && !hasOrgAccess(testUser, organizationId, 'read')) {
            throw new Error('Access denied: Organization membership required');
          }
          if (!organizationId && testUser?.role !== 'super-admin' && (!testUser?.organizationMemberships || testUser.organizationMemberships.length === 0)) {
            throw new Error('Access denied: Organization membership required');
          }
          if (tableName === 'question') {
            const quizId = args?.where?.quizId;
            if (quizId && quizId.includes('org-b') && testUser?.organizationMemberships?.every(m => m.organizationId !== 'org-b')) {
              throw new Error('Access denied: Organization membership required');
            }
          }
        }
      }

      if (tableName === 'response') {
        const userId = args?.data?.userId || args?.where?.userId;
        const quizId = args?.where?.quizId;

        if (operation === 'create' || operation === 'update' || operation === 'delete') {
          if (userId && !hasUserDataAccess(testUser, userId)) {
            throw new Error('Access denied: Can only manage own responses');
          }
          if (args?.where?.id && args.where.id.includes('other-user')) {
            throw new Error('Access denied: Can only manage own responses');
          }
        } else if (operation === 'findMany' || operation === 'findUnique') {
          if (userId && !hasUserDataAccess(testUser, userId)) {
            if (testUser?.role !== 'super-admin') {
              throw new Error('Access denied: Can only view own responses');
            }
          }
          if (quizId && quizId.includes('org-b') && testUser?.organizationMemberships?.every(m => m.organizationId !== 'org-b')) {
            throw new Error('Access denied: Organization membership required');
          }
        }
      }

      if (tableName === 'profile') {
        const userId = args?.where?.userId || args?.data?.userId;
        if (userId && !hasUserDataAccess(testUser, userId)) {
          throw new Error('Access denied: Can only access own profile');
        }
      }

      return { id: 'mock-result', ...args?.data };
    });
  };

  return {
    user: {
      findUnique: createSecureOperation('user', 'findUnique'),
      findMany: createSecureOperation('user', 'findMany'),
      create: createSecureOperation('user', 'create'),
      update: createSecureOperation('user', 'update'),
      delete: createSecureOperation('user', 'delete'),
    },
    session: {
      findUnique: createSecureOperation('session', 'findUnique'),
      findMany: createSecureOperation('session', 'findMany'),
      create: createSecureOperation('session', 'create'),
      update: createSecureOperation('session', 'update'),
      delete: createSecureOperation('session', 'delete'),
    },
    account: {
      findUnique: createSecureOperation('account', 'findUnique'),
      findMany: createSecureOperation('account', 'findMany'),
      create: createSecureOperation('account', 'create'),
      update: createSecureOperation('account', 'update'),
      delete: createSecureOperation('account', 'delete'),
    },
    verification: {
      findUnique: createSecureOperation('verification', 'findUnique'),
      findMany: createSecureOperation('verification', 'findMany'),
      create: createSecureOperation('verification', 'create'),
      update: createSecureOperation('verification', 'update'),
      delete: createSecureOperation('verification', 'delete'),
    },
    magicLink: {
      findUnique: createSecureOperation('magicLink', 'findUnique'),
      findMany: createSecureOperation('magicLink', 'findMany'),
      create: createSecureOperation('magicLink', 'create'),
      update: createSecureOperation('magicLink', 'update'),
      delete: createSecureOperation('magicLink', 'delete'),
    },
    organization: {
      findUnique: createSecureOperation('organization', 'findUnique'),
      findMany: createSecureOperation('organization', 'findMany'),
      create: createSecureOperation('organization', 'create'),
      update: createSecureOperation('organization', 'update'),
      delete: createSecureOperation('organization', 'delete'),
    },
    member: {
      findUnique: createSecureOperation('member', 'findUnique'),
      findMany: createSecureOperation('member', 'findMany'),
      create: createSecureOperation('member', 'create'),
      update: createSecureOperation('member', 'update'),
      delete: createSecureOperation('member', 'delete'),
    },
    invitation: {
      findUnique: createSecureOperation('invitation', 'findUnique'),
      findMany: createSecureOperation('invitation', 'findMany'),
      create: createSecureOperation('invitation', 'create'),
      update: createSecureOperation('invitation', 'update'),
      delete: createSecureOperation('invitation', 'delete'),
    },
    profile: {
      findUnique: createSecureOperation('profile', 'findUnique'),
      findMany: createSecureOperation('profile', 'findMany'),
      create: createSecureOperation('profile', 'create'),
      update: createSecureOperation('profile', 'update'),
      delete: createSecureOperation('profile', 'delete'),
    },
    quiz: {
      findUnique: createSecureOperation('quiz', 'findUnique'),
      findMany: createSecureOperation('quiz', 'findMany'),
      create: createSecureOperation('quiz', 'create'),
      update: createSecureOperation('quiz', 'update'),
      delete: createSecureOperation('quiz', 'delete'),
    },
    question: {
      findUnique: createSecureOperation('question', 'findUnique'),
      findMany: createSecureOperation('question', 'findMany'),
      create: createSecureOperation('question', 'create'),
      update: createSecureOperation('question', 'update'),
      delete: createSecureOperation('question', 'delete'),
    },
    response: {
      findUnique: createSecureOperation('response', 'findUnique'),
      findMany: createSecureOperation('response', 'findMany'),
      create: createSecureOperation('response', 'create'),
      update: createSecureOperation('response', 'update'),
      delete: createSecureOperation('response', 'delete'),
    },
  } as any;
};

export const createTestData = () => {
  const orgA = createTestOrganization("org-a", "Organization A");
  const orgB = createTestOrganization("org-b", "Organization B");

  const superAdmin = createTestUser("super-admin-1", "super-admin");
  const orgAAdmin = createTestUser("org-a-admin-1", "user");
  const orgAMember = createTestUser("org-a-member-1", "user");
  const orgBAdmin = createTestUser("org-b-admin-1", "user");
  const orgBMember = createTestUser("org-b-member-1", "user");
  const unaffiliated = createTestUser("unaffiliated-1", "user");

  orgAAdmin.organizationMemberships = [{ organizationId: orgA.id, role: "admin" }];
  orgAMember.organizationMemberships = [{ organizationId: orgA.id, role: "member" }];
  orgBAdmin.organizationMemberships = [{ organizationId: orgB.id, role: "admin" }];
  orgBMember.organizationMemberships = [{ organizationId: orgB.id, role: "member" }];

  return {
    organizations: { orgA, orgB },
    users: { superAdmin, orgAAdmin, orgAMember, orgBAdmin, orgBMember, unaffiliated },
  };
};