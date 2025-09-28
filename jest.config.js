module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "app/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 30000,
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    "node_modules/(?!(better-auth|@noble/ciphers|@noble/hashes)/)"
  ],
  projects: [
    {
      displayName: "node",
      preset: "ts-jest",
      testEnvironment: "node",
      extensionsToTreatAsEsm: ['.ts'],
      transformIgnorePatterns: [
        "node_modules/(?!(better-auth|@noble/ciphers|@noble/hashes)/)"
      ],
      transform: {
        "^.+\\.ts$": "ts-jest",
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "**/__tests__/stress/**/*.test.ts",
        "**/__tests__/auth/**/*.test.ts",
      ],
    },
    {
      displayName: "jsdom",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: {
              jsx: "react-jsx",
            },
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "**/__tests__/lib/**/*.test.ts",
        "**/__tests__/pages/**/*.test.ts",
      ],
    },
  ],
};
