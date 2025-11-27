import { Star, TrendingUp } from "lucide-react";
import { UserGamificationProfile } from "@prisma/client";
import { getProgressToNextLevel } from "@/lib/gamification/levels.utils";
import { TestId } from "@/test.types";

interface PointsDisplayProps {
  profile: UserGamificationProfile;
  showProgress?: boolean;
}

export function PointsDisplay({
  profile,
  showProgress = true,
}: PointsDisplayProps) {
  const progress = getProgressToNextLevel(
    profile.experiencePoints,
    profile.level
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <span data-testid={TestId.GAMIFICATION_TOTAL_POINTS} className="text-2xl font-bold text-primary">
            {profile.totalPoints}
          </span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span data-testid={TestId.GAMIFICATION_LEVEL} className="text-lg font-semibold">Level {profile.level}</span>
        </div>
      </div>
      {showProgress && (
        <div data-testid={TestId.GAMIFICATION_XP_PROGRESS} className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {progress.current} / {progress.required} XP
            </span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
