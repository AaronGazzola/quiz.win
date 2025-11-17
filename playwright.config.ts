import { defineConfig, devices } from "@playwright/test";

import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["./e2e/utils/consolidated-reporter.ts"]],
  outputDir: process.env.TEST_RUN_ID
    ? `test-results/${process.env.TEST_RUN_ID}`
    : "test-results/default",
  timeout: 120000,
  use: {
    baseURL: baseURL,
    trace: process.env.TEST_TRACE === "true" ? "on" : "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
