import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: process.env.TRACE === "true" ? "on" : "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.TRACE === "true" ? "on" : "off",
  },
  outputDir: process.env.TEST_RUN_ID
    ? `test-results/${process.env.TEST_RUN_ID}`
    : "test-results/default",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
  timeout: 120000,
});
