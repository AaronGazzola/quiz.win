/**
 * Comprehensive Organization Role Access Stress Tests
 *
 * This test suite verifies every interaction type for every user role across all database tables.
 * It ensures that:
 * - All allowed interactions succeed
 * - All prohibited interactions fail with appropriate errors
 * - No data leakage occurs between organizations
 * - Auth schema is completely inaccessible to all users
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createTestData,
  mockGetAuthenticatedClient,
  createSecureMockDb,
  expectUnauthorizedError,
  expectAuthSchemaBlocked,
  expectSuccess,
  TestUser,
  TestContext,
} from '../utils/test-helpers';


describe('Organization Role Access Stress Tests', () => {
  let testData: ReturnType<typeof createTestData>;
  let contexts: Record<string, TestContext>;

  beforeEach(() => {
    testData = createTestData();

    contexts = {
      superAdmin: {
        ...mockGetAuthenticatedClient(testData.users.superAdmin),
        db: createSecureMockDb(testData.users.superAdmin)
      },
      orgAAdmin: {
        ...mockGetAuthenticatedClient(testData.users.orgAAdmin),
        db: createSecureMockDb(testData.users.orgAAdmin)
      },
      orgAMember: {
        ...mockGetAuthenticatedClient(testData.users.orgAMember),
        db: createSecureMockDb(testData.users.orgAMember)
      },
      orgBAdmin: {
        ...mockGetAuthenticatedClient(testData.users.orgBAdmin),
        db: createSecureMockDb(testData.users.orgBAdmin)
      },
      orgBMember: {
        ...mockGetAuthenticatedClient(testData.users.orgBMember),
        db: createSecureMockDb(testData.users.orgBMember)
      },
      unaffiliated: {
        ...mockGetAuthenticatedClient(testData.users.unaffiliated),
        db: createSecureMockDb(testData.users.unaffiliated)
      },
      unauthenticated: {
        ...mockGetAuthenticatedClient(null),
        db: createSecureMockDb(null)
      },
    };
  });

  const authSchemaTables = ['user', 'session', 'account', 'verification', 'magicLink', 'organization', 'member', 'invitation'];
  const publicSchemaTables = ['profile', 'quiz', 'question', 'response'];
  const crudOperations = ['create', 'findUnique', 'findMany', 'update', 'delete'] as const;

  describe('Auth Schema Protection', () => {
    authSchemaTables.forEach(table => {
      describe(`${table} table`, () => {
        crudOperations.forEach(operation => {
          it(`should block ${operation} for super admin`, async () => {
            const context = contexts.superAdmin;
            await expectAuthSchemaBlocked(async () => {
              return context.db[table][operation]({});
            });
          });

          it(`should block ${operation} for organization admin`, async () => {
            const context = contexts.orgAAdmin;
            await expectAuthSchemaBlocked(async () => {
              return context.db[table][operation]({});
            });
          });

          it(`should block ${operation} for organization member`, async () => {
            const context = contexts.orgAMember;
            await expectAuthSchemaBlocked(async () => {
              return context.db[table][operation]({});
            });
          });

          it(`should block ${operation} for unaffiliated user`, async () => {
            const context = contexts.unaffiliated;
            await expectAuthSchemaBlocked(async () => {
              return context.db[table][operation]({});
            });
          });

          it(`should block ${operation} for unauthenticated user`, async () => {
            const context = contexts.unauthenticated;
            await expectUnauthorizedError(async () => {
              return context.db[table][operation]({});
            });
          });
        });
      });
    });
  });

  describe('Quiz Table Access', () => {
    let mockQuizData: any;

    beforeEach(() => {
      mockQuizData = {
        id: 'quiz-1',
        title: 'Test Quiz',
        organizationId: testData.organizations.orgA.id,
        createdBy: 'user-1',
        isActive: true,
      };
    });

    describe('CREATE operations', () => {
      it('should allow super admin to create quiz in any organization', async () => {
        const context = contexts.superAdmin;

        await expectSuccess(async () => {
          return context.db.quiz.create({ data: mockQuizData });
        });
      });

      it('should allow organization admin to create quiz in their organization', async () => {
        const context = contexts.orgAAdmin;

        await expectSuccess(async () => {
          return context.db.quiz.create({ data: mockQuizData });
        });
      });

      it('should block organization member from creating quiz', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.create({ data: mockQuizData });
        });
      });

      it('should block unaffiliated user from creating quiz', async () => {
        const context = contexts.unaffiliated;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.create({ data: mockQuizData });
        });
      });

      it('should block organization admin from creating quiz in different organization', async () => {
        const context = contexts.orgBAdmin;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.create({
            data: { ...mockQuizData, organizationId: testData.organizations.orgA.id }
          });
        });
      });
    });

    describe('READ operations', () => {
      it('should allow super admin to read quizzes from any organization', async () => {
        const context = contexts.superAdmin;

        await expectSuccess(async () => {
          return context.db.quiz.findMany({});
        });
      });

      it('should allow organization admin to read quizzes from their organization', async () => {
        const context = contexts.orgAAdmin;

        await expectSuccess(async () => {
          return context.db.quiz.findMany({
            where: { organizationId: testData.organizations.orgA.id }
          });
        });
      });

      it('should allow organization member to read quizzes from their organization', async () => {
        const context = contexts.orgAMember;

        await expectSuccess(async () => {
          return context.db.quiz.findMany({
            where: { organizationId: testData.organizations.orgA.id }
          });
        });
      });

      it('should block organization member from reading quizzes from different organization', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.findMany({
            where: { organizationId: testData.organizations.orgB.id }
          });
        });
      });

      it('should block unaffiliated user from reading any quizzes', async () => {
        const context = contexts.unaffiliated;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.findMany({});
        });
      });
    });

    describe('UPDATE operations', () => {
      it('should allow super admin to update quizzes in any organization', async () => {
        const context = contexts.superAdmin;
        context.db.quiz.update.mockResolvedValue({ ...mockQuizData, title: 'Updated Quiz' });

        await expectSuccess(async () => {
          return context.db.quiz.update({
            where: { id: 'quiz-1' },
            data: { title: 'Updated Quiz' }
          });
        });
      });

      it('should allow organization admin to update quizzes in their organization', async () => {
        const context = contexts.orgAAdmin;
        context.db.quiz.update.mockResolvedValue({ ...mockQuizData, title: 'Updated Quiz' });

        await expectSuccess(async () => {
          return context.db.quiz.update({
            where: { id: 'quiz-1' },
            data: { title: 'Updated Quiz' }
          });
        });
      });

      it('should block organization member from updating quizzes', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.update({
            where: { id: 'quiz-1' },
            data: { title: 'Updated Quiz' }
          });
        });
      });

      it('should block organization admin from updating quizzes in different organization', async () => {
        const context = contexts.orgBAdmin;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.update({
            where: { id: 'quiz-1' },
            data: { title: 'Updated Quiz' }
          });
        });
      });
    });

    describe('DELETE operations', () => {
      it('should allow super admin to delete quizzes from any organization', async () => {
        const context = contexts.superAdmin;
        context.db.quiz.delete.mockResolvedValue(mockQuizData);

        await expectSuccess(async () => {
          return context.db.quiz.delete({ where: { id: 'quiz-1' } });
        });
      });

      it('should allow organization admin to delete quizzes from their organization', async () => {
        const context = contexts.orgAAdmin;
        context.db.quiz.delete.mockResolvedValue(mockQuizData);

        await expectSuccess(async () => {
          return context.db.quiz.delete({ where: { id: 'quiz-1' } });
        });
      });

      it('should block organization member from deleting quizzes', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.delete({ where: { id: 'quiz-1' } });
        });
      });

      it('should block organization admin from deleting quizzes in different organization', async () => {
        const context = contexts.orgBAdmin;
        await expectUnauthorizedError(async () => {
          return context.db.quiz.delete({ where: { id: 'quiz-1' } });
        });
      });
    });
  });

  describe('Question Table Access', () => {
    let mockQuestionData: any;

    beforeEach(() => {
      mockQuestionData = {
        id: 'question-1',
        quizId: 'quiz-1',
        question: 'Test Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        order: 1,
      };
    });

    describe('CREATE operations', () => {
      it('should allow super admin to create questions for any quiz', async () => {
        const context = contexts.superAdmin;
        context.db.question.create.mockResolvedValue(mockQuestionData);

        await expectSuccess(async () => {
          return context.db.question.create({ data: mockQuestionData });
        });
      });

      it('should allow organization admin to create questions for quizzes in their organization', async () => {
        const context = contexts.orgAAdmin;
        context.db.question.create.mockResolvedValue(mockQuestionData);

        await expectSuccess(async () => {
          return context.db.question.create({ data: mockQuestionData });
        });
      });

      it('should block organization member from creating questions', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.question.create({ data: mockQuestionData });
        });
      });
    });

    describe('READ operations', () => {
      it('should allow super admin to read all questions', async () => {
        const context = contexts.superAdmin;
        context.db.question.findMany.mockResolvedValue([mockQuestionData]);

        await expectSuccess(async () => {
          return context.db.question.findMany({});
        });
      });

      it('should allow organization members to read questions from their organization quizzes', async () => {
        const context = contexts.orgAMember;
        context.db.question.findMany.mockResolvedValue([mockQuestionData]);

        await expectSuccess(async () => {
          return context.db.question.findMany({
            where: { quizId: 'quiz-1' }
          });
        });
      });

      it('should block users from reading questions from different organization quizzes', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.question.findMany({
            where: { quizId: 'quiz-from-org-b' }
          });
        });
      });
    });
  });

  describe('Response Table Access', () => {
    let mockResponseData: any;

    beforeEach(() => {
      mockResponseData = {
        id: 'response-1',
        quizId: 'quiz-1',
        userId: testData.users.orgAMember.id,
        answers: { '1': 'A', '2': 'B' },
        score: 85.5,
        completedAt: new Date(),
      };
    });

    describe('CREATE operations (own responses)', () => {
      it('should allow users to create their own responses', async () => {
        const context = contexts.orgAMember;
        context.db.response.create.mockResolvedValue(mockResponseData);

        await expectSuccess(async () => {
          return context.db.response.create({
            data: {
              ...mockResponseData,
              userId: testData.users.orgAMember.id
            }
          });
        });
      });

      it('should block users from creating responses for other users', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.response.create({
            data: {
              ...mockResponseData,
              userId: testData.users.orgBMember.id
            }
          });
        });
      });
    });

    describe('READ operations (own responses)', () => {
      it('should allow users to read their own responses', async () => {
        const context = contexts.orgAMember;
        context.db.response.findMany.mockResolvedValue([mockResponseData]);

        await expectSuccess(async () => {
          return context.db.response.findMany({
            where: { userId: testData.users.orgAMember.id }
          });
        });
      });

      it('should block users from reading other users responses (same org)', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.response.findMany({
            where: { userId: testData.users.orgAAdmin.id }
          });
        });
      });

      it('should block users from reading responses from different organization', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.response.findMany({
            where: { userId: testData.users.orgBMember.id }
          });
        });
      });
    });

    describe('READ operations (organization admin access)', () => {
      it('should allow super admin to read all responses', async () => {
        const context = contexts.superAdmin;
        context.db.response.findMany.mockResolvedValue([mockResponseData]);

        await expectSuccess(async () => {
          return context.db.response.findMany({});
        });
      });

      it('should allow organization admin to read responses from their organization quizzes', async () => {
        const context = contexts.orgAAdmin;
        context.db.response.findMany.mockResolvedValue([mockResponseData]);

        await expectSuccess(async () => {
          return context.db.response.findMany({
            where: { quizId: 'quiz-1' }
          });
        });
      });

      it('should block organization admin from reading responses from different organization quizzes', async () => {
        const context = contexts.orgAAdmin;
        await expectUnauthorizedError(async () => {
          return context.db.response.findMany({
            where: { quizId: 'quiz-from-org-b' }
          });
        });
      });
    });

    describe('UPDATE operations', () => {
      it('should allow users to update their own responses', async () => {
        const context = contexts.orgAMember;
        context.db.response.update.mockResolvedValue({ ...mockResponseData, score: 90 });

        await expectSuccess(async () => {
          return context.db.response.update({
            where: { id: 'response-1' },
            data: { score: 90 }
          });
        });
      });

      it('should allow organization admin to update responses from their organization', async () => {
        const context = contexts.orgAAdmin;
        context.db.response.update.mockResolvedValue({ ...mockResponseData, score: 90 });

        await expectSuccess(async () => {
          return context.db.response.update({
            where: { id: 'response-1' },
            data: { score: 90 }
          });
        });
      });

      it('should block users from updating other users responses', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.response.update({
            where: { id: 'response-from-other-user' },
            data: { score: 90 }
          });
        });
      });
    });

    describe('DELETE operations', () => {
      it('should allow users to delete their own responses', async () => {
        const context = contexts.orgAMember;
        context.db.response.delete.mockResolvedValue(mockResponseData);

        await expectSuccess(async () => {
          return context.db.response.delete({
            where: { id: 'response-1' }
          });
        });
      });

      it('should allow organization admin to delete responses from their organization', async () => {
        const context = contexts.orgAAdmin;
        context.db.response.delete.mockResolvedValue(mockResponseData);

        await expectSuccess(async () => {
          return context.db.response.delete({
            where: { id: 'response-1' }
          });
        });
      });

      it('should allow super admin to delete any responses', async () => {
        const context = contexts.superAdmin;
        context.db.response.delete.mockResolvedValue(mockResponseData);

        await expectSuccess(async () => {
          return context.db.response.delete({
            where: { id: 'response-1' }
          });
        });
      });

      it('should block users from deleting other users responses', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.response.delete({
            where: { id: 'response-from-other-user' }
          });
        });
      });
    });
  });

  describe('Profile Table Access', () => {
    let mockProfileData: any;

    beforeEach(() => {
      mockProfileData = {
        id: 'profile-1',
        userId: testData.users.orgAMember.id,
        preferences: { theme: 'dark' },
      };
    });

    describe('All operations (profile access should be user-specific)', () => {
      it('should allow users to manage their own profile', async () => {
        const context = contexts.orgAMember;
        context.db.profile.findUnique.mockResolvedValue(mockProfileData);
        context.db.profile.update.mockResolvedValue({ ...mockProfileData, preferences: { theme: 'light' } });

        await expectSuccess(async () => {
          return context.db.profile.findUnique({
            where: { userId: testData.users.orgAMember.id }
          });
        });

        await expectSuccess(async () => {
          return context.db.profile.update({
            where: { userId: testData.users.orgAMember.id },
            data: { preferences: { theme: 'light' } }
          });
        });
      });

      it('should block users from accessing other users profiles', async () => {
        const context = contexts.orgAMember;
        await expectUnauthorizedError(async () => {
          return context.db.profile.findUnique({
            where: { userId: testData.users.orgBMember.id }
          });
        });

        await expectUnauthorizedError(async () => {
          return context.db.profile.update({
            where: { userId: testData.users.orgBMember.id },
            data: { preferences: { theme: 'light' } }
          });
        });
      });

      it('should allow super admin to access any profile', async () => {
        const context = contexts.superAdmin;
        context.db.profile.findMany.mockResolvedValue([mockProfileData]);

        await expectSuccess(async () => {
          return context.db.profile.findMany({});
        });
      });
    });
  });

  describe('Cross-Organization Security Boundaries', () => {
    it('should prevent data leakage between organizations in quiz queries', async () => {
      const orgAMemberContext = contexts.orgAMember;

      await expectUnauthorizedError(async () => {
        return orgAMemberContext.db.quiz.findMany({
          where: { organizationId: testData.organizations.orgB.id }
        });
      });
    });

    it('should prevent admin from one org accessing data from another org', async () => {
      const orgAAdminContext = contexts.orgAAdmin;

      await expectUnauthorizedError(async () => {
        return orgAAdminContext.db.quiz.update({
          where: { id: 'quiz-from-org-b' },
          data: { title: 'Hacked Quiz' }
        });
      });
    });

    it('should prevent cross-organization response access', async () => {
      const orgAMemberContext = contexts.orgAMember;

      await expectUnauthorizedError(async () => {
        return orgAMemberContext.db.response.findMany({
          where: { quizId: 'quiz-from-org-b' }
        });
      });
    });
  });

  describe('Unauthenticated Access', () => {
    const operations = ['create', 'findUnique', 'findMany', 'update', 'delete'] as const;

    publicSchemaTables.forEach(table => {
      describe(`${table} table`, () => {
        operations.forEach(operation => {
          it(`should block ${operation} for unauthenticated users`, async () => {
            const context = contexts.unauthenticated;
            await expectUnauthorizedError(async () => {
              return context.db[table][operation]({});
            });
          });
        });
      });
    });
  });

  describe('Performance and Scale Testing', () => {
    it('should handle large query operations efficiently', async () => {
      const context = contexts.superAdmin;
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `quiz-${i}`,
        title: `Quiz ${i}`,
        organizationId: testData.organizations.orgA.id,
      }));

      context.db.quiz.findMany.mockResolvedValue(largeDataSet);

      const startTime = Date.now();
      await expectSuccess(async () => {
        return context.db.quiz.findMany({});
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle concurrent access attempts', async () => {
      const context = contexts.orgAAdmin;
      const mockData = { id: 'quiz-1', title: 'Concurrent Quiz' };

      context.db.quiz.create.mockResolvedValue(mockData);

      const concurrentOperations = Array.from({ length: 10 }, () =>
        context.db.quiz.create({ data: mockData })
      );

      await expectSuccess(async () => {
        return Promise.all(concurrentOperations);
      });
    });
  });
});