import { Achievement } from "@prisma/client";
import { Trophy, Award, Medal, Crown, Star, Sparkles, Gem, Target, TrendingUp, GraduationCap, BookOpen, StarHalf, Flame, Briefcase } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
}

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  award: Award,
  medal: Medal,
  crown: Crown,
  star: Star,
  sparkles: Sparkles,
  gem: Gem,
  target: Target,
  "trending-up": TrendingUp,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  "star-half": StarHalf,
  flame: Flame,
  briefcase: Briefcase,
};

const tierColors = {
  BRONZE: "text-amber-700 bg-amber-50 border-amber-200",
  SILVER: "text-gray-600 bg-gray-50 border-gray-300",
  GOLD: "text-yellow-600 bg-yellow-50 border-yellow-300",
  PLATINUM: "text-cyan-600 bg-cyan-50 border-cyan-300",
  DIAMOND: "text-blue-600 bg-blue-50 border-blue-300",
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

const iconSizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export function AchievementBadge({
  achievement,
  unlocked = true,
  size = "md",
}: AchievementBadgeProps) {
  const Icon = iconMap[achievement.iconName || "trophy"] || Trophy;
  const tierColor = tierColors[achievement.tier];

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeClasses[size]} rounded-full border-2 ${
        unlocked ? tierColor : "bg-gray-100 border-gray-300 text-gray-400"
      } ${!unlocked ? "opacity-50" : ""}`}
      title={achievement.name}
    >
      <Icon className={iconSizeClasses[size]} />
    </div>
  );
}
