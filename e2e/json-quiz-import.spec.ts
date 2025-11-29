import { test, expect } from './utils/test-fixtures';
import { TestId } from '../test.types';
import { TestStepLogger } from './utils/test-logger';
import { signInWithDevUser } from './utils/auth-helper';

test.describe.configure({ workers: 1 });

test.describe('JSON Quiz Import Tests', () => {
  const testQuizJson = {
    title: "E2E JSON Import Test Quiz",
    description: "Test quiz created via JSON import",
    questions: [
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1
      },
      {
        question: "What color is the sky?",
        options: ["Red", "Blue", "Green"],
        correctAnswer: 1
      }
    ]
  };

  test.beforeEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: { quizTitlePrefix: 'E2E JSON' },
      });
    } catch (error) {
      console.log('Pre-cleanup skipped:', error);
    }
  });

  test.afterEach(async ({ request }) => {
    try {
      await request.post('/api/test-cleanup', {
        data: { quizTitlePrefix: 'E2E JSON' },
      });
    } catch (error) {
      console.log('Cleanup skipped:', error);
    }
  });

  test('should create quiz from pasted JSON', async ({ page }) => {
    const logger = new TestStepLogger('JSON Paste Import: Create and Verify Quiz');
    const timestamp = Date.now();
    const quizJson = {
      ...testQuizJson,
      title: `E2E JSON Paste Quiz ${timestamp}`
    };

    await logger.step('Sign in as admin.michael.brown@gazzola.dev', async () => {
      await signInWithDevUser(page, 'admin.michael.brown@gazzola.dev');
    });

    await logger.step('Wait for dashboard to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Navigate to quiz creation page', async () => {
      const addQuizButton = page.getByTestId(TestId.DASHBOARD_ADD_QUIZ_BUTTON);
      await expect(addQuizButton).toBeVisible({ timeout: 20000 });
      await addQuizButton.click();
      await expect(page).toHaveURL('/take-quiz/new', { timeout: 20000 });
    });

    await logger.step('Open JSON import popover', async () => {
      const jsonBadge = page.getByTestId(TestId.QUIZ_CREATE_JSON_IMPORT_BADGE);
      await expect(jsonBadge).toBeVisible({ timeout: 20000 });
      await jsonBadge.click();
      await page.waitForTimeout(500);
    });

    await logger.step('Paste JSON into textarea', async () => {
      const textarea = page.getByTestId(TestId.QUIZ_CREATE_JSON_IMPORT_TEXTAREA);
      await expect(textarea).toBeVisible({ timeout: 20000 });
      await textarea.fill(JSON.stringify(quizJson));
    });

    await logger.step('Click Import JSON button', async () => {
      const importButton = page.getByTestId(TestId.QUIZ_CREATE_JSON_IMPORT_BUTTON);
      await expect(importButton).toBeVisible({ timeout: 20000 });
      await importButton.click();
      await page.waitForTimeout(1000);
    });

    await logger.step('Verify quiz title was populated', async () => {
      const titleInput = page.getByTestId(TestId.QUIZ_CREATE_TITLE_INPUT);
      await expect(titleInput).toHaveValue(quizJson.title, { timeout: 20000 });
    });

    await logger.step('Verify quiz description was populated', async () => {
      const descriptionInput = page.getByTestId(TestId.QUIZ_CREATE_DESCRIPTION_INPUT);
      await expect(descriptionInput).toHaveValue(quizJson.description, { timeout: 20000 });
    });

    await logger.step('Verify question counter shows 2 questions', async () => {
      const questionCounter = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 1 of 2', { timeout: 20000 });
    });

    await logger.step('Verify first question content', async () => {
      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await expect(questionInput).toHaveValue(quizJson.questions[0].question, { timeout: 20000 });

      const option0 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-0`);
      await expect(option0).toHaveValue(quizJson.questions[0].options[0], { timeout: 20000 });

      const option1 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-1`);
      await expect(option1).toHaveValue(quizJson.questions[0].options[1], { timeout: 20000 });
    });

    await logger.step('Navigate to second question and verify content', async () => {
      const navDot1 = page.getByTestId(`${TestId.QUIZ_CREATE_QUESTION_NAV_DOT}-1`);
      await navDot1.click();
      await page.waitForTimeout(500);

      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await expect(questionInput).toHaveValue(quizJson.questions[1].question, { timeout: 20000 });

      const option0 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-0`);
      await expect(option0).toHaveValue(quizJson.questions[1].options[0], { timeout: 20000 });

      const option1 = page.getByTestId(`${TestId.QUIZ_CREATE_OPTION_INPUT}-1`);
      await expect(option1).toHaveValue(quizJson.questions[1].options[1], { timeout: 20000 });
    });

    await logger.step('Save the quiz', async () => {
      const saveButton = page.getByTestId(TestId.QUIZ_CREATE_SAVE_BUTTON);
      await expect(saveButton).toBeVisible({ timeout: 20000 });
      await saveButton.click();
      await expect(page).toHaveURL('/', { timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify quiz appears in dashboard', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizJson.title}"]`);
      await expect(quizRow).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Take the imported quiz to verify questions', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizJson.title}"]`);
      await quizRow.click();
      await page.waitForTimeout(500);

      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await takeButton.click();

      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is 2 + 2?', { timeout: 20000 });
    });

    await logger.step('Answer questions and submit', async () => {
      const answer0 = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await answer0.click();
      await page.waitForTimeout(500);

      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answer1 = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await answer1.click();
      await page.waitForTimeout(500);

      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await submitButton.click();
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify 100% score', async () => {
      const scorePercentage = page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE);
      await expect(scorePercentage).toContainText('100%', { timeout: 20000 });
    });

    await logger.step('Navigate back and sign out', async () => {
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

  test('should create quiz from dropped JSON file', async ({ page }) => {
    const logger = new TestStepLogger('JSON Drag-Drop Import: Create and Verify Quiz');
    const timestamp = Date.now();
    const quizJson = {
      ...testQuizJson,
      title: `E2E JSON Drop Quiz ${timestamp}`
    };

    await logger.step('Sign in as admin.michael.brown@gazzola.dev', async () => {
      await signInWithDevUser(page, 'admin.michael.brown@gazzola.dev');
    });

    await logger.step('Wait for dashboard to load', async () => {
      const quizTable = page.getByTestId(TestId.DASHBOARD_QUIZ_TABLE);
      await expect(quizTable).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Navigate to quiz creation page', async () => {
      const addQuizButton = page.getByTestId(TestId.DASHBOARD_ADD_QUIZ_BUTTON);
      await expect(addQuizButton).toBeVisible({ timeout: 20000 });
      await addQuizButton.click();
      await expect(page).toHaveURL('/take-quiz/new', { timeout: 20000 });
    });

    await logger.step('Simulate JSON file drop', async () => {
      const container = page.getByTestId(TestId.QUIZ_CREATE_CONTAINER);
      await expect(container).toBeVisible({ timeout: 20000 });

      const jsonContent = JSON.stringify(quizJson);

      await page.evaluate((content) => {
        const container = document.querySelector('[data-testid="quiz-create-container"]');
        if (!container) throw new Error('Container not found');

        const file = new File([content], 'quiz.json', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        });
        container.dispatchEvent(dragEnterEvent);

        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        });
        container.dispatchEvent(dropEvent);
      }, jsonContent);

      await page.waitForTimeout(1500);
    });

    await logger.step('Verify quiz title was populated', async () => {
      const titleInput = page.getByTestId(TestId.QUIZ_CREATE_TITLE_INPUT);
      await expect(titleInput).toHaveValue(quizJson.title, { timeout: 20000 });
    });

    await logger.step('Verify quiz description was populated', async () => {
      const descriptionInput = page.getByTestId(TestId.QUIZ_CREATE_DESCRIPTION_INPUT);
      await expect(descriptionInput).toHaveValue(quizJson.description, { timeout: 20000 });
    });

    await logger.step('Verify question counter shows 2 questions', async () => {
      const questionCounter = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_COUNTER);
      await expect(questionCounter).toContainText('Question 1 of 2', { timeout: 20000 });
    });

    await logger.step('Verify first question content', async () => {
      const questionInput = page.getByTestId(TestId.QUIZ_CREATE_QUESTION_INPUT);
      await expect(questionInput).toHaveValue(quizJson.questions[0].question, { timeout: 20000 });
    });

    await logger.step('Save the quiz', async () => {
      const saveButton = page.getByTestId(TestId.QUIZ_CREATE_SAVE_BUTTON);
      await expect(saveButton).toBeVisible({ timeout: 20000 });
      await saveButton.click();
      await expect(page).toHaveURL('/', { timeout: 20000 });
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify quiz appears in dashboard', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizJson.title}"]`);
      await expect(quizRow).toBeVisible({ timeout: 20000 });
    });

    await logger.step('Take the imported quiz to verify questions', async () => {
      const quizRow = page.locator(`[data-quiz-title="${quizJson.title}"]`);
      await quizRow.click();
      await page.waitForTimeout(500);

      const takeButton = quizRow.locator(`[data-testid^="${TestId.DASHBOARD_QUIZ_TAKE_BUTTON}"]`);
      await takeButton.click();

      await expect(page.getByTestId(TestId.QUIZ_TAKE_CONTAINER)).toBeVisible({ timeout: 20000 });

      const questionText = page.getByTestId(TestId.QUIZ_TAKE_QUESTION_TEXT);
      await expect(questionText).toContainText('What is 2 + 2?', { timeout: 20000 });
    });

    await logger.step('Answer questions and submit', async () => {
      const answer0 = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await answer0.click();
      await page.waitForTimeout(500);

      const nextButton = page.getByTestId(TestId.QUIZ_TAKE_NEXT_BUTTON);
      await nextButton.click();
      await page.waitForTimeout(500);

      const answer1 = page.getByTestId(`${TestId.QUIZ_TAKE_ANSWER_LABEL}-1`);
      await answer1.click();
      await page.waitForTimeout(500);

      const submitButton = page.getByTestId(TestId.QUIZ_TAKE_SUBMIT_BUTTON);
      await submitButton.click();
      await page.waitForTimeout(2000);
    });

    await logger.step('Verify 100% score', async () => {
      const scorePercentage = page.getByTestId(TestId.QUIZ_REVIEW_SCORE_PERCENTAGE);
      await expect(scorePercentage).toContainText('100%', { timeout: 20000 });
    });

    await logger.step('Navigate back and sign out', async () => {
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
