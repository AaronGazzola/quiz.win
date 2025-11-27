import { Reporter, TestCase, TestResult, FullResult, Suite, FullConfig, TestStep } from '@playwright/test/reporter';
import * as path from 'path';
import * as fs from 'fs';

const MAX_CHARS = 25000;
const BASE_PATH = process.cwd();

const KEY_MAP: Record<string, string> = {
  summary: 'sum', total: 'tot', passed: 'p', failed: 'f', skipped: 'sk',
  duration: 'd', timestamp: 'ts', outputDirectory: 'out', tests: 'tst',
  title: 't', file: 'fl', status: 's', error: 'e', errorStack: 'es',
  screenshots: 'ss', traces: 'tr', videos: 'v', stdout: 'so', stderr: 'se',
  steps: 'st', consoleLogs: 'cl', pageErrors: 'pe', networkFailures: 'nf',
  testContext: 'tc', domSnapshot: 'dom', category: 'cat', startTime: 'start',
  message: 'msg', stack: 'stk', location: 'loc', text: 'txt', type: 'typ',
  url: 'u', method: 'm', statusText: 'stxt', responseBody: 'rb',
  user: 'usr', conditions: 'cond', expectation: 'exp', observed: 'obs'
};

function truncStr(str: string, max: number, suffix = '…'): string {
  if (!str || str.length <= max) return str;
  return str.slice(0, max - suffix.length) + suffix;
}

function minifyPath(p: string): string {
  return p.replace(BASE_PATH + '/', '').replace(/^\/Users\/[^/]+\/[^/]+\/[^/]+\//, '');
}

function minifyStack(stack: string | undefined, maxLines = 5): string {
  if (!stack) return '';
  const lines = stack.split('\n').slice(0, maxLines);
  return lines.map(l => minifyPath(l)).join('\n');
}

function minifySteps(steps: TestStepData[], maxTotal = 15): TestStepData[] {
  if (steps.length <= maxTotal) return steps;
  const failed = steps.filter(s => s.status === 'failed');
  const passed = steps.filter(s => s.status === 'passed');
  const keep = Math.max(5, maxTotal - failed.length);
  const first = passed.slice(0, Math.floor(keep / 2));
  const last = passed.slice(-Math.ceil(keep / 2));
  const kept = [...first, ...failed, ...last];
  const unique = kept.filter((s, i) => kept.findIndex(x => x.title === s.title && x.startTime === s.startTime) === i);
  return unique.sort((a, b) => a.startTime - b.startTime);
}

function minifyConsoleLogs(logs: ConsoleLog[], maxPerType = 5): ConsoleLog[] {
  const byType: Record<string, ConsoleLog[]> = {};
  logs.forEach(log => {
    if (!byType[log.type]) byType[log.type] = [];
    byType[log.type].push(log);
  });
  const result: ConsoleLog[] = [];
  Object.values(byType).forEach(typeLogs => {
    result.push(...typeLogs.slice(0, maxPerType).map(log => ({
      ...log,
      text: truncStr(log.text, 200),
      location: log.location ? minifyPath(log.location) : undefined
    })));
  });
  return result;
}

function minifyNetworkFailures(failures: NetworkFailure[], maxBody = 300): NetworkFailure[] {
  return failures.slice(0, 5).map(f => ({
    ...f,
    responseBody: f.responseBody ? truncStr(f.responseBody, maxBody) : undefined
  }));
}

function minifyDomSnapshot(dom: string | undefined, maxChars = 2000): string {
  if (!dom) return '';
  const lines = dom.split('\n');
  const important = lines.filter(l =>
    l.includes('data-testid') || l.includes('button') || l.includes('input') ||
    l.includes('link') || l.includes('textbox') || l.includes('heading') ||
    l.includes('[ref=') || l.includes('error') || l.includes('Error')
  );
  let result = important.join('\n');
  if (result.length > maxChars) {
    result = result.slice(0, maxChars - 20) + '\n…[truncated]';
  }
  return result || truncStr(dom, maxChars);
}

function compactKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(compactKeys);
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const newKey = KEY_MAP[k] || k;
      result[newKey] = compactKeys(v);
    }
    return result;
  }
  return obj;
}

function minifyTestData(test: any, isFailed: boolean): any {
  const minified = {
    title: test.title,
    file: minifyPath(test.file),
    status: test.status,
    duration: test.duration,
    ...(test.error ? { error: truncStr(test.error, 300) } : {}),
    ...(test.errorStack ? { errorStack: minifyStack(test.errorStack) } : {}),
    ...(test.screenshots?.length ? { screenshots: test.screenshots } : {}),
    ...(test.traces?.length ? { traces: test.traces } : {}),
    ...(test.steps?.length ? { steps: minifySteps(test.steps, isFailed ? 20 : 10) } : {}),
    ...(test.consoleLogs?.length && isFailed ? { consoleLogs: minifyConsoleLogs(test.consoleLogs) } : {}),
    ...(test.pageErrors?.length && isFailed ? { pageErrors: test.pageErrors.slice(0, 3).map((e: PageError) => ({
      message: truncStr(e.message, 200),
      stack: minifyStack(e.stack, 3),
      timestamp: e.timestamp
    })) } : {}),
    ...(test.networkFailures?.length && isFailed ? { networkFailures: minifyNetworkFailures(test.networkFailures) } : {}),
    ...(test.testContext ? { testContext: test.testContext } : {}),
    ...(test.domSnapshot && isFailed ? { domSnapshot: minifyDomSnapshot(test.domSnapshot) } : {})
  };
  return minified;
}

