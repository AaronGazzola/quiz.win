export function calculateLevel(experiencePoints: number): number {
  if (experiencePoints < 100) return 1;
  if (experiencePoints < 250) return 2;
  if (experiencePoints < 500) return 3;
  if (experiencePoints < 850) return 4;
  if (experiencePoints < 1300) return 5;
  if (experiencePoints < 1900) return 6;
  if (experiencePoints < 2600) return 7;
  if (experiencePoints < 3400) return 8;
  if (experiencePoints < 4300) return 9;
  if (experiencePoints < 5300) return 10;
  if (experiencePoints < 6500) return 11;
  if (experiencePoints < 7900) return 12;
  if (experiencePoints < 9500) return 13;
  if (experiencePoints < 11300) return 14;
  if (experiencePoints < 13300) return 15;
  if (experiencePoints < 15600) return 16;
  if (experiencePoints < 18200) return 17;
  if (experiencePoints < 21100) return 18;
  if (experiencePoints < 24300) return 19;
  if (experiencePoints < 27800) return 20;
  if (experiencePoints < 32000) return 21;
  if (experiencePoints < 36800) return 22;
  if (experiencePoints < 42200) return 23;
  if (experiencePoints < 48200) return 24;
  return Math.floor(25 + (experiencePoints - 48200) / 7000);
}

export function getExperienceForNextLevel(currentLevel: number): number {
  const levels = [
    0, 100, 250, 500, 850, 1300, 1900, 2600, 3400, 4300, 5300, 6500, 7900,
    9500, 11300, 13300, 15600, 18200, 21100, 24300, 27800, 32000, 36800, 42200,
    48200,
  ];

  if (currentLevel < 25) {
    return levels[currentLevel];
  }

  return 48200 + (currentLevel - 24) * 7000;
}

export function getProgressToNextLevel(
  experiencePoints: number,
  currentLevel: number
): {
  current: number;
  required: number;
  percentage: number;
} {
  const currentLevelXP = getExperienceForNextLevel(currentLevel - 1);
  const nextLevelXP = getExperienceForNextLevel(currentLevel);
  const progressXP = experiencePoints - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;

  return {
    current: progressXP,
    required: requiredXP,
    percentage: Math.min(100, Math.floor((progressXP / requiredXP) * 100)),
  };
}

export function checkLevelUp(
  oldExperience: number,
  newExperience: number
): { leveledUp: boolean; oldLevel: number; newLevel: number } {
  const oldLevel = calculateLevel(oldExperience);
  const newLevel = calculateLevel(newExperience);

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}
