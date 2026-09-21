# Ecommerce App Playwright Automation

End-to-end test automation for the [Demoblaze Product Store](https://www.demoblaze.com/) using Playwright Test and JavaScript.

## Project Overview

This project validates key ecommerce workflows:

- User signup
- User sign-in and validation
- Logout
- Product and cart interactions
- Checkout
- Contact Us
- About Us content

The tests use the Page Object Model (POM), reusable test data, and Playwright fixtures.

## Technology Stack

- **Language:** JavaScript
- **Test framework:** Playwright Test
- **Browser:** Chromium
- **Runtime:** Node.js
- **CI:** GitHub Actions

## Project Structure

```text
.
├── data/
│   ├── signin.data.js       # Valid and negative sign-in data
│   └── signup.data.js       # Dynamic signup data
├── fixtures/
│   └── signup.fixture.js    # Custom signupData fixture
├── pages/
│   ├── cart.js               # Cart page actions
│   ├── checkout.js           # Checkout page actions
│   ├── contactus.js          # Contact Us actions
│   ├── signin.js             # Sign-in page actions
│   └── signup.js             # Signup page actions
├── tests/
│   ├── about.spec.js         # About Us validation
│   ├── cart.spec.js          # Cart validation
│   ├── checkout.spec.js      # Checkout validation
│   ├── contactus.spec.js     # Contact Us validation
│   ├── logout.spec.js        # Logout validation
│   ├── signin.spec.js        # Sign-in scenarios
│   └── signup.spec.js        # Signup scenarios
├── .github/
│   └── workflows/
│       └── playwright.yml    # GitHub Actions workflow
├── playwright.config.js      # Playwright configuration
└── package.json              # Project dependencies
```

## Test Coverage

### Sign-in
### Signup
### Authenticated Workflows

- Successful logout
- Cart product addition
- Checkout purchase
- Contact Us message submission
- About Us content availability

## Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- Git

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/RanushSanjula/ecommerce-e2e-playwright.git
cd ecommerce-e2e-playwright
npm ci
```

Install the Chromium browser and required system dependencies:

```bash
npx playwright install --with-deps chromium
```

On Windows, if `--with-deps` is not supported for the local environment, use:

```bash
npx playwright install chromium
```

## Running Tests

Run the complete test suite:

```bash
npx playwright test
```

Run tests in Chromium:

```bash
npx playwright test --project=chromium
```

Run one test file:

```bash
npx playwright test tests/signin.spec.js
```

Run with the browser visible:

```bash
npx playwright test --headed
```

Run in debug mode:

```bash
npx playwright test --debug
```

Run with one worker:

```bash
npx playwright test --workers=1
```

## Reports and Test Artifacts

The project uses the HTML reporter.

Open the latest HTML report with:

```bash
npx playwright show-report
```

Generated reports and test results are excluded from Git by `.gitignore`:

- `playwright-report/`
- `test-results/`
- `blob-report/`
- `playwright/.cache/`

## CI/CD

The workflow at `.github/workflows/playwright.yml` runs on:

- Pushes to `main` or `master`
- Pull requests targeting `main` or `master`

The workflow:

1. Checks out the repository.
2. Sets up the latest Node.js LTS version.
3. Restores npm dependencies using `npm ci`.
4. Installs Chromium and its Linux dependencies.
5. Runs the complete Playwright suite.
6. Uploads the HTML report as a GitHub Actions artifact.

The CI configuration uses the `CI` environment variable. In CI, the Playwright configuration enables retries and uses the configured CI worker count.

## Test Data and Fixtures

Test data is kept separate from page objects:

- `data/signin.data.js` contains valid and negative sign-in datasets.
- `data/signup.data.js` creates a unique username for signup tests.
- `fixtures/signup.fixture.js` injects `signupData` into signup tests.

For shared or sensitive credentials, use GitHub Actions secrets or environment variables rather than committing real credentials to the repository.

## Page Object Model

Page objects contain locators and user actions. Test files contain test scenarios and assertions.

Example:

```js
const signin = new signinPage(page);

await signin.navigate();
await signin.signin(createSigninData());
```

This separation keeps UI selectors in one place and makes test cases easier to maintain.

## Notes

- The tests target the public Demoblaze demo application, so availability and response time depend on the external site.
- Signup usernames must be unique unless the test is intentionally validating an existing-user response.
- The sign-in data must match a registered Demoblaze account.