function enforceJsonLimit(data: any, maxChars: number): string {
  let json = JSON.stringify(compactKeys(data));
  if (json.length <= maxChars) return json;
  const stripped = { ...data };
  if (stripped.tests) {
    stripped.tests = stripped.tests.map((t: any) => {
      const m = { ...t };
      delete m.domSnapshot;
      delete m.stdout;
      delete m.stderr;
      if (m.steps) m.steps = minifySteps(m.steps, 10);
      return m;
    });
  }
  json = JSON.stringify(compactKeys(stripped));
  if (json.length <= maxChars) return json;
  if (stripped.tests) {
    stripped.tests = stripped.tests.map((t: any) => {
      const m = { ...t };
      delete m.consoleLogs;
      delete m.networkFailures;
      delete m.pageErrors;
      if (m.steps) m.steps = minifySteps(m.steps, 5);
      return m;
    });
  }
  json = JSON.stringify(compactKeys(stripped));
  if (json.length <= maxChars) return json;
  if (stripped.tests) {
    stripped.tests = stripped.tests.filter((t: any) => t.status === 'failed').map((t: any) => ({
      t: t.title, s: t.status, d: t.duration,
      ...(t.error ? { e: truncStr(t.error, 150) } : {})
    }));
  }
  return JSON.stringify(compactKeys(stripped)).slice(0, maxChars);
}

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: number;
  location?: string;
}

interface PageError {
  message: string;
  stack?: string;
  timestamp: number;
}

interface NetworkFailure {
  url: string;
  method: string;
  status: number;
  statusText: string;
  responseBody?: string;
  timestamp: number;
}

interface TestStepData {
  title: string;
  category: string;
  startTime: number;
  duration: number;
  error?: string;
  status: 'passed' | 'failed' | 'skipped';
}

interface TestContext {
  user?: string;
  conditions?: string;
  expectation?: string;
  observed?: string;
}

interface DiagnosticData {
  consoleLogs: ConsoleLog[];
  pageErrors: PageError[];
  networkFailures: NetworkFailure[];
  testContext?: TestContext;
}

interface TestOutcome {
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  user: string;
  preferences: string;
  expected: string;
  observed: string;
  duration?: number;
  error?: string;
  screenshots?: string[];
  traces?: string[];
}

interface SuiteResults {
  title: string;
  outcomes: TestOutcome[];
}

interface TestReportData {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    timestamp: string;
    outputDirectory: string;
  };
  tests: Array<{
    title: string;
    file: string;
    status: string;
    duration: number;
    error?: string;
    errorStack?: string;
    screenshots?: string[];
    traces?: string[];
    videos?: string[];
    stdout?: string[];
    stderr?: string[];
    steps?: TestStepData[];
    consoleLogs?: ConsoleLog[];
    pageErrors?: PageError[];
    networkFailures?: NetworkFailure[];
    testContext?: TestContext;
    domSnapshot?: string;
  }>;
}

if (!process.env.TEST_RUN_ID) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace(/T/, '_')
    .split('Z')[0];
  process.env.TEST_RUN_ID = `${timestamp}_test`;
}

export default class SummaryReporter implements Reporter {
  private suiteResults: Map<string, SuiteResults> = new Map();
  private currentSuite: string = '';
  private isSummaryMode: boolean = false;
  private outputDir: string = '';
  private testResults: Array<any> = [];
  private startTime: number = 0;

  constructor() {
    this.isSummaryMode = process.env.TEST_SUMMARY_ONLY === 'true';
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();

    const testFiles = new Set<string>();
    suite.allTests().forEach(test => {
      const relativePath = path.relative(process.cwd(), test.location.file);
      const fileName = path.basename(relativePath, path.extname(relativePath));
      testFiles.add(fileName);
    });

    const fileNames = Array.from(testFiles).join('-');

    const currentRunId = process.env.TEST_RUN_ID || 'unknown';
    const updatedRunId = currentRunId.replace('_test', `_${fileNames}`);
    process.env.TEST_RUN_ID = updatedRunId;

    this.outputDir = path.join(process.cwd(), 'test-results', updatedRunId);

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    if (!this.isSummaryMode) return;
  }

