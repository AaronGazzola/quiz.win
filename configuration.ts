export const configuration = {
  paths: {
    signIn: "/sign-in",
    home: "/dashboard",
    onboarding: "/onboarding",
    admin: "/dashboard/admin",
    quizzes: "/dashboard/quizzes",
  },
};

export const privatePaths = [
  "/dashboard",
  "/onboarding",
];

export const adminPaths = [
  "/dashboard/admin",
];

export const roles = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
} as const;

export type UserRole = typeof roles[keyof typeof roles];