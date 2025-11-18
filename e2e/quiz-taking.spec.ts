import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';

test.describe.configure({ workers: 1 });

test.describe('Quiz Taking and Review Tests', () => {
  test('should complete quiz and verify submission with correct answers', async ({ page }) => {
    const logger = new TestStepLogger('Complete Medical Terminology Quiz Flow');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as nurse.emily.davis@gazzola.dev', async () => {
      const userCard = page.getByTestId('user-card-nurse.emily.davis@gazzola.dev');
      await expect(userCard).toBeVisible({ timeout: 20000 });
      await userCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 20000 });
    });

    await logger.step('Wait for quiz table to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Select Medical Terminology quiz from dashboard', async () => {
      const quizRow = page.locator('[data-quiz-title="Medical Terminology Basics"]');
      await expect(quizRow).toBeVisible({ timeout: 20000 });
      await quizRow.click();
      await page.waitForTimeout(1000);
    });

    await logger.step('Click Take Quiz button', async () => {
      await page.waitForTimeout(1000);
      const quizRow = page.locator('[data-quiz-title="Medical Terminology Basics"]');
      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await expect(takeButton).toBeVisible({ timeout: 20000 });
      await takeButton.click();
    });

    await logger.step('Verify quiz taking page loaded', async () => {
      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_TITLE)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_PROGRESS_BAR)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Answer Question 1: What does the suffix -itis mean?', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText("What does the suffix '-itis' mean?");

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-0`);
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);

      const answeredCounter = page.getByTestId(TestId.QUIZ_TAKE_ANSWERED_COUNTER);
      await expect(answeredCounter).toContainText('1 of 3 answered');
    });

    await logger.step('Navigate to Question 2 using Next button', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const questionCounter = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 2 of 3');
    });

    await logger.step('Answer Question 2: What does brady- mean as a prefix?', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText("What does 'brady-' mean as a prefix?");

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);
    });

    await logger.step('Navigate to Question 3 using question nav dots', async () => {
      const navDot2 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-2`);
      await navDot2.click();
      await page.waitForTimeout(500);

      const questionCounter = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 3 of 3');
    });

    await logger.step('Answer Question 3: What does cardio refer to?', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText("What does 'cardio' refer to?");

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-0`);
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);

      const answeredCounter = page.getByTestId(TestId.QUIZ_TAKE_ANSWERED_COUNTER);
      await expect(answeredCounter).toContainText('3 of 3 answered');
    });

    await logger.step('Test Previous button navigation', async () => {
      const previousButton = page.getByTestId(TestId.QUIZ_TAKE_PREVIOUS_BUTTON);
      await previousButton.click();
      await page.waitForTimeout(500);

      const questionCounter = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 2 of 3');

      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);
    });

    await logger.step('Verify Submit button appears on last question when all answered', async () => {
      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await expect(submitButton).toBeVisible({ timeout: 20000 });
      await expect(submitButton).toContainText('Submit Quiz');
      await expect(submitButton).not.toBeDisabled();
    });

    await logger.step('Submit quiz', async () => {
      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await submitButton.click();
      await page.waitForTimeout(3000);
    });

    await logger.step('Verify redirected to review mode', async () => {
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_SCORE)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Verify quiz score is 100%', async () => {
      const scorePercentage = page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE);
      await expect(scorePercentage).toContainText('100%');
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 20000 });
    });
  });

  test('should display correct review mode with accurate answer indicators matching seed data', async ({ page }) => {
    const logger = new TestStepLogger('Review Patient Safety Quiz with Seed Data Validation');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as nurse.emily.davis@gazzola.dev', async () => {
      const userCard = page.getByTestId('user-card-nurse.emily.davis@gazzola.dev');
      await expect(userCard).toBeVisible({ timeout: 20000 });
      await userCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 20000 });
    });

    await logger.step('Wait for quiz table to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Select Patient Safety Protocols quiz', async () => {
      const quizRow = page.locator('[data-quiz-title="Patient Safety Protocols"]');
      await expect(quizRow).toBeVisible({ timeout: 20000 });
      await quizRow.click();
      await page.waitForTimeout(1000);
    });

    await logger.step('Click Take Quiz button to view existing response', async () => {
      await page.waitForTimeout(1000);
      const quizRow = page.locator('[data-quiz-title="Patient Safety Protocols"]');
      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await expect(takeButton).toBeVisible({ timeout: 20000 });
      await takeButton.click();
    });

    await logger.step('Verify review mode loaded', async () => {
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_TITLE)).toContainText('Patient Safety Protocols - Review');
    });

    await logger.step('Verify score is 100% (4 of 4 correct)', async () => {
      const scorePercentage = page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE);
      await expect(scorePercentage).toContainText('100%');

      const scoreSection = page.getByTestId(TestId.QUIZ_REVIEW_SCORE);
      await expect(scoreSection).toContainText('4 of 4 correct');
    });

    await logger.step('Verify completion date is displayed', async () => {
      const completionDate = page.getByTestId(TestId.QUIZ_REVIEW_COMPLETION_DATE);
      await expect(completionDate).toBeVisible({ timeout: 20000 });
      await expect(completionDate).toContainText('Completed on');
    });

    await logger.step('Verify Question 1 correct answer indicator', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is the first step in patient identification?');

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toBeVisible({ timeout: 20000 });
      await expect(resultIndicator).toContainText('Correct!');

      const answerOptions = page.locator(`[data-testid^="${TestId.QUIZ_REVIEW_ANSWER_OPTION}"]`);
      const firstOption = answerOptions.first();
      await expect(firstOption).toContainText('Check the patient wristband with two identifiers');

      const yourAnswerLabel = page.getByTestId(TestId.QUIZ_REVIEW_YOUR_ANSWER_LABEL);
      await expect(yourAnswerLabel).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Navigate to Question 2 and verify correct answer', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('How often should hand hygiene be performed?');

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toContainText('Correct!');
    });

    await logger.step('Navigate to Question 3 using nav dots', async () => {
      const navDot2 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-2`);
      await navDot2.click();
      await page.waitForTimeout(500);

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What should you do if you witness a medication error?');

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toContainText('Correct!');
    });

    await logger.step('Navigate to Question 4 and verify correct answer', async () => {
      const navDot3 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-3`);
      await navDot3.click();
      await page.waitForTimeout(500);

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('When should fall risk assessments be conducted?');

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toContainText('Correct!');
    });

    await logger.step('Verify question nav dots show all correct (green)', async () => {
      const navDot0 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-0`);
      const navDot1 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-1`);
      const navDot2 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-2`);
      const navDot3 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-3`);

      await expect(navDot0).toBeVisible({ timeout: 20000 });
      await expect(navDot1).toBeVisible({ timeout: 20000 });
      await expect(navDot2).toBeVisible({ timeout: 20000 });
      await expect(navDot3).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Test Previous button in review mode', async () => {
      const previousButton = page.getByTestId(TestId.QUIZ_TAKE_PREVIOUS_BUTTON);
      await previousButton.click();
      await page.waitForTimeout(500);

      const questionCounter = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 3 of 4');
    });

    await logger.step('Verify Previous button disabled on first question', async () => {
      const navDot0 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-0`);
      await navDot0.click();
      await page.waitForTimeout(500);

      const previousButton = page.getByTestId(TestId.QUIZ_TAKE_PREVIOUS_BUTTON);
      await expect(previousButton).toBeDisabled();
    });

    await logger.step('Verify Next button disabled on last question', async () => {
      const navDot3 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-3`);
      await navDot3.click();
      await page.waitForTimeout(500);

      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await expect(nextButton).toBeDisabled();
    });

    await logger.step('Navigate back to dashboard', async () => {
      const backButton = page.getByTestId(TestId.QUIZ_TAKE_BACK_TO_DASHBOARD);
      await backButton.click();
      await expect(page).toHaveURL('/', { timeout: 20000 });
    });

    await logger.step('Sign out', async () => {
      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 20000 });
    });
  });

  test('should display incorrect answers correctly in review mode', async ({ page }) => {
    const logger = new TestStepLogger('Review Quiz with Mixed Correct/Incorrect Answers');

    await logger.step('Navigate to sign-in page', async () => {
      await page.goto('/sign-in');
      await expect(page).toHaveURL('/sign-in');
    });

    await logger.step('Sign in as admin.michael.brown@gazzola.dev (has 75% score)', async () => {
      const userCard = page.getByTestId('user-card-admin.michael.brown@gazzola.dev');
      await expect(userCard).toBeVisible({ timeout: 20000 });
      await userCard.click();
    });

    await logger.step('Verify redirect to home page', async () => {
      await expect(page).toHaveURL('/', { timeout: 20000 });
    });

    await logger.step('Wait for quiz table to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Select Patient Safety Protocols quiz', async () => {
      const quizRow = page.locator('[data-quiz-title="Patient Safety Protocols"]');
      await expect(quizRow).toBeVisible({ timeout: 20000 });
      await quizRow.click();
      await page.waitForTimeout(1000);
    });

    await logger.step('Click Take Quiz button to view review', async () => {
      await page.waitForTimeout(1000);
      const quizRow = page.locator('[data-quiz-title="Patient Safety Protocols"]');
      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await expect(takeButton).toBeVisible({ timeout: 20000 });
      await takeButton.click();
    });

    await logger.step('Verify review mode with 75% score', async () => {
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_CONTAINER)).toBeVisible({ timeout: 20000 });

      const scorePercentage = page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE);
      await expect(scorePercentage).toContainText('75%');

      const scoreSection = page.getByTestId(TestId.QUIZ_REVIEW_SCORE);
      await expect(scoreSection).toContainText('3 of 4 correct');
    });

    await logger.step('Navigate to Question 2 (the incorrect one)', async () => {
      const navDot1 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-1`);
      await navDot1.click();
      await page.waitForTimeout(500);

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('How often should hand hygiene be performed?');
    });

    await logger.step('Verify incorrect answer indicator is displayed', async () => {
      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toBeVisible({ timeout: 20000 });
      await expect(resultIndicator).toContainText('Incorrect');
    });

    await logger.step('Verify both user answer and correct answer are shown', async () => {
      const yourAnswerLabel = page.getByTestId(TestId.QUIZ_REVIEW_YOUR_ANSWER_LABEL);
      await expect(yourAnswerLabel).toBeVisible({ timeout: 20000 });

      const correctAnswerLabel = page.getByTestId(TestId.QUIZ_REVIEW_CORRECT_ANSWER_LABEL);
      await expect(correctAnswerLabel).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Sign out', async () => {
      const backButton = page.getByTestId(TestId.QUIZ_TAKE_BACK_TO_DASHBOARD);
      await backButton.click();
      await page.waitForTimeout(1000);

      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/sign-in', { timeout: 20000 });
    });
  });
});
