export const configuration = {
  paths: {
    signIn: "/sign-in",
    home: "/",
    admin: "/admin",
    quizzes: "/quizzes",
  },
};

export const privatePaths = [
  "/",
  "/quizzes",
  "/users",
  "/invite",
  "/take-quiz",
];

export const adminPaths = [
  "/admin",
  "/users",
  "/invite",
];

export const roles = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
} as const;

export type UserRole = typeof roles[keyof typeof roles];