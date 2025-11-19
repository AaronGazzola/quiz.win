"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useAppStore } from "@/app/layout.stores";
import { Skeleton } from "@/components/ui/skeleton";
import { TestId } from "@/test.types";
import { useEffect, useState } from "react";

export default function OrgSwitcherFullTestPage() {
  const { isLoading } = useGetUser();
  const { user, selectedOrganizationIds } = useAppStore();
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      const timer = setTimeout(() => {
        setDataLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user]);

  const mockQuizzes = [
    { id: "1", title: "Patient Safety Quiz", created: "2024-01-15", questions: 10 },
    { id: "2", title: "HIPAA Compliance", created: "2024-01-20", questions: 15 },
    { id: "3", title: "Emergency Procedures", created: "2024-02-01", questions: 8 },
    { id: "4", title: "Medical Terminology", created: "2024-02-10", questions: 20 },
    { id: "5", title: "Infection Control", created: "2024-02-15", questions: 12 },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || "loading..."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            data-testid={TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}
            data-loading={dataLoading.toString()}
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
            </div>
            {dataLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{mockQuizzes.length}</p>
            )}
          </div>

          <div
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            data-testid={TestId.DASHBOARD_METRIC_COMPLETED_TODAY}
            data-loading={dataLoading.toString()}
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
            </div>
            {dataLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">2</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Quizzes</h2>
            <p className="text-muted-foreground">Select a quiz to view its responses</p>
          </div>

          <div className="rounded-md border" data-testid={TestId.DASHBOARD_QUIZ_TABLE}>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Created</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Qs</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dataLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : (
                  mockQuizzes.map((quiz, index) => (
                    <tr
                      key={quiz.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      data-testid={`${TestId.DASHBOARD_QUIZ_TABLE_ROW}-${index}`}
                    >
                      <td className="p-4 font-medium">{quiz.title}</td>
                      <td className="p-4 text-muted-foreground">{quiz.created}</td>
                      <td className="p-4 text-muted-foreground">{quiz.questions}</td>
                      <td className="p-4">
                        <button className="text-sm text-primary hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {mockQuizzes.length} quizzes
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Selected organizations: {selectedOrganizationIds.length}
        </div>
      </div>
    </div>
  );
}
