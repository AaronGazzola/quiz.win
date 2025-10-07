import { defineConfig } from "@playwright/test";
import { configuration } from "./configuration";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: configuration.baseURL,
    trace: "on-first-retry",
  },
});