  onTestBegin(test: TestCase) {
    if (!this.isSummaryMode) return;

    const suiteTitle = this.getSuiteTitle(test);
    if (!this.suiteResults.has(suiteTitle)) {
      this.suiteResults.set(suiteTitle, {
        title: this.formatSuiteTitle(suiteTitle),
        outcomes: []
      });
    }
    this.currentSuite = suiteTitle;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testTitle = this.formatTestTitle(test.title);
    const status = result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed';

    const expectedValue = this.extractExpected(test, result);
    const observedValue = this.extractObserved(test, result, status);

    const screenshots: string[] = [];
    const traces: string[] = [];
    const videos: string[] = [];
    let diagnosticData: DiagnosticData | undefined;
    let domSnapshot: string | undefined;

    result.attachments.forEach(attachment => {
      if (attachment.name === 'diagnostic-data' && attachment.body) {
        try {
          diagnosticData = JSON.parse(attachment.body.toString());
        } catch (err) {
        }
      }

      if (attachment.path) {
        const fileName = path.basename(attachment.path);
        const ext = path.extname(fileName).toLowerCase();

        try {
          const destPath = path.join(this.outputDir, fileName);
          if (fs.existsSync(attachment.path)) {
            fs.copyFileSync(attachment.path, destPath);

            if (ext === '.png') {
              screenshots.push(fileName);
            } else if (ext === '.zip') {
              traces.push(fileName);
            } else if (ext === '.webm') {
              videos.push(fileName);
            }
          }

          if (fileName === 'error-context.md') {
            try {
              domSnapshot = fs.readFileSync(attachment.path, 'utf-8');
            } catch (err) {
            }
          }
        } catch (err) {
        }
      }
    });

    const steps: TestStepData[] = this.extractSteps(result.steps);

    const stdout: string[] = [];
    const stderr: string[] = [];

    if (result.stdout && result.stdout.length > 0) {
      result.stdout.forEach(chunk => stdout.push(chunk.toString()));
    }
    if (result.stderr && result.stderr.length > 0) {
      result.stderr.forEach(chunk => stderr.push(chunk.toString()));
    }

    const testContext: TestContext = {
      user: this.extractUser(test),
      conditions: this.extractPreferences(test),
      expectation: expectedValue,
      observed: observedValue,
    };

    const isFailed = status === 'failed';
    const testResultData = {
      title: test.title,
      file: minifyPath(path.relative(process.cwd(), test.location.file)),
      status,
      duration: result.duration,
      ...(result.error ? {
        error: truncStr(result.error.message || '', 300),
        errorStack: minifyStack(result.error.stack, 5)
      } : {}),
      ...(screenshots.length > 0 ? { screenshots } : {}),
      ...(traces.length > 0 ? { traces } : {}),
      ...(videos.length > 0 ? { videos } : {}),
      ...(steps.length > 0 ? { steps: minifySteps(steps, isFailed ? 20 : 10) } : {}),
      ...(diagnosticData?.consoleLogs && diagnosticData.consoleLogs.length > 0 && isFailed ? { consoleLogs: minifyConsoleLogs(diagnosticData.consoleLogs) } : {}),
      ...(diagnosticData?.pageErrors && diagnosticData.pageErrors.length > 0 && isFailed ? { pageErrors: diagnosticData.pageErrors.slice(0, 3) } : {}),
      ...(diagnosticData?.networkFailures && diagnosticData.networkFailures.length > 0 && isFailed ? { networkFailures: minifyNetworkFailures(diagnosticData.networkFailures) } : {}),
      testContext,
      ...(domSnapshot && isFailed ? { domSnapshot: minifyDomSnapshot(domSnapshot) } : {})
    };

    this.testResults.push(testResultData);

    if (!this.isSummaryMode) return;

    const suite = this.suiteResults.get(this.currentSuite);
    if (!suite) return;

    const outcome: TestOutcome = {
      title: testTitle,
      status,
      user: this.extractUser(test),
      preferences: this.extractPreferences(test),
      expected: expectedValue ? expectedValue : '(empty expected)',
      observed: observedValue ? observedValue : '(empty observed)',
      duration: result.duration,
      ...(result.error ? { error: result.error.message } : {}),
      ...(screenshots.length > 0 ? { screenshots } : {}),
      ...(traces.length > 0 ? { traces } : {})
    };

    suite.outcomes.push(outcome);
  }

  async onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const total = this.testResults.length;
    const passed = this.testResults.filter(t => t.status === 'passed').length;
    const failed = this.testResults.filter(t => t.status === 'failed').length;
    const skipped = this.testResults.filter(t => t.status === 'skipped').length;

    const reportData: TestReportData = {
      summary: {
        total,
        passed,
        failed,
        skipped,
        duration,
        timestamp: new Date().toISOString(),
        outputDirectory: this.outputDir
      },
      tests: this.testResults
    };

