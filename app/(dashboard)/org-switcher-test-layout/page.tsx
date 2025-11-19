"use client";

import { TestId } from "@/test.types";

export default function OrgSwitcherLayoutTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Layout Test</h1>
          <p className="text-muted-foreground">
            Org switcher is in the header (same as real dashboard)
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            data-testid={TestId.DASHBOARD_METRIC_TOTAL_QUIZZES}
            data-loading="false"
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
            </div>
            <p className="text-2xl font-bold">5</p>
          </div>

          <div
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            data-testid={TestId.DASHBOARD_METRIC_COMPLETED_TODAY}
            data-loading="false"
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
            </div>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>

        <div className="text-center text-muted-foreground">
          The OrganizationSelector is in the header above (rendered by layout.tsx)
        </div>
      </div>
    </div>
  );
}
