import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120000,
  reporter: [["list"], ["./e2e/utils/consolidated-reporter.ts"]],
  outputDir: process.env.TEST_RUN_ID
    ? `test-results/${process.env.TEST_RUN_ID}`
    : "test-results/default",
  use: {
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
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
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
      },
});
