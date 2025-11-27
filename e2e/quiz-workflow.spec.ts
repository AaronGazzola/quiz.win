import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';
import { signInWithDevUser } from './utils/auth-helper';

test.describe.configure({ workers: 1 });

test.describe('Quiz Workflow Tests', () => {
  test.beforeEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: { quizTitlePrefix: 'E2E' },
      });
    } catch (error) {
      console.log('Pre-cleanup skipped:', error);
    }
  });

  test.afterEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: { quizTitlePrefix: 'E2E' },
      });
    } catch (error) {
      console.log('Cleanup skipped:', error);
    }
  });

  test('should complete full quiz workflow: creation → taking → viewing results', async ({ page }) => {
    const logger = new TestStepLogger('Complete Quiz Workflow: Create, Take, and Review');
    const timestamp = Date.now();
    const quizTitle = `E2E Test Quiz ${timestamp}`;
    const quizDescription = `Test quiz created at ${new Date().toISOString()}`;

    await logger.step('Sign in as admin.michael.brown@gazzola.dev', async () => {
      await signInWithDevUser(page, 'admin.michael.brown@gazzola.dev');
    });

    await logger.step('Wait for dashboard to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Click Add Quiz button to create new quiz', async () => {
      const addQuizButton = page.getByTestId(TestId.DASHBOARD_ADD_QUIZ_BUTTON);
      await expect(addQuizButton).toBeVisible({ timeout: 20000 });
      await addQuizButton.click();
    });

    await logger.step('Verify quiz creation page loaded', async () => {
      await expect(page).toHaveURL('/take-quiz/new', { timeout: 20000 });
      const createContainer = page.getByTestId(TestId.QUIZ_CREATE_CONTAINER);
      await expect(createContainer).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Enter quiz title and description', async () => {
      const titleInput = page.getByTestId(TestId.QUIZ_CREATE_TITLE_INPUT);
      await expect(titleInput).toBeVisible({ timeout: 20000 });
      await titleInput.fill(quizTitle);

      const descriptionInput = page.getByTestId(TestId.QUIZ_CREATE_DESCRIPTION_INPUT);
      await expect(descriptionInput).toBeVisible({ timeout: 20000 });
      await descriptionInput.fill(quizDescription);
    });

    await logger.step('Enter first question text', async () => {
      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await expect(questionInput).toBeVisible({ timeout: 20000 });
      await questionInput.fill('What is the capital of France?');
    });

    await logger.step('Fill in question options', async () => {
      const option0 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-0`);
      await expect(option0).toBeVisible({ timeout: 20000 });
      await option0.fill('Paris');

      const option1 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-1`);
      await expect(option1).toBeVisible({ timeout: 20000 });
      await option1.fill('London');

      const addOptionButton = page.getByTestId(TestId.QUIZ_CREATE_ADD_OPTION_BUTTON);
      await addOptionButton.click();
      await page.waitForTimeout(500);

      const option2 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-2`);
      await expect(option2).toBeVisible({ timeout: 20000 });
      await option2.fill('Berlin');

      await addOptionButton.click();
      await page.waitForTimeout(500);

      const option3 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-3`);
      await expect(option3).toBeVisible({ timeout: 20000 });
      await option3.fill('Madrid');
    });

    await logger.step('Mark correct answer', async () => {
      const correctAnswerRadio = page.getByTestId(`${TestId.QUIZ_CREATE_CORRECT_ANSWER_RADIO}-0`);
      await expect(correctAnswerRadio).toBeVisible({ timeout: 20000 });
      await correctAnswerRadio.click();
      await page.waitForTimeout(500);
    });

    await logger.step('Add second question', async () => {
      const addQuestionButton = page.getByTestId(TestId.QUIZ_CREATE_ADD_QUESTION_BUTTON);
      await expect(addQuestionButton).toBeVisible({ timeout: 20000 });
      await addQuestionButton.click();
      await page.waitForTimeout(1000);

      const questionCounter = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 2 of 2');
    });

    await logger.step('Enter second question details', async () => {
      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await questionInput.fill('What is 2 + 2?');

      const option0 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-0`);
      await option0.fill('3');

      const option1 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-1`);
      await option1.fill('4');

      const correctAnswerRadio = page.getByTestId(`${TestId.QUIZ_CREATE_CORRECT_ANSWER_RADIO}-1`);
      await correctAnswerRadio.click();
      await page.waitForTimeout(500);
    });

    await logger.step('Add third question', async () => {
      const addQuestionButton = page.getByTestId(TestId.QUIZ_CREATE_ADD_QUESTION_BUTTON);
      await addQuestionButton.click();
      await page.waitForTimeout(1000);

      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await questionInput.fill('What color is the sky?');

      const option0 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-0`);
      await option0.fill('Blue');

      const option1 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-1`);
      await option1.fill('Green');

      const correctAnswerRadio = page.getByTestId(`${TestId.QUIZ_CREATE_CORRECT_ANSWER_RADIO}-0`);
      await correctAnswerRadio.click();
      await page.waitForTimeout(500);
    });

    await logger.step('Verify progress bar shows 100%', async () => {
      const questionCounter = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 3 of 3');
    });

    await logger.step('Save the quiz', async () => {
      const saveButton = page.getByTestId(TestId.QUIZ_CREATE_SAVE_BUTTON);
      await expect(saveButton).toBeVisible({ timeout: 20000 });
      await expect(saveButton).not.toBeDisabled();
      await saveButton.click();
    });

    await logger.step('Verify redirect to dashboard after save', async () => {
      await expect(page).toHaveURL('/', { timeout: 20000 });
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Find and select the newly created quiz', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizTitle}"]`);
      await expect(quizRow).toBeVisible({ timeout: 20000 });
      await quizRow.click();
      await page.waitForTimeout(1000);
    });

    await logger.step('Click Take Quiz button', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizTitle}"]`);
      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await expect(takeButton).toBeVisible({ timeout: 20000 });
      await takeButton.click();
    });

    await logger.step('Verify quiz taking page loaded', async () => {
      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_TITLE)).toContainText(quizTitle);
      await expect(page.getByTestId(TestId.QUIZ_TAKE_PROGRESS_BAR)).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER)).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Answer Question 1: What is the capital of France?', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is the capital of France?');

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-0`);
      await expect(correctAnswerLabel).toContainText('Paris');
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);

      const answeredCounter = page.getByTestId(TestId.QUIZ_TAKE_ANSWERED_COUNTER);
      await expect(answeredCounter).toContainText('1 of 3 answered');
    });

    await logger.step('Navigate to Question 2', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const questionCounter = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 2 of 3');
    });

    await logger.step('Answer Question 2: What is 2 + 2?', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is 2 + 2?');

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await expect(correctAnswerLabel).toContainText('4');
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);

      const answeredCounter = page.getByTestId(TestId.QUIZ_TAKE_ANSWERED_COUNTER);
      await expect(answeredCounter).toContainText('2 of 3 answered');
    });

    await logger.step('Navigate to Question 3', async () => {
      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const questionCounter = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 3 of 3');
    });

    await logger.step('Answer Question 3: What color is the sky?', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What color is the sky?');

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-0`);
      await expect(correctAnswerLabel).toContainText('Blue');
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);

      const answeredCounter = page.getByTestId(TestId.QUIZ_TAKE_ANSWERED_COUNTER);
      await expect(answeredCounter).toContainText('3 of 3 answered');
    });

    await logger.step('Verify Submit button appears and is enabled', async () => {
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

      const scoreSection = page.getByTestId(TestId.QUIZ_REVIEW_SCORE);
      await expect(scoreSection).toContainText('3 of 3 correct');
    });

    await logger.step('Verify completion date is displayed', async () => {
      const completionDate = page.getByTestId(TestId.QUIZ_REVIEW_COMPLETION_DATE);
      await expect(completionDate).toBeVisible({ timeout: 20000 });
      await expect(completionDate).toContainText('Completed on');
    });

    await logger.step('Verify Question 1 shows correct result', async () => {
      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is the capital of France?');

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toBeVisible({ timeout: 20000 });
      await expect(resultIndicator).toContainText('Correct!');

      const yourAnswerLabel = page.getByTestId(TestId.QUIZ_REVIEW_YOUR_ANSWER_LABEL);
      await expect(yourAnswerLabel).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Navigate through all questions in review mode', async () => {
      const navDot1 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-1`);
      await navDot1.click();
      await page.waitForTimeout(500);

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is 2 + 2?');

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toContainText('Correct!');

      const navDot2 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-2`);
      await navDot2.click();
      await page.waitForTimeout(500);

      await expect(questionText).toContainText('What color is the sky?');
      await expect(resultIndicator).toContainText('Correct!');
    });

    await logger.step('Verify all question nav dots are visible', async () => {
      const navDot0 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-0`);
      const navDot1 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-1`);
      const navDot2 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-2`);

      await expect(navDot0).toBeVisible({ timeout: 20000 });
      await expect(navDot1).toBeVisible({ timeout: 20000 });
      await expect(navDot2).toBeVisible({ timeout: 20000 });
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
      await expect(page).toHaveURL('/auth', { timeout: 20000 });
    });
  });

  test('should handle incorrect answers correctly in review mode', async ({ page }) => {
    const logger = new TestStepLogger('Quiz Workflow with Mixed Correct/Incorrect Answers');
    const timestamp = Date.now();
    const quizTitle = `E2E Mixed Answers Quiz ${timestamp}`;

    await logger.step('Sign in as admin.michael.brown@gazzola.dev', async () => {
      await signInWithDevUser(page, 'admin.michael.brown@gazzola.dev');
    });

    await logger.step('Create new quiz with 2 questions', async () => {
      await page.waitForTimeout(2000);
      const addQuizButton = page.getByTestId(TestId.DASHBOARD_ADD_QUIZ_BUTTON);
      await addQuizButton.click();

      await expect(page).toHaveURL('/take-quiz/new', { timeout: 20000 });

      const titleInput = page.getByTestId(TestId.QUIZ_CREATE_TITLE_INPUT);
      await titleInput.fill(quizTitle);

      const descriptionInput = page.getByTestId(TestId.QUIZ_CREATE_DESCRIPTION_INPUT);
      await descriptionInput.fill('Test quiz for mixed answers');

      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await questionInput.fill('What is 1 + 1?');

      const option0 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-0`);
      await option0.fill('2');

      const option1 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-1`);
      await option1.fill('3');

      const correctAnswerRadio = page.getByTestId(`${TestId.QUIZ_CREATE_CORRECT_ANSWER_RADIO}-0`);
      await correctAnswerRadio.click();
      await page.waitForTimeout(500);

      const addQuestionButton = page.getByTestId(TestId.QUIZ_CREATE_ADD_QUESTION_BUTTON);
      await addQuestionButton.click();
      await page.waitForTimeout(1000);

      await questionInput.fill('What is the color of grass?');
      await option0.fill('Green');
      await option1.fill('Red');

      const correctAnswerRadio2 = page.getByTestId(`${TestId.QUIZ_CREATE_CORRECT_ANSWER_RADIO}-0`);
      await correctAnswerRadio2.click();
      await page.waitForTimeout(500);

      const saveButton = page.getByTestId(TestId.QUIZ_CREATE_SAVE_BUTTON);
      await saveButton.click();

      await expect(page).toHaveURL('/', { timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Take quiz with one correct and one incorrect answer', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizTitle}"]`);
      await quizRow.click();
      await page.waitForTimeout(1000);

      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await takeButton.click();

      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });

      const correctAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-0`);
      await correctAnswerLabel.click();
      await page.waitForTimeout(500);

      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const incorrectAnswerLabel = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await incorrectAnswerLabel.click();
      await page.waitForTimeout(500);

      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await submitButton.click();
      await page.waitForTimeout(3000);
    });

    await logger.step('Verify review mode shows 50% score', async () => {
      await expect(page.getByTestId(TestId.QUIZ_REVIEW_CONTAINER)).toBeVisible({ timeout: 20000 });

      const scorePercentage = page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE);
      await expect(scorePercentage).toContainText('50%');

      const scoreSection = page.getByTestId(TestId.QUIZ_REVIEW_SCORE);
      await expect(scoreSection).toContainText('1 of 2 correct');
    });

    await logger.step('Verify first question shows correct indicator', async () => {
      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toContainText('Correct!');
    });

    await logger.step('Navigate to second question and verify incorrect indicator', async () => {
      const navDot1 = page.getByTestId(`${TestId.QUIZ_TAKE_QUESTION_NAV_DOT}-1`);
      await navDot1.click();
      await page.waitForTimeout(500);

      const resultIndicator = page.getByTestId(TestId.QUIZ_REVIEW_RESULT_INDICATOR);
      await expect(resultIndicator).toContainText('Incorrect');

      const yourAnswerLabel = page.getByTestId(TestId.QUIZ_REVIEW_YOUR_ANSWER_LABEL);
      await expect(yourAnswerLabel).toBeVisible({ timeout: 20000 });

      const correctAnswerLabel = page.getByTestId(TestId.QUIZ_REVIEW_CORRECT_ANSWER_LABEL);
      await expect(correctAnswerLabel).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Clean up and sign out', async () => {
      const backButton = page.getByTestId(TestId.QUIZ_TAKE_BACK_TO_DASHBOARD);
      await backButton.click();
      await expect(page).toHaveURL('/', { timeout: 20000 });

      const avatarMenu = page.getByTestId(TestId.AUTH_AVATAR_MENU);
      await avatarMenu.click();
      const signOutButton = page.getByTestId(TestId.AUTH_SIGNOUT_BUTTON);
      await signOutButton.click();
      await expect(page).toHaveURL('/auth', { timeout: 20000 });
    });
  });
});
