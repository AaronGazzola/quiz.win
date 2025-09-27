"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";
import { useGetQuizForTaking, useSubmitResponse, useGetExistingResponse } from "./page.hooks";
import { useQuizPlayerStore } from "./page.stores";

export default function TakeQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: user } = useGetUser();
  const quizId = Array.isArray(id) ? id[0] : id;

  const { data: quiz, isLoading: quizLoading } = useGetQuizForTaking(quizId || "");
  const { data: existingResponse, isLoading: responseLoading } = useGetExistingResponse(quizId || "");
  const submitResponseMutation = useSubmitResponse();

  const {
    currentQuestionIndex,
    answers,
    isSubmitting,
    setCurrentQuestion,
    setAnswer,
    completeQuiz,
    initializeAnswers
  } = useQuizPlayerStore();

  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (quiz && answers.length === 0 && quiz.questions.length > 0) {
      initializeAnswers(quiz.questions.length);
    }
  }, [quiz?.questions.length, answers.length, initializeAnswers]);

  if (!user) return null;

  if (quizLoading || responseLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz?.questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Quiz not found</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go back
        </button>
      </div>
    );
  }

  if (existingResponse && existingResponse.score !== null) {
    const userAnswers = Array.isArray(existingResponse.answers)
      ? existingResponse.answers as { questionId: string; selectedAnswer: string; isCorrect: boolean }[]
      : [];
    const scorePercentage = Math.round((existingResponse.score || 0) * 100);
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentUserAnswer = userAnswers.find(a => a.questionId === currentQuestion?.id);
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mr-2" />
                  {quiz.title} - Review
                </h1>
                {quiz.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{quiz.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {scorePercentage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {correctAnswers} of {quiz.questions.length} correct
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Completed on {new Date(existingResponse.completedAt).toLocaleDateString()}
              </div>
              <div>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-50 mb-4">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => {
                  const isUserSelected = currentUserAnswer?.selectedAnswer === option;
                  const isCorrect = currentQuestion.correctAnswer === option;
                  const isUserCorrect = currentUserAnswer?.isCorrect && isUserSelected;
                  const isUserWrong = !currentUserAnswer?.isCorrect && isUserSelected;

                  return (
                    <div
                      key={optionIndex}
                      className={cn(
                        "flex items-center p-4 border-2 rounded-lg",
                        isUserCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400"
                          : isUserWrong
                          ? "border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400"
                          : isCorrect
                          ? "border-green-300 bg-green-25 dark:bg-green-900/20 dark:border-green-500"
                          : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center",
                          isUserSelected
                            ? isUserCorrect
                              ? "border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400"
                              : "border-red-500 bg-red-500 dark:border-red-400 dark:bg-red-400"
                            : isCorrect
                            ? "border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400"
                            : "border-gray-300 dark:border-gray-500"
                        )}
                      >
                        {(isUserSelected || isCorrect) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={cn(
                        "flex-1",
                        isUserSelected || isCorrect
                          ? "text-gray-900 dark:text-gray-100 font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      )}>
                        {option}
                      </span>
                      {isUserSelected && (
                        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          Your answer
                        </span>
                      )}
                      {isCorrect && !isUserSelected && (
                        <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                          Correct answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {currentUserAnswer && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm">
                    {currentUserAnswer.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-2" />
                    )}
                    <span className={cn(
                      "font-medium",
                      currentUserAnswer.isCorrect
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    )}>
                      {currentUserAnswer.isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-2">
                {quiz.questions.map((_, index) => {
                  const questionAnswer = userAnswers.find(a => a.questionId === quiz.questions[index].id);
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={cn(
                        "w-8 h-8 rounded-full text-sm font-medium border-2",
                        index === currentQuestionIndex
                          ? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400"
                          : questionAnswer?.isCorrect
                          ? "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-400"
                          : questionAnswer
                          ? "border-red-500 bg-red-500 text-white dark:border-red-400 dark:bg-red-400"
                          : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }


  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setAnswer(currentQuestionIndex, answer);
  };

  const handleSubmitQuiz = async () => {
    const responses = quiz.questions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: answers[index],
      isCorrect: answers[index] === question.correctAnswer
    }));

    const score = responses.filter(r => r.isCorrect).length / responses.length;
    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);

    await submitResponseMutation.mutateAsync({
      quizId: quiz.id,
      answers: responses,
      score,
      timeSpent: timeSpentMinutes
    });

    completeQuiz();
    router.push(`/quiz-results/${quiz.id}`);
  };

  const answeredCount = answers.filter(answer => answer !== null).length;
  const allAnswered = answeredCount === quiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">{quiz.description}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="mt-1">
              {answeredCount} of {quiz.questions.length} answered
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-50 mb-4">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={cn(
                    "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    currentAnswer === option
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center",
                      currentAnswer === option
                        ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                        : "border-gray-300 dark:border-gray-500"
                    )}
                  >
                    {currentAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium border-2",
                    index === currentQuestionIndex
                      ? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400"
                      : answers[index] !== null
                      ? "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-400"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isLastQuestion && allAnswered ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitResponseMutation.isPending || isSubmitting}
                className="flex items-center px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitResponseMutation.isPending || isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLastQuestion}
                className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}