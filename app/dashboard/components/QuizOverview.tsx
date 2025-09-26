"use client";

import { BookOpen, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useGetQuizzes } from "../quizzes/page.hooks";
import { useGetUser } from "@/app/layout.hooks";
import { useGetUserOrganizations } from "../quizzes/page.hooks";

interface QuizOverviewProps {
  organizationId: string;
}

export function QuizOverview({ organizationId }: QuizOverviewProps) {
  const { data: quizData, isLoading } = useGetQuizzes(organizationId);
  const { data: user } = useGetUser();
  const { data: organizations } = useGetUserOrganizations();

  const currentOrg = organizations?.find(org => org.id === organizationId);
  const isAdmin = currentOrg?.role === "admin" || currentOrg?.role === "owner";
  const isSuperAdmin = user?.role === "super-admin";

  const recentQuizzes = quizData?.quizzes.slice(0, 5) || [];
  const totalQuizzes = quizData?.totalCount || 0;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quiz Overview</h2>
        <Link
          href="/dashboard/quizzes"
          className="text-sm text-primary hover:text-primary/80"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      ) : totalQuizzes === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          {(isAdmin || isSuperAdmin) ? (
            <>
              <p className="text-muted-foreground mb-4">No quizzes created yet</p>
              <Link
                href="/dashboard/quizzes"
                className="inline-flex items-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Create Your First Quiz
              </Link>
            </>
          ) : (
            <p className="text-muted-foreground mb-4">No quizzes available yet</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentQuizzes.reduce((sum, quiz) => sum + quiz._count.responses, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentQuizzes.reduce((sum, quiz) => sum + quiz._count.questions, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Recent Quizzes</h3>
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
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