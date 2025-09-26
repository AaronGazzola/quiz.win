export const configuration = {
  paths: {
    signIn: "/sign-in",
    home: "/dashboard",
    admin: "/dashboard/admin",
    quizzes: "/dashboard/quizzes",
  },
};

export const privatePaths = [
  "/dashboard",
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