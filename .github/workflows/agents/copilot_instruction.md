# Copilot Instructions

## Project context
- This repository is a Playwright-based end-to-end automation project for an ecommerce application.
- The project uses JavaScript and Node.js.
- Test scenarios live under the `tests/` directory, reusable page objects live under `pages/`, and fixtures/helpers live under `fixtures/`.
- The automation should validate real user flows such as browsing products, cart behavior, checkout flow, and UI validation.

## Working rules
- Keep changes minimal, focused, and directly related to the requested task.
- Prefer existing patterns and naming conventions already used in the codebase.
- Avoid changing unrelated tests, config, or project setup unless the task explicitly requires it.
- Do not create new frameworks or dependencies unless absolutely needed.
- Use stable selectors and resilient locators when updating tests or page objects.
- Preserve existing test behavior and avoid broad refactors.

## Test strategy
- Prefer targeted validation for the specific flow being changed.
- Run the smallest relevant Playwright test command rather than the entire suite.
- When fixing a failing test, verify the root cause in the page object or test flow before changing assertions or selectors.
- Keep assertions aligned with real user-visible behavior, not internal implementation details.

## Bug reporting workflow
- If a test fails and the task involves bug analysis, keep the report aligned with the behavior described by the failing flow.
- The repository contains a `bug-reporter.js` utility that creates structured bug reports from failed Playwright tests.
- Use product-language descriptions in bug reports: focus on user-observed behavior, expected result, actual result, impact, and reproduction steps.
- Do not treat test code internals as the bug description; describe what the app did incorrectly from a user perspective.

## Quality expectations
- Write readable, maintainable Playwright code.
- Prefer clear test names and meaningful step names.
- Keep page objects lean and reusable.
- Ensure new tests and updates match the existing repository style and structure.

## Final response expectations
- Summarize the change succinctly.
- Mention the validation performed, if any.
- If no validation was run, say so explicitly.
- Do not mention unrelated files or broad project changes unless necessary for the task.