    try {
      const testResultsDir = path.join(process.cwd(), 'test-results');
      const afterallFiles = fs.readdirSync(testResultsDir)
        .filter(f => f.startsWith('afterall-call-') && f.endsWith('.json'))
        .map(f => path.join(testResultsDir, f));

      const afterallData = afterallFiles.length > 0
        ? JSON.parse(fs.readFileSync(afterallFiles[0], 'utf-8'))
        : null;

      const jsonPath = path.join(this.outputDir, 'test-report.json');
      const minifiedJson = enforceJsonLimit(reportData, MAX_CHARS);
      fs.writeFileSync(jsonPath, minifiedJson);

      const readmePath = path.join(this.outputDir, 'README.md');
      const readmeContent = this.generateReadme(reportData, afterallData);
      fs.writeFileSync(readmePath, readmeContent);
    } catch (err) {
      console.error('Failed to write test reports:', err);
    }

    if (!this.isSummaryMode) return;

    this.suiteResults.forEach((suite) => {
      if (suite.outcomes.length === 0) return;

      const border = '='.repeat(36);
      console.log(`\n${border}`);
      console.log(suite.title);
      console.log(`${border}\n`);

      suite.outcomes.forEach((outcome, index) => {
        const icon = outcome.status === 'passed' ? '✅' : outcome.status === 'failed' ? '❌' : '⏭️';
        console.log(`${index + 1}. ${icon} ${outcome.title}`);
        console.log(`   User: ${outcome.user}`);
        console.log(`   Prefs: ${outcome.preferences}`);
        console.log(`   Expected: ${outcome.expected}`);
        console.log(`   Observed: ${outcome.observed}`);
        if (outcome.duration) {
          console.log(`   Duration: ${outcome.duration}ms`);
        }
        if (index < suite.outcomes.length - 1) {
          console.log();
        }
      });

      const suiteTotal = suite.outcomes.length;
      const suitePassed = suite.outcomes.filter(o => o.status === 'passed').length;
      const suiteFailed = suite.outcomes.filter(o => o.status === 'failed').length;

      console.log(`${border}`);
      console.log(`TOTALS: ${suiteTotal} tests | ${suitePassed} passed ✅ | ${suiteFailed} failed ❌`);
      console.log(`${border}`);
    });
  }

  private extractSteps(steps: TestStep[]): TestStepData[] {
    const extractedSteps: TestStepData[] = [];

    const processStep = (step: TestStep) => {
      extractedSteps.push({
        title: step.title,
        category: step.category,
        startTime: step.startTime.getTime(),
        duration: step.duration,
        error: step.error?.message,
        status: step.error ? 'failed' : 'passed'
      });

      if (step.steps && step.steps.length > 0) {
        step.steps.forEach(subStep => processStep(subStep));
      }
    };

    steps.forEach(step => processStep(step));
    return extractedSteps;
  }

  private generateReadme(data: TestReportData, afterallData?: any): string {
    const timestamp = new Date(data.summary.timestamp).toLocaleString();
    const durationSeconds = (data.summary.duration / 1000).toFixed(1);
    const outDir = path.basename(data.summary.outputDirectory);

    let md = `# Test Report\n\n`;
    md += `**Timestamp:** ${timestamp}\n`;
    md += `**Duration:** ${durationSeconds}s\n\n`;
    md += `## Summary\n\n`;
    md += `- **Total:** ${data.summary.total}\n`;
    md += `- **Passed:** ${data.summary.passed} ✅\n`;
    md += `- **Failed:** ${data.summary.failed} ❌\n`;
    md += `- **Skipped:** ${data.summary.skipped} ⏭️\n\n`;

    const failedTests = data.tests.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      md += `## Failed Tests\n`;
      md += `> View traces: \`npx playwright show-trace test-results/${outDir}/{file}.zip\`\n\n`;

      const budgetPerTest = Math.floor((MAX_CHARS - 2000) / failedTests.length);

      failedTests.forEach(test => {
        let testMd = `### ${truncStr(test.title, 80)}\n`;
        testMd += `📁 ${test.file} | ⏱ ${test.duration}ms\n`;

        if (test.testContext) {
          const tc = test.testContext;
          if (tc.expectation || tc.observed) {
            testMd += `**Expected:** ${truncStr(tc.expectation || 'N/A', 100)} | **Got:** ${truncStr(tc.observed || 'N/A', 100)}\n`;
          }
        }

        if (test.error) {
          testMd += `\n**Error:** \`${truncStr(test.error.replace(/\n/g, ' '), 200)}\`\n`;
        }

        if (test.steps && test.steps.length > 0) {
          const failedSteps = test.steps.filter(s => s.status === 'failed');
          const contextSteps = test.steps.slice(-5);
          const combined = [...failedSteps, ...contextSteps];
          const stepsToShow = failedSteps.length > 0 ? combined.filter((s, i) => combined.findIndex(x => x.title === s.title) === i) : contextSteps;
          testMd += `\n**Steps** (${test.steps.length} total):\n`;
          stepsToShow.slice(0, 8).forEach(step => {
            const icon = step.status === 'passed' ? '✓' : '✗';
            testMd += `${icon} ${truncStr(step.title, 60)} (${step.duration}ms)${step.error ? ` - ${truncStr(step.error, 50)}` : ''}\n`;
          });
        }

        if (test.consoleLogs && test.consoleLogs.length > 0) {
          const errors = test.consoleLogs.filter(l => l.type === 'error').slice(0, 3);
          if (errors.length > 0) {
            testMd += `\n**Console Errors:**\n`;
            errors.forEach(e => { testMd += `- ${truncStr(e.text, 150)}\n`; });
          }
        }

        if (test.networkFailures && test.networkFailures.length > 0) {
          testMd += `\n**Network Failures:**\n`;
          test.networkFailures.slice(0, 3).forEach(f => {
            testMd += `- ${f.method} ${truncStr(f.url, 60)} → ${f.status}\n`;
          });
        }

        if (test.domSnapshot) {
          const snapshot = truncStr(test.domSnapshot, 800);
          testMd += `\n**DOM:**\n\`\`\`\n${snapshot}\n\`\`\`\n`;
        }

        if (test.screenshots?.length || test.traces?.length) {
          testMd += `\n**Artifacts:** `;
          if (test.screenshots?.length) testMd += `📸 ${test.screenshots.join(', ')} `;
          if (test.traces?.length) testMd += `📼 ${test.traces.join(', ')}`;
          testMd += `\n`;
        }

        testMd += `\n---\n`;
        md += truncStr(testMd, budgetPerTest);
      });
    }

    if (afterallData?.tests?.length > 0) {
      const ft = afterallData.tests[0];
      md += `\n## Sub-Test: ${ft.passed ? '✓' : '✗'} ${ft.testName}\n`;
      if (ft.expectation) md += `Expected: ${ft.expectation}\n`;
      if (ft.observed) md += `Observed: ${ft.observed}\n`;
    }

    md += `\n## All Tests\n`;
    data.tests.forEach(t => {
      const icon = t.status === 'passed' ? '✅' : t.status === 'failed' ? '❌' : '⏭️';
      md += `${icon} ${truncStr(t.title, 60)} (${t.duration}ms)\n`;
    });

    if (md.length > MAX_CHARS) {
      const overflow = md.length - MAX_CHARS + 50;
      md = md.slice(0, -overflow) + `\n\n…[${overflow} chars truncated]`;
    }

    return md;
  }

  private getSuiteTitle(test: TestCase): string {
    const parts: string[] = [];
    let suite: Suite | undefined = test.parent;

    while (suite) {
      if (suite.title) {
        parts.unshift(suite.title);
      }
      suite = suite.parent;
    }

    return parts.slice(0, 2).join(' - ');
  }

  private formatSuiteTitle(title: string): string {
    if (title.includes('Find Partners')) {
      return 'Find Partners Pathway Test';
    }
    if (title.includes('Auth')) {
      return 'Authentication Test';
    }
    if (title.includes('Find Coaches')) {
      return 'Find Coaches Test';
    }
    if (title.includes('Booking')) {
      return 'Booking & Payment Test';
    }
    if (title.includes('Subscription')) {
      return 'Subscription Test';
    }
    if (title.includes('Courts')) {
      return 'Courts Test';
    }
    if (title.includes('Community')) {
      return 'Community Test';
    }
    if (title.includes('Messages')) {
      return 'Messages Test';
    }
    if (title.includes('Profile')) {
      return 'Profile Test';
    }
    if (title.includes('Coach Onboarding')) {
      return 'Coach Onboarding Test';
    }
    return title;
  }

  private extractUser(test: TestCase): string {
    const title = test.title;

    if (title.includes('should show nearby players when user has no saved preferences')) {
      return 'Alex Thompson (beginner, singles, casual, male, PC:2000)';
    }
    if (title.includes('should use preference-based matching')) {
      return 'David Martinez (intermediate, singles, casual, male, PC:2000)';
    }
    if (title.includes('should fall back to postcode + skill level')) {
      return 'Sophie Turner (advanced, singles, competitive, female, PC:2040)';
    }
    if (title.includes('should show no matches when neither')) {
      return 'Sophie Turner (advanced, singles, competitive, female, PC:9999)';
    }
    if (title.includes('should show beginner players')) {
      return 'David Martinez searching beginner';
    }
    if (title.includes('should show intermediate players')) {
      return 'Alex Thompson searching intermediate';
    }
    if (title.includes('should show advanced players')) {
      return 'Alex Thompson searching advanced';
    }
    if (title.includes('should match singles with singles')) {
      return 'Alex Thompson (beginner, singles)';
    }
    if (title.includes('should match doubles with doubles')) {
      return 'Marcus Brown (beginner, doubles)';
    }
    if (title.includes('should match both with all')) {
      return 'Sarah Chen (beginner, both)';
    }
    if (title.includes('should match casual with casual')) {
      return 'Alex Thompson (beginner, casual)';
    }
    if (title.includes('should match flexible with all')) {
      return 'Chris Anderson (intermediate, flexible)';
    }
    if (title.includes('should match competitive with competitive')) {
      return 'Ryan Cooper (advanced, competitive)';
    }
    if (title.includes('male seeking male')) {
      return 'Alex Thompson (male seeking male)';
    }
    if (title.includes('female seeking female')) {
      return 'Emma Wilson (female seeking female)';
    }
    if (title.includes('should show all genders')) {
      return 'Jordan Lee (no gender pref)';
    }
    if (title.includes('two-way compatibility')) {
      return 'Alex Thompson (male seeking female)';
    }
    if (title.includes('filter by UTR level')) {
      return 'David Martinez (UTR 5.5)';
    }
    if (title.includes('UTR-less users')) {
      return 'David Martinez (no UTR)';
    }
    if (title.includes('UTR players within range')) {
      return 'David Martinez (UTR 5.5)';
    }
    if (title.includes('distance to each player')) {
      return 'Alex Thompson (PC:2000)';
    }
    if (title.includes('sort profiles by distance')) {
      return 'Alex Thompson (PC:2000)';
    }
    if (title.includes('tier 2 message')) {
      return 'Sophie Turner (advanced, female, PC:2040)';
    }
    if (title.includes('no matches message')) {
      return 'Sophie Turner (advanced, female, PC:9999)';
    }
    if (title.includes('same postcode')) {
      return 'Alex Thompson (PC:2000)';
    }
    if (title.includes('postcode changes')) {
      return 'Alex Thompson (PC changes: 2000→2010)';
    }
    if (title.includes('all filters correctly')) {
      return 'Sophie Turner (advanced, singles, competitive, female, PC:2000)';
    }
    if (title.includes('skill match + at least one preference')) {
      return 'Alex Thompson (beginner, singles, casual, PC:2000)';
    }
    if (title.includes('criteria not met')) {
      return 'Sophie Turner (advanced, singles, competitive, female, PC:9999)';
    }
    if (title.includes('coach to find beginner')) {
      return 'Coach Amanda (searching beginner)';
    }
    if (title.includes('coach to find intermediate')) {
      return 'Coach Thomas (searching intermediate)';
    }
    if (title.includes('coach to find advanced')) {
      return 'Coach Isabella (searching advanced)';
    }
    if (title.includes('coach to filter by play type')) {
      return 'Coach Thomas (intermediate, doubles)';
    }
    if (title.includes('coach to change preferences')) {
      return 'Coach Amanda (changing prefs)';
    }

    return 'N/A';
  }

  private extractPreferences(test: TestCase): string {
    const title = test.title;

    if (title.includes('should show nearby players when user has no saved preferences')) {
      return 'NONE (deleted)';
    }
    if (title.includes('should use preference-based matching')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('should fall back to postcode + skill level')) {
      return 'advanced, singles, competitive, female, PC:2040';
    }
    if (title.includes('should show no matches when neither')) {
      return 'advanced, singles, competitive, female, PC:9999';
    }
    if (title.includes('should show beginner players')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('should show intermediate players')) {
      return 'intermediate, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('should show advanced players')) {
      return 'advanced, singles, competitive, no_pref, PC:2000';
    }
    if (title.includes('should match singles with singles')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('should match doubles with doubles')) {
      return 'beginner, doubles, flexible, no_pref, PC:2010';
    }
    if (title.includes('should match both with all')) {
      return 'beginner, both, casual, no_pref, PC:2010';
    }
    if (title.includes('should match casual with casual')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('should match flexible with all')) {
      return 'intermediate, doubles, flexible, no_pref, PC:2030';
    }
    if (title.includes('should match competitive with competitive')) {
      return 'advanced, singles, competitive, no_pref, PC:2000';
    }
    if (title.includes('male seeking male')) {
      return 'beginner, singles, casual, male, PC:2000';
    }
    if (title.includes('female seeking female')) {
      return 'beginner, singles, casual, female, PC:2000';
    }
    if (title.includes('should show all genders')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('two-way compatibility')) {
      return 'beginner, singles, casual, female, PC:2000';
    }
    if (title.includes('filter by UTR level')) {
      return 'intermediate, singles, casual, no_pref, PC:2000, UTR:5.5';
    }
    if (title.includes('UTR-less users')) {
      return 'intermediate, singles, casual, no_pref, PC:2000, UTR:none';
    }
    if (title.includes('UTR players within range')) {
      return 'intermediate, singles, casual, no_pref, PC:2000, UTR:5.5';
    }
    if (title.includes('distance to each player')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('sort profiles by distance')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('tier 2 message')) {
      return 'advanced, singles, competitive, female, PC:2040';
    }
    if (title.includes('no matches message')) {
      return 'advanced, singles, competitive, female, PC:9999';
    }
    if (title.includes('same postcode')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('postcode changes')) {
      return 'Changing: PC:2000→2010, play:singles→both';
    }
    if (title.includes('all filters correctly')) {
      return 'advanced, singles, competitive, female, PC:2000';
    }
    if (title.includes('skill match + at least one preference')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('criteria not met')) {
      return 'advanced, singles, competitive, female, PC:9999';
    }
    if (title.includes('coach to find beginner')) {
      return 'beginner, singles, casual, no_pref, PC:2000';
    }
    if (title.includes('coach to find intermediate')) {
      return 'intermediate, singles, competitive, no_pref, PC:2000';
    }
    if (title.includes('coach to find advanced')) {
      return 'advanced, singles, competitive, no_pref, PC:2000';
    }
    if (title.includes('coach to filter by play type')) {
      return 'intermediate, doubles, flexible, no_pref, PC:2020';
    }
    if (title.includes('coach to change preferences')) {
      return 'Changing: PC:2000→2010, play:singles→doubles';
    }

    return 'N/A';
  }

  private formatTestTitle(title: string): string {
    if (title.includes('should show nearby players when user has no saved preferences')) {
      return 'No Preferences - Nearby players visible';
    }
    if (title.includes('should use preference-based matching')) {
      return 'Preference-based matching';
    }
    if (title.includes('should fall back to postcode')) {
      return 'Fallback to postcode matching';
    }
    if (title.includes('should show no matches when neither')) {
      return 'No matches found';
    }
    if (title.includes('should show beginner players')) {
      return 'Beginner skill level filtering';
    }
    if (title.includes('should show intermediate players')) {
      return 'Intermediate skill level filtering';
    }
    if (title.includes('should show advanced players')) {
      return 'Advanced skill level filtering';
    }
    if (title.includes('should match singles with singles')) {
      return 'Singles play type matching';
    }
    if (title.includes('should match doubles with doubles')) {
      return 'Doubles play type matching';
    }
    if (title.includes('should match both with all')) {
      return 'Both play types matching';
    }
    if (title.includes('should match casual with casual')) {
      return 'Casual session matching';
    }
    if (title.includes('should match flexible with all')) {
      return 'Flexible session matching';
    }
    if (title.includes('should match competitive with competitive')) {
      return 'Competitive session matching';
    }
    if (title.includes('gender preference')) {
      return 'Gender preference filtering';
    }
    if (title.includes('same postcode')) {
      return 'Postcode matching';
    }
    if (title.includes('postcode changes')) {
      return 'Dynamic postcode filtering';
    }
    if (title.includes('all filters correctly')) {
      return 'Combined filters';
    }
    if (title.includes('skill match + at least one preference')) {
      return 'Skill and preference matching';
    }
    if (title.includes('criteria not met')) {
      return 'No matches - criteria not met';
    }
    if (title.includes('allow coach to find beginner')) {
      return 'Coach finding beginner players';
    }
    if (title.includes('allow coach to find intermediate')) {
      return 'Coach finding intermediate players';
    }
    if (title.includes('allow coach to find advanced')) {
      return 'Coach finding advanced players';
    }
    if (title.includes('coach to filter by play type')) {
      return 'Coach filtering by play type';
    }
    if (title.includes('coach to change preferences')) {
      return 'Coach changing preferences';
    }

    return title.substring(0, 50);
  }

  private extractExpected(test: TestCase, result: TestResult): string {
    const title = test.title;

    if (title.includes('should show nearby players when user has no saved preferences')) {
      return 'Nearby players (Emma Wilson, Jordan Lee) should be visible; Self (Alex Thompson) should not be visible';
    }
    if (title.includes('nearby players')) {
      return 'Nearby players should be visible when no preferences are set';
    }
    if (title.includes('preference-based matching')) {
      return 'Players matching exact preferences should be visible';
    }
    if (title.includes('fall back to postcode')) {
      return 'Players in same postcode with same skill level should be visible';
    }
    if (title.includes('no matches when neither')) {
      return 'No players should be visible when criteria not met';
    }
    if (title.includes('beginner players')) {
      return 'Only beginner level players should be visible';
    }
    if (title.includes('intermediate players')) {
      return 'Only intermediate level players should be visible';
    }
    if (title.includes('advanced players')) {
      return 'Only advanced level players should be visible';
    }
    if (title.includes('singles with singles')) {
      return 'Singles players should match with singles and both';
    }
    if (title.includes('doubles with doubles')) {
      return 'Doubles players should match with doubles and both';
    }
    if (title.includes('both with all')) {
      return 'Both play type should match with all types';
    }
    if (title.includes('casual with casual')) {
      return 'Casual players should match with casual and flexible';
    }
    if (title.includes('flexible with all')) {
      return 'Flexible players should match with all session types';
    }
    if (title.includes('competitive with competitive')) {
      return 'Competitive players should match with competitive and flexible';
    }
    if (title.includes('gender preference')) {
      return 'Players should be shown regardless of gender preference';
    }
    if (title.includes('same postcode')) {
      return 'Only players from the same postcode should be visible';
    }
    if (title.includes('postcode changes')) {
      return 'Different players should appear when postcode changes';
    }
    if (title.includes('all filters')) {
      return 'All filter criteria should be applied correctly';
    }
    if (title.includes('skill match')) {
      return 'Skill level must match with at least one other preference';
    }
    if (title.includes('criteria not met')) {
      return 'No matches should appear when criteria not met';
    }
    if (title.includes('coach to find beginner')) {
      return 'Coach should see beginner level players';
    }
    if (title.includes('coach to find intermediate')) {
      return 'Coach should see intermediate level players';
    }
    if (title.includes('coach to find advanced')) {
      return 'Coach should see advanced level players';
    }
    if (title.includes('coach to filter')) {
      return 'Coach should be able to filter by play type';
    }
    if (title.includes('coach to change')) {
      return 'Coach should see different results when preferences change';
    }

    return 'Test should pass as expected';
  }

  private extractObserved(test: TestCase, result: TestResult, status: 'passed' | 'failed' | 'skipped'): string {
    if (status === 'skipped') {
      return 'Test was skipped';
    }

    if (result.error) {
      const errorMsg = result.error.message || '';
      if (errorMsg.includes('Test timeout') || errorMsg.includes('exceeded')) {
        return 'Test timed out';
      }
    }

    const title = test.title;
    const passed = status === 'passed';

    if (title.includes('should show nearby players when user has no saved preferences')) {
      return passed ? 'Emma Wilson and Jordan Lee are visible; Alex Thompson is not visible' : 'Expected players not found or visibility incorrect';
    }
    if (title.includes('nearby players')) {
      return passed ? 'Nearby players are visible' : 'Nearby players not found';
    }
    if (title.includes('preference-based matching')) {
      return passed ? 'Preference-matched players are visible' : 'Expected players not found';
    }
    if (title.includes('fall back to postcode')) {
      return passed ? 'Postcode-matched players are visible' : 'Expected players not found';
    }
    if (title.includes('no matches when neither')) {
      return passed ? 'No players are visible' : 'Unexpected players found';
    }
    if (title.includes('beginner players')) {
      return passed ? 'Beginner players are visible' : 'Expected skill level not found';
    }
    if (title.includes('intermediate players')) {
      return passed ? 'Intermediate players are visible' : 'Expected skill level not found';
    }
    if (title.includes('advanced players')) {
      return passed ? 'Advanced players are visible' : 'Expected skill level not found';
    }
    if (title.includes('singles with singles')) {
      return passed ? 'Singles matching works correctly' : 'Singles matching failed';
    }
    if (title.includes('doubles with doubles')) {
      return passed ? 'Doubles matching works correctly' : 'Doubles matching failed';
    }
    if (title.includes('both with all')) {
      return passed ? 'Both play type matching works' : 'Play type matching failed';
    }
    if (title.includes('casual with casual')) {
      return passed ? 'Casual session matching works' : 'Session matching failed';
    }
    if (title.includes('flexible with all')) {
      return passed ? 'Flexible session matching works' : 'Session matching failed';
    }
    if (title.includes('competitive with competitive')) {
      return passed ? 'Competitive session matching works' : 'Session matching failed';
    }
    if (title.includes('gender preference')) {
      return passed ? 'Gender preference filtering works' : 'Gender filtering failed';
    }
    if (title.includes('same postcode')) {
      return passed ? 'Postcode filtering works correctly' : 'Postcode filtering failed';
    }
    if (title.includes('postcode changes')) {
      return passed ? 'Dynamic postcode filtering works' : 'Postcode change failed';
    }
    if (title.includes('all filters')) {
      return passed ? 'Combined filters work correctly' : 'Filter combination failed';
    }
    if (title.includes('skill match')) {
      return passed ? 'Skill and preference matching works' : 'Matching criteria failed';
    }
    if (title.includes('criteria not met')) {
      return passed ? 'No matches shown correctly' : 'Unexpected matches found';
    }
    if (title.includes('coach to find beginner')) {
      return passed ? 'Coach can see beginner players' : 'Beginner players not visible';
    }
    if (title.includes('coach to find intermediate')) {
      return passed ? 'Coach can see intermediate players' : 'Intermediate players not visible';
    }
    if (title.includes('coach to find advanced')) {
      return passed ? 'Coach can see advanced players' : 'Advanced players not visible';
    }
    if (title.includes('coach to filter')) {
      return passed ? 'Coach filtering works correctly' : 'Coach filtering failed';
    }
    if (title.includes('coach to change')) {
      return passed ? 'Coach preference changes work' : 'Preference change failed';
    }

    if (result.error) {
      const errorMsg = result.error.message || '';
      if (errorMsg.includes('not found')) {
        return 'Element not found on page';
      }
      if (errorMsg.includes('timeout')) {
        return 'Test timed out waiting for element';
      }
      if (errorMsg.includes('visible')) {
        return 'Element visibility check failed';
      }
      return `Test failed: ${errorMsg.substring(0, 50)}`;
    }

    return passed ? 'Test passed successfully' : 'Test failed';
  }
}