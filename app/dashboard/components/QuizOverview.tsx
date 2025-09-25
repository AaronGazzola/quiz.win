"use client";

import { BookOpen, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useGetQuizzes } from "../quizzes/page.hooks";

interface QuizOverviewProps {
  organizationId: string;
}

export function QuizOverview({ organizationId }: QuizOverviewProps) {
  const { data: quizData, isLoading } = useGetQuizzes(organizationId);

  const recentQuizzes = quizData?.quizzes.slice(0, 5) || [];
  const totalQuizzes = quizData?.totalCount || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Quiz Overview</h2>
        <Link
          href="/dashboard/quizzes"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : totalQuizzes === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No quizzes created yet</p>
          <Link
            href="/dashboard/quizzes"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-gray-900">{totalQuizzes}</p>
              <p className="text-sm text-gray-500">Total Quizzes</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {recentQuizzes.reduce((sum, quiz) => sum + quiz._count.responses, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Responses</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {recentQuizzes.reduce((sum, quiz) => sum + quiz._count.questions, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Questions</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Quizzes</h3>
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{quiz.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {quiz._count.responses} responses
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}