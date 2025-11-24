import { LeaderboardEntry } from "@prisma/client";
import { Trophy, Medal, Award } from "lucide-react";
import { formatRank } from "@/lib/gamification/leaderboard.utils";

interface LeaderboardTableProps {
  entries: (LeaderboardEntry & { user?: { name: string | null; email: string; image: string | null } })[];
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Points
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quizzes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Avg Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {entries.map((entry) => {
              const isCurrentUser = currentUserId === entry.userId;
              return (
                <tr
                  key={entry.id}
                  className={`${
                    isCurrentUser ? "bg-primary/5" : "hover:bg-muted/30"
                  } transition-colors`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span
                        className={`text-sm font-semibold ${
                          entry.rank <= 3 ? "text-primary" : ""
                        }`}
                      >
                        {formatRank(entry.rank)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {entry.user?.image && (
                        <img
                          src={entry.user.image}
                          alt={entry.user.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          {entry.user?.name || "Unknown User"}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary font-semibold">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-primary">
                      {entry.totalPoints.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-muted-foreground">
                    {entry.quizzesCompleted}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-muted-foreground">
                    {Math.round(entry.averageScore * 100)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No leaderboard data available yet
        </div>
      )}
    </div>
  );
}
