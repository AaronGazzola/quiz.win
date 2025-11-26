"use client";

import { useState } from "react";
import { useAppStore } from "@/app/layout.stores";
import { useGetLeaderboard } from "@/app/(dashboard)/gamification/gamification.hooks";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";
import { LeaderboardTimeframe } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";

export function LeaderboardPageContent() {
  const { user, selectedOrganizationIds } = useAppStore();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("ALL_TIME");

  const organizationId = selectedOrganizationIds[0] || "";

  const { data: leaderboardData, isLoading } = useGetLeaderboard(
    organizationId,
    timeframe,
    100
  );

  if (!organizationId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Please select an organization to view the leaderboard
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">
          Top performers in your organization
        </p>
      </div>

      <Tabs
        defaultValue="ALL_TIME"
        onValueChange={(value) => setTimeframe(value as LeaderboardTimeframe)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="ALL_TIME">All Time</TabsTrigger>
          <TabsTrigger value="MONTHLY">This Month</TabsTrigger>
          <TabsTrigger value="WEEKLY">This Week</TabsTrigger>
          <TabsTrigger value="DAILY">Today</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe}>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading leaderboard...
            </div>
          ) : (
            <LeaderboardTable
              entries={leaderboardData || []}
              currentUserId={user?.id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
