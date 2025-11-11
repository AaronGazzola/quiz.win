import { test as base, expect as baseExpect, Page } from "@playwright/test";

interface DiagnosticData {
  consoleLogs: Array<{
    type: "log" | "warn" | "error" | "info" | "debug";
    text: string;
    timestamp: string;
    location?: { url: string; lineNumber: number; columnNumber: number };
  }>;
  pageErrors: Array<{
    message: string;
    stack?: string;
    timestamp: string;
  }>;
  networkFailures: Array<{
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    status: number;
    statusText: string;
    responseBody?: string;
    timestamp: string;
  }>;
  testContext?: {
    user?: string;
    conditions?: string;
    expectation?: string;
    observed?: string;
  };
}

interface DiagnosticsFixture {
  consoleLogs: DiagnosticData["consoleLogs"];
  pageErrors: DiagnosticData["pageErrors"];
  networkFailures: DiagnosticData["networkFailures"];
}

type CustomFixtures = {
  diagnostics: DiagnosticsFixture;
};

export const test = base.extend<CustomFixtures>({
  diagnostics: async ({ page }, use, testInfo) => {
    const consoleLogs: DiagnosticData["consoleLogs"] = [];
    const pageErrors: DiagnosticData["pageErrors"] = [];
    const networkFailures: DiagnosticData["networkFailures"] = [];

    page.on("console", async (msg) => {
      consoleLogs.push({
        type: msg.type() as DiagnosticData["consoleLogs"][0]["type"],
        text: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location() || undefined,
      });
    });

    page.on("pageerror", (error) => {
      pageErrors.push({
        message: error.message,
        stack: error.stack || undefined,
        timestamp: new Date().toISOString(),
      });
    });

    page.on("response", async (response) => {
      if (response.status() >= 400) {
        let responseBody: string | undefined;
        try {
          const contentType = response.headers()["content-type"] || "";
          if (contentType.includes("application/json")) {
            responseBody = JSON.stringify(await response.json(), null, 2);
          } else if (contentType.includes("text/")) {
            responseBody = await response.text();
          }
        } catch (e) {
          responseBody = undefined;
        }

        networkFailures.push({
          url: response.url(),
          method: response.request().method() as DiagnosticData["networkFailures"][0]["method"],
          status: response.status(),
          statusText: response.statusText(),
          responseBody,
          timestamp: new Date().toISOString(),
        });
      }
    });

    const diagnostics = { consoleLogs, pageErrors, networkFailures };

    await use(diagnostics);

    if (testInfo.status !== "passed") {
      const diagnosticData: DiagnosticData = {
        consoleLogs,
        pageErrors,
        networkFailures,
      };

      await testInfo.attach("diagnostic-data", {
        body: JSON.stringify(diagnosticData, null, 2),
        contentType: "application/json",
      });
    }
  },
});

export { baseExpect as expect };
