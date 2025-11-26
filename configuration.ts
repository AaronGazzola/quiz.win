export const configuration = {
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  paths: {
    signIn: "/auth",
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