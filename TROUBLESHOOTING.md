# CI Troubleshooting Guide

This guide provides solutions to common issues encountered in the GitHub Actions CI pipeline.

## General Troubleshooting Steps

1.  **Check the Logs:** The first step is always to carefully read the logs for the failed job in the GitHub Actions tab. The error message will usually point you to the problem.
2.  **Run Tests Locally:** Before pushing, always run the tests locally to catch issues early.
    -   Backend: `npm test` in the `server` directory.
    -   Frontend: `npm test` in the `client` directory.
3.  **Check Dependencies:** Ensure that all required dependencies are listed in `package.json` and that you haven't introduced a breaking change with a library update. Run `npm install` locally to ensure your `node_modules` are up to date.

## Common CI Failures

### Backend (Server)

-   **Test Failures:**
    -   **Reason:** A change in the code has broken an existing test.
    -   **Solution:** Analyze the failed test in the CI logs. Run the same test locally to debug the issue. Fix the code or the test.
-   **Build Failure (`tsc`):
    -   **Reason:** TypeScript compilation errors.
    -   **Solution:** Check the logs for `tsc` errors. These are usually type errors that need to be fixed in the code.
-   **Database Connection Issues:**
    -   **Reason:** The tests rely on a MongoDB in-memory server. If this fails to start, the tests will fail.
    -   **Solution:** This is often a transient issue. Rerunning the job may fix it. If it persists, check for issues with the `mongodb-memory-server` package.

### Frontend (Client)

-   **Test Failures:**
    -   **Reason:** A change in a component has broken a test.
    -   **Solution:** Check the logs for the failed test. Use `npm test` in the `client` directory to debug locally.
-   **Linting Errors (`eslint`):
    -   **Reason:** The code does not conform to the project's linting rules.
    -   **Solution:** Run `npm run lint` locally to see the errors. Fix the reported issues.
-   **Build Failure (`vite build`):
    -   **Reason:** Errors during the Vite build process, often related to TypeScript or dependency issues.
    -   **Solution:** Check the build logs for specific errors. Run `npm run build` locally to reproduce and debug.

## Code Quality

### ESLint for Backend

-   **Problem:** ESLint is not set up for the backend.
-   **Solution:**
    1.  Install ESLint and plugins: `npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev`
    2.  Create a `.eslintrc.js` file in the `server` directory with the appropriate configuration.
    3.  Add a `lint` script to `server/package.json`: `"lint": "eslint . --ext ts"`

### Prettier for Code Formatting

-   **Problem:** Prettier is not set up for consistent code formatting.
-   **Solution:**
    1.  Install Prettier: `npm install prettier --save-dev --save-exact`
    2.  Create a `.prettierrc` file in the root of the project with your desired formatting rules.
    3.  Create a `.prettierignore` file to exclude files that shouldn't be formatted.
    4.  Add a `format` script to `package.json` in both `client` and `server`: `"format": "prettier --write \"src/**/*.ts\""`

