import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';
import { signInWithDevUser, signOut } from './utils/auth-helper';

test.describe.configure({ workers: 1 });

test.describe('Gamification Workflow Tests', () => {
  const USER_1 = 'nurse.emily.davis@gazzola.dev';
  const USER_2 = 'admin.michael.brown@gazzola.dev';
  const QUIZ_TITLE = 'Patient Safety Protocols';

  const CORRECT_ANSWERS = [
    'Check the patient wristband with two identifiers',
    'Before and after patient contact',
    'Report it immediately to the supervising physician',
    'On admission and with any change in condition',
  ];

  test.beforeEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: {
          cleanupGamification: true,
          userEmails: [USER_1, USER_2],
          skipReseed: true,
        },
      });
    } catch (error) {
      console.log('Pre-cleanup skipped:', error);
    }
  });

  test.afterEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: {
          cleanupGamification: true,
          userEmails: [USER_1, USER_2],
          skipReseed: true,
        },
      });
    } catch (error) {
      console.log('Post-cleanup skipped:', error);
    }
  });

  test('should update gamification data and leaderboard after quiz completion by two users', async ({ page }) => {
    const logger = new TestStepLogger('Gamification: Multi-user Quiz Completion and Leaderboard');
    let user1Points = 0;
    let user1Id: string | null = null;

    await logger.step('Sign in as User 1 (nurse.emily.davis)', async () => {
      await signInWithDevUser(page, USER_1);
    });

    await logger.step('Wait for dashboard to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify initial gamification state shows 0 points', async () => {
      const totalPoints = page.getByTestId(TestId.GAMIFICATION_TOTAL_POINTS);
      await expect(totalPoints).toBeVisible({ timeout: 20000 });
      await expect(totalPoints).toContainText('0');
    });

    await logger.step('Navigate to Patient Safety Protocols quiz', async () => {
      const quizRow = page.locator(`[data-quiz-title="${QUIZ_TITLE}"]`);
      await expect(quizRow).toBeVisible({ timeout: 20000 });
      await quizRow.click();
      await page.waitForTimeout(1000);

      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await expect(takeButton).toBeVisible({ timeout: 20000 });
      await takeButton.click();
    });

    await logger.step('Verify quiz taking page loaded', async () => {
      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_TITLE)).toContainText(QUIZ_TITLE);
    });

    await logger.step('Answer Question 1 correctly', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('patient identification');

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      const count = await answerLabels.count();
      for (let j = 0; j < count; j++) {
        const label = answerLabels.nth(j);
        const text = await label.textContent();
        if (text?.includes(CORRECT_ANSWERS[0])) {
          await label.click();
          break;
        }
      }
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 2 and answer correctly', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      const count = await answerLabels.count();
      for (let j = 0; j < count; j++) {
        const label = answerLabels.nth(j);
        const text = await label.textContent();
        if (text?.includes(CORRECT_ANSWERS[1])) {
          await label.click();
          break;
        }
      }
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 3 and answer correctly', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      const count = await answerLabels.count();
      for (let j = 0; j < count; j++) {
        const label = answerLabels.nth(j);
        const text = await label.textContent();
        if (text?.includes(CORRECT_ANSWERS[2])) {
          await label.click();
          break;
        }
      }
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 4 and answer correctly', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      const count = await answerLabels.count();
      for (let j = 0; j < count; j++) {
        const label = answerLabels.nth(j);
        const text = await label.textContent();
        if (text?.includes(CORRECT_ANSWERS[3])) {
          await label.click();
          break;
        }
      }
      await page.waitForTimeout(500);
    });

    await logger.step('Submit quiz', async () => {
      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await expect(submitButton).toBeVisible({ timeout: 20000 });
      await submitButton.click();
      await page.waitForTimeout(3000);
    });

    await logger.step('Verify 100% score in review mode', async () => {
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE)).toContainText('100%');
    });

    await logger.step('Return to dashboard', async () => {
      const backButton = page.getByTestId(TestId.QUIZ_TAKE_BACK_TO_DASHBOARD);
      await backButton.click();
      await expect(page).toHaveURL('/', { timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify User 1 gamification updates: points > 0', async () => {
      const totalPoints = page.getByTestId(TestId.GAMIFICATION_TOTAL_POINTS);
      await expect(totalPoints).toBeVisible({ timeout: 20000 });
      const pointsText = await totalPoints.textContent();
      const points = parseInt(pointsText || '0');
      expect(points).toBeGreaterThan(0);
      user1Points = points;
    });

    await logger.step('Verify User 1 stats: 1 quiz completed', async () => {
      const quizzesCompleted = page.getByTestId(TestId.GAMIFICATION_QUIZZES_COMPLETED);
      await expect(quizzesCompleted).toContainText('1');
    });

    await logger.step('Verify User 1 stats: 1 perfect score', async () => {
      const perfectScores = page.getByTestId(TestId.GAMIFICATION_PERFECT_SCORES);
      await expect(perfectScores).toContainText('1');
    });

    await logger.step('Verify User 1 stats: 100% average', async () => {
      const averageScore = page.getByTestId(TestId.GAMIFICATION_AVERAGE_SCORE);
      await expect(averageScore).toContainText('100%');
    });

    await logger.step('Capture User 1 ID from leaderboard', async () => {
      const currentUserEntry = page.locator('[data-is-current-user="true"]');
      await expect(currentUserEntry).toBeVisible({ timeout: 20000 });
      user1Id = await currentUserEntry.getAttribute('data-user-id');
      expect(user1Id).toBeTruthy();
    });

    await logger.step('Sign out User 1', async () => {
      await signOut(page);
    });

    await logger.step('Sign in as User 2 (admin.michael.brown)', async () => {
      await signInWithDevUser(page, USER_2);
    });

    await logger.step('Wait for dashboard to load for User 2', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify User 2 initial gamification state shows 0 points', async () => {
      const totalPoints = page.getByTestId(TestId.GAMIFICATION_TOTAL_POINTS);
      await expect(totalPoints).toBeVisible({ timeout: 20000 });
      await expect(totalPoints).toContainText('0');
    });

    await logger.step('Navigate to same quiz for User 2', async () => {
      const quizRow = page.locator(`[data-quiz-title="${QUIZ_TITLE}"]`);
      await expect(quizRow).toBeVisible({ timeout: 20000 });
      await quizRow.click();
      await page.waitForTimeout(1000);

      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await expect(takeButton).toBeVisible({ timeout: 20000 });
      await takeButton.click();
    });

    await logger.step('Verify quiz taking page loaded for User 2', async () => {
      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Answer Question 1 correctly (User 2)', async () => {
      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      const count = await answerLabels.count();
      for (let j = 0; j < count; j++) {
        const label = answerLabels.nth(j);
        const text = await label.textContent();
        if (text?.includes(CORRECT_ANSWERS[0])) {
          await label.click();
          break;
        }
      }
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 2 and answer correctly (User 2)', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      const count = await answerLabels.count();
      for (let j = 0; j < count; j++) {
        const label = answerLabels.nth(j);
        const text = await label.textContent();
        if (text?.includes(CORRECT_ANSWERS[1])) {
          await label.click();
          break;
        }
      }
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 3 and answer INCORRECTLY (User 2)', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      await answerLabels.first().click();
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 4 and answer INCORRECTLY (User 2)', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answerLabels = page.locator(`[data-testid^="${TestId.QUIZ_TAKE_ANSWER_LABEL}"]`);
      await answerLabels.first().click();
      await page.waitForTimeout(500);
    });

    await logger.step('Submit quiz (User 2)', async () => {
      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await expect(submitButton).toBeVisible({ timeout: 20000 });
      await submitButton.click();
      await page.waitForTimeout(3000);
    });

    await logger.step('Verify 50% score in review mode (User 2)', async () => {
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE)).toContainText('50%');
    });

    await logger.step('Return to dashboard (User 2)', async () => {
      const backButton = page.getByTestId(TestId.QUIZ_TAKE_BACK_TO_DASHBOARD);
      await backButton.click();
      await expect(page).toHaveURL('/', { timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify User 2 gamification updates: points > 0 but < User 1', async () => {
      const totalPoints = page.getByTestId(TestId.GAMIFICATION_TOTAL_POINTS);
      await expect(totalPoints).toBeVisible({ timeout: 20000 });
      const pointsText = await totalPoints.textContent();
      const user2Points = parseInt(pointsText || '0');
      expect(user2Points).toBeGreaterThan(0);
      expect(user2Points).toBeLessThan(user1Points);
    });

    await logger.step('Verify User 2 stats: 1 quiz completed', async () => {
      const quizzesCompleted = page.getByTestId(TestId.GAMIFICATION_QUIZZES_COMPLETED);
      await expect(quizzesCompleted).toContainText('1');
    });

    await logger.step('Verify User 2 stats: 0 perfect scores', async () => {
      const perfectScores = page.getByTestId(TestId.GAMIFICATION_PERFECT_SCORES);
      await expect(perfectScores).toContainText('0');
    });

    await logger.step('Verify User 2 stats: 50% average', async () => {
      const averageScore = page.getByTestId(TestId.GAMIFICATION_AVERAGE_SCORE);
      await expect(averageScore).toContainText('50%');
    });

    await logger.step('Verify leaderboard contains both test users', async () => {
      const leaderboardCard = page.getByTestId(TestId.GAMIFICATION_LEADERBOARD_CARD);
      await expect(leaderboardCard).toBeVisible({ timeout: 20000 });

      const user1Entry = page.locator(`[data-user-id="${user1Id}"]`);
      await expect(user1Entry).toBeVisible({ timeout: 20000 });

      const user2Entry = page.locator('[data-is-current-user="true"]');
      await expect(user2Entry).toBeVisible({ timeout: 20000 });
      const user2Id = await user2Entry.getAttribute('data-user-id');

      expect(user1Id).not.toEqual(user2Id);
    });

    await logger.step('Sign out User 2', async () => {
      await signOut(page);
    });
  });
});
