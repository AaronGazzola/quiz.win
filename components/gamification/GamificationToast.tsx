import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { Achievement } from "@prisma/client";

interface GamificationToastProps {
  points: number;
  achievements?: Achievement[];
  levelUp?: { oldLevel: number; newLevel: number };
}

export function GamificationToast({
  points,
  achievements = [],
  levelUp,
}: GamificationToastProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-[300px]">
      <div className="flex items-start gap-3">
        <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">Quiz Complete!</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">+{points}</span> points
            </span>
            {levelUp && (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                Level {levelUp.newLevel}!
              </span>
            )}
          </div>
          {achievements.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                <Award className="w-3 h-3" />
                Achievements Unlocked:
              </div>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <span
                    key={a.id}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
