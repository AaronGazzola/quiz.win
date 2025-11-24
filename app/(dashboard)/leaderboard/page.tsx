import { Suspense } from "react";
import { LeaderboardPageContent } from "./page.content";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div>Loading leaderboard...</div>}>
      <LeaderboardPageContent />
    </Suspense>
  );
}
