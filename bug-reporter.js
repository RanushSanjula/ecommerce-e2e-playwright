const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const stripAnsi = (s = '') => s.replace(/\u001b\[[0-9;]*m/g, '');

class BugReporter {
  constructor() {
    this.outDir = path.join(process.cwd(), 'bug-reports');
    this.pending = [];
  }

  onBegin() {
    fs.rmSync(this.outDir, { recursive: true, force: true });
    fs.mkdirSync(this.outDir, { recursive: true });
  }

  onTestEnd(test, result) {
    const failed = result.status === 'failed' || result.status === 'timedOut';
    if (!failed || result.retry !== test.retries) return; // only after last retry
    this.pending.push(this.report(test, result));
  }

  // Playwright waits here so all Gemini calls finish before the run exits
  async onEnd() {
    await Promise.all(this.pending);
  }

  async report(test, result) {
    const steps = this.flattenSteps(result.steps);
    const error = stripAnsi(result.error?.message);
    const stack = stripAnsi(result.error?.stack);
    const testPath = test.titlePath().join(' > ');
    const browser = test.parent.project()?.name ?? 'unknown';
    const environment = process.env.CI ? 'CI (GitHub Actions)' : 'Local';
    const file = `${path.relative(process.cwd(), test.location.file)}:${test.location.line}`;
    const runUrl = process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : 'N/A (local run)';

    // Bug ID: date + hash of test path (same test = same suffix)
    const hash = crypto.createHash('sha1').update(testPath).digest('hex').slice(0, 6).toUpperCase();
    const date = new Date();
    const bugId = `BUG-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${hash}`;

    const screenshot = result.attachments.find(a => a.name === 'screenshot' && a.path);
    const attachments =
      result.attachments
        .filter(a => a.path)
        .map(a => `- ${a.name}: ${path.relative(process.cwd(), a.path)}`)
        .join('\n') || 'None';

    const context = { title: test.title, testPath, file, browser, environment, steps, error, stack };
    const ai = await this.generateWithGemini(context, screenshot?.path);
    const fields = ai ?? this.fallbackFields(context);
    const usedAi = Boolean(ai);

    const stepsText = (fields.stepsToReproduce.length ? fields.stepsToReproduce : ['Not available'])
      .map((s, i) => `${i + 1}. ${s.replace(/^\d+[.)]\s*/, '')}`)
      .join('\n');

    // Raw assertion/stack noise is only useful when there was no AI/heuristic
    // interpretation to fall back on for debugging. Once we have descriptive
    // fields (AI or heuristic), we drop it from the human-facing report and
    // just point at the attachments (error-context.md / video / screenshot)
    // that already carry the raw detail.
    const debugSection = usedAi
      ? ''
      : `

RAW ERROR (for debugging)
--------------------------
${error}
`;

    const text = `BUG REPORT
==========
Bug ID:    ${bugId}
Title:     ${fields.title}
Severity:  ${fields.severity}
Priority:  ${fields.priority}

DESCRIPTION
-----------
${fields.description}

STEPS TO RECREATE
-----------------
${stepsText}

EXPECTED RESULT
---------------
${fields.expectedResult}

ACTUAL RESULT
-------------
${fields.actualResult}

ADDITIONAL NOTES
----------------
${fields.additionalNotes}

Test:        ${testPath}
File:        ${file}
Browser:     ${browser}
Environment: ${environment}
Date:        ${date.toISOString()}
Run:         ${runUrl}
Report by:   ${usedAi ? 'Gemini (AI-generated, please review)' : 'Automatic fallback (heuristic, please review)'}

Attachments:
${attachments}
${debugSection}`;

    const name = test.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
    fs.writeFileSync(path.join(this.outDir, `${bugId}_${name}.txt`), text);
  }

  flattenSteps(steps) {
    return steps.flatMap(s => {
      const own = s.category === 'test.step' || s.category === 'pw:api' ? [s.title] : [];
      return [...own, ...this.flattenSteps(s.steps)];
    });
  }

  async generateWithGemini(c, screenshotPath) {
    if (!process.env.GEMINI_API_KEY) return null;
    try {
      const prompt = `You are a experienced senior software quality assurance engineer writing a bug report for a project manager and developer to read. A Playwright automated test failed. Write the report from the perspective of what a real user/tester observed in the application, not from the perspective of the test code or assertion mechanics.
Respond ONLY with JSON using exactly these keys:
{
"title": "short, specific bug title describing the app behavior, not the test",
  "description": "2-4 sentences, in plain product language, describing what the app did wrong and where (e.g. 'The Contact Us form accepted an invalid email address and submitted successfully instead of showing a validation error.')",
  "stepsToReproduce": ["step 1", "step 2", "..."],
  "expectedResult": "what the application should have done (e.g. 'The form should not be submitted, and an inline error should indicate the email format is invalid.')",
  "actualResult": "what the application actually did (e.g. 'The form was submitted successfully and a confirmation message was shown despite the invalid email.')",
  "severity": "Critical | Major | Minor",
  "priority": "High | Medium | Low",
  "additionalNotes": "your reasoning for the severity/priority you chose (impact on users/data/business, not just 'test failed'), plus possible root cause or suggested fix"
}
Guidelines:
- Never phrase expectedResult/actualResult in terms of "expect() to equal" or raw assertion mechanics — describe real app behavior.
- Base severity/priority on real-world impact: a validation bypass that lets bad data into the system is typically Major/High even if nothing crashes; a cosmetic issue is typically Minor/Low; a crash or data loss is Critical/High.
- Use only the information below. If something is unknown, write "Not available". Do not invent details.
- If the screenshot is provided, use it to describe what the page showed.

Test name: ${c.title}
Test path: ${c.testPath}
File: ${c.file}
Browser: ${c.browser}
Environment: ${c.environment}

Recorded steps:
${c.steps.join('\n') || 'None recorded'}

Error message:
${c.error}

Stack trace:
${c.stack}`;

      const parts = [{ text: prompt }];
      if (screenshotPath && fs.existsSync(screenshotPath)) {
        parts.push({
          inline_data: {
            mime_type: 'image/png',
            data: fs.readFileSync(screenshotPath).toString('base64'),
          },
        });
      }

      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

      return {
        title: String(parsed.title ?? `Test failed - ${c.title}`),
        description: String(parsed.description ?? 'Not available'),
        stepsToReproduce: Array.isArray(parsed.stepsToReproduce) ? parsed.stepsToReproduce.map(String) : [],
        expectedResult: String(parsed.expectedResult ?? 'Not available'),
        actualResult: String(parsed.actualResult ?? 'Not available'),
        severity: String(parsed.severity ?? 'Not assessed'),
        priority: String(parsed.priority ?? 'Not assessed'),
        additionalNotes: String(parsed.additionalNotes ?? 'None'),
      };
    } catch {
      return null; // never break the test run; fallback report is used
    }
  }

  // ---------------------------------------------------------------------
  // Heuristic fallback (used when GEMINI_API_KEY is not set, or the AI
  // call fails/times out). It tries to produce the same "descriptive,
  // user-facing" report shape as the AI path by parsing the test title,
  // recorded step titles, and the assertion's Expected/Received values
  // (a very common Playwright pattern: expect(actualText).toBe(expectedText)).
  // It will never be as good as the AI path for novel bugs, but it avoids
  // dumping raw assertion/stack text into the report.
  // ---------------------------------------------------------------------
  fallbackFields(c) {
    const subject = this.humanizeTitle(c.title);
    const { expected, received } = this.parseExpectedReceived(c.error);
    const readableSteps = this.humanizeSteps(c.steps);

    const description = expected && received
      ? `While testing "${subject}", the application did not behave as expected. ` +
        `The test expected to see "${this.truncate(expected)}", but the application ` +
        `instead showed "${this.truncate(received)}".`
      : `While testing "${subject}", the application did not behave as expected. ` +
        `See the recorded steps and attachments (screenshot/video) for details.`;

    const expectedResult = expected
      ? `The application should have shown/produced: "${this.truncate(expected)}".`
      : 'Not available - see attachments for the expected condition.';

    const actualResult = received
      ? `The application instead showed/produced: "${this.truncate(received)}", ` +
        `meaning the intended validation or behavior did not take effect.`
      : (c.error ? c.error.split('\n')[0] : 'Not available');

    // Best-effort severity/priority: a validation-bypass style failure
    // (something wrong was accepted / an error message never appeared)
    // is treated as more impactful than an unknown assertion mismatch.
    const looksLikeValidationBypass = /invalid|error|valid/i.test(c.title) || /invalid|error/i.test(String(expected));
    const severity = looksLikeValidationBypass ? 'Major' : 'Minor';
    const priority = looksLikeValidationBypass ? 'High' : 'Medium';

    return {
      title: subject,
      description,
      stepsToReproduce: readableSteps,
      expectedResult,
      actualResult,
      severity,
      priority,
      additionalNotes:
        `Severity/priority above are a best-effort default (no AI summary was available - ` +
        `set GEMINI_API_KEY to get a fully descriptive, reviewed assessment). ` +
        `Please confirm real-world impact before triage. Raw error is included below for debugging.`,
    };
  }

  // "Verify whether the user cannot enter invalid email format(N)" ->
  // "User can enter invalid email format" (i.e. state the bug, not the check)
  humanizeTitle(title) {
    let t = title
      .replace(/^verify (whether )?/i, '')
      .replace(/\(n\)$/i, '')
      .replace(/\(p\)$/i, '')
      .trim();

    // "the user cannot X" describes the *intended* check; since the test
    // failed, the real-world bug is that the user CAN do X.
    t = t.replace(/\bcannot\b/i, 'can');
    t = t.charAt(0).toUpperCase() + t.slice(1);
    return t;
  }

  // Pulls "Expected: ..." / "Received: ..." out of a Jest/Playwright
  // `expect(x).toBe(y)` style failure message, if present.
  parseExpectedReceived(error = '') {
    const expectedMatch = error.match(/Expected:\s*"?(.*?)"?\s*(?:\n|$)/i);
    const receivedMatch = error.match(/Received:\s*"?(.*?)"?\s*(?:\n|$)/i);
    return {
      expected: expectedMatch ? expectedMatch[1].trim() : null,
      received: receivedMatch ? receivedMatch[1].trim() : null,
    };
  }

  // Turns raw Playwright step titles like `fill("Test@12345")` or
  // `click` into plain-English reproduction steps.
  humanizeSteps(steps) {
    return steps
      .map(s => this.humanizeStep(s))
      .filter(Boolean);
  }

  humanizeStep(step) {
    const fillMatch = step.match(/^fill\(['"](.*)['"]\)$/i);
    if (fillMatch) return `Enter "${fillMatch[1]}" into the field`;

    const clickMatch = step.match(/^click(\(.*\))?$/i);
    if (clickMatch) return 'Click the corresponding button/element';

    const gotoMatch = step.match(/^goto\(['"](.*)['"]\)$/i);
    if (gotoMatch) return `Navigate to ${gotoMatch[1]}`;

    if (/^expect/i.test(step)) return null; // assertion steps aren't "recreation" steps

    // Fall back to the raw step title, stripped of pw:api noise.
    return step;
  }

  truncate(s, max = 120) {
    if (!s) return s;
    return s.length > max ? `${s.slice(0, max)}...` : s;
  }
}

module.exports = BugReporter;