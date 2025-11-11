import {
  Reporter,
  TestCase,
  TestResult,
  FullConfig,
  Suite,
  FullResult,
} from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

interface TestReport {
  testSuiteName: string;
  startTime: string;
  endTime: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  tests: Array<{
    title: string;
    status: string;
    duration: number;
    error?: string;
    errorStack?: string;
    screenshots?: string[];
    traces?: string[];
    videos?: string[];
  }>;
}

class ConsolidatedReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;
  private startTime!: Date;
  private testRunId!: string;
  private outputDir!: string;
  private testCount = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
    this.startTime = new Date();

    const timestamp = new Date()
      .toISOString()
      .replace(/T/, "_")
      .replace(/:/g, "-")
      .replace(/\..+/, "")
      .split("Z")[0];
    const milliseconds = new Date().getMilliseconds().toString().padStart(3, "0");
    const testFileName =
      suite.allTests()[0]?.location.file.split("/").pop()?.replace(".ts", "") ||
      "unknown";
    this.testRunId = `${timestamp.split(".")[0]}-${milliseconds}_${testFileName}`;

    process.env.TEST_RUN_ID = this.testRunId;

    this.outputDir = path.join(process.cwd(), "test-results", this.testRunId);
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const totalTests = suite.allTests().length;
    const workers = this.config.workers || 1;

    if (process.env.TEST_SUMMARY_ONLY !== "true") {
      console.log(`\nRunning ${totalTests} tests using ${workers} worker(s)\n`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testCount++;

    if (process.env.TEST_SUMMARY_ONLY === "true") {
      const status = result.status === "passed" ? "✓" : "✗";
      const duration = (result.duration / 1000).toFixed(1);
      const title =
        test.title.length > 40
          ? test.title.slice(0, 40) + "..."
          : test.title;
      console.log(`  ${status}  ${this.testCount} …${title} (${duration}s)`);
    }

    if (result.attachments.length > 0) {
      result.attachments.forEach((attachment) => {
        if (attachment.path && fs.existsSync(attachment.path)) {
          const fileName = path.basename(attachment.path);
          const destPath = path.join(this.outputDir, fileName);
          try {
            fs.copyFileSync(attachment.path, destPath);
          } catch (error) {
          }
        }
      });
    }
  }

  async onEnd(result: FullResult) {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    const allTests = this.suite.allTests();
    const summary = {
      total: allTests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    const tests: TestReport["tests"] = [];

    for (const test of allTests) {
      const testResult = test.results[0];
      const status = testResult?.status || "skipped";

      if (status === "passed") summary.passed++;
      else if (status === "failed" || status === "timedOut") summary.failed++;
      else summary.skipped++;

      const screenshots: string[] = [];
      const traces: string[] = [];
      const videos: string[] = [];

      if (testResult?.attachments) {
        for (const attachment of testResult.attachments) {
          if (attachment.name?.includes("screenshot") || attachment.contentType?.startsWith("image/")) {
            if (attachment.path) screenshots.push(path.basename(attachment.path));
          } else if (attachment.name?.includes("trace")) {
            if (attachment.path) traces.push(path.basename(attachment.path));
          } else if (attachment.name === "video") {
            if (attachment.path) videos.push(path.basename(attachment.path));
          }
        }
      }

      tests.push({
        title: test.title,
        status,
        duration: testResult?.duration || 0,
        error: testResult?.error?.message,
        errorStack: testResult?.error?.stack,
        screenshots: screenshots.length > 0 ? screenshots : undefined,
        traces: traces.length > 0 ? traces : undefined,
        videos: videos.length > 0 ? videos : undefined,
      });
    }

    const report: TestReport = {
      testSuiteName: this.testRunId,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      summary,
      tests,
    };

    const reportPath = path.join(this.outputDir, "test-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.generateReadme(report);

    const afterallFiles = fs
      .readdirSync(path.join(process.cwd(), "test-results"))
      .filter((f) => f.startsWith("afterall-call-"));

    if (afterallFiles.length > 0 && process.env.TEST_SUMMARY_ONLY === "true") {
      console.log("\n📊 Sub-Test Results:\n");
      for (const file of afterallFiles) {
        const data = JSON.parse(
          fs.readFileSync(
            path.join(process.cwd(), "test-results", file),
            "utf-8"
          )
        );
        if (data.tests) {
          data.tests.forEach((t: any) => {
            const status = t.passed ? "✓" : "✗";
            console.log(
              `  ${status} ${String(t.testNumber).padStart(3, "0")} …${t.testName.slice(0, 40)}`
            );
          });
        }
      }
      console.log(
        `\n${data.stats?.total || 0} sub-tests | ${data.stats?.passed || 0} passed | ${data.stats?.failed || 0} failed\n`
      );
    }
  }

  private generateReadme(report: TestReport) {
    const lines: string[] = [];

    lines.push(`# Test Report: ${report.testSuiteName}`);
    lines.push("");
    lines.push(`**Generated:** ${new Date(report.startTime).toLocaleString()}`);
    lines.push(`**Duration:** ${(report.duration / 1000).toFixed(2)}s`);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(`- **Total:** ${report.summary.total}`);
    lines.push(`- **✅ Passed:** ${report.summary.passed}`);
    lines.push(`- **❌ Failed:** ${report.summary.failed}`);
    lines.push(`- **⏭️  Skipped:** ${report.summary.skipped}`);
    lines.push("");

    const failedTests = report.tests.filter(
      (t) => t.status === "failed" || t.status === "timedOut"
    );

    if (failedTests.length > 0) {
      lines.push("## Failed Tests");
      lines.push("");

      failedTests.forEach((test) => {
        lines.push(`### ${test.title}`);
        lines.push("");
        lines.push(`**Status:** ${test.status.toUpperCase()}`);
        lines.push(`**Duration:** ${test.duration}ms`);
        lines.push("");

        if (test.error) {
          lines.push("**Error Message:**");
          lines.push("```");
          lines.push(test.error);
          lines.push("```");
          lines.push("");
        }

        if (test.errorStack) {
          lines.push("**Stack Trace:**");
          lines.push("```");
          lines.push(test.errorStack);
          lines.push("```");
          lines.push("");
        }

        if (test.screenshots && test.screenshots.length > 0) {
          lines.push("**Screenshots:**");
          test.screenshots.forEach((s) => {
            lines.push(`- ![${s}](${s})`);
          });
          lines.push("");
        }

        if (test.traces && test.traces.length > 0) {
          lines.push("**Trace Files:**");
          test.traces.forEach((t) => {
            lines.push(`- ${t}`);
            lines.push("  ```bash");
            lines.push(
              `  npx playwright show-trace test-results/${this.testRunId}/${t}`
            );
            lines.push("  ```");
          });
          lines.push("");
        }
      });
    }

    lines.push("## All Tests");
    lines.push("");
    report.tests.forEach((test) => {
      const icon =
        test.status === "passed"
          ? "✅"
          : test.status === "skipped"
          ? "⏭️"
          : "❌";
      lines.push(
        `- ${icon} **${test.title}** (${(test.duration / 1000).toFixed(2)}s)`
      );
    });

    const readmePath = path.join(this.outputDir, "README.md");
    fs.writeFileSync(readmePath, lines.join("\n"));
  }
}

export default ConsolidatedReporter;
