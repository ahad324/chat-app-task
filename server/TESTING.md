
# Testing Strategy for Real-Time Chat App

This document outlines the testing strategy, tools, and configuration for the MERN real-time chat application. Our goal is to ensure code quality, reliability, and maintainability through a comprehensive testing suite.

## 1. Guiding Principles (What & Why)

We follow the "Testing Pyramid" model to structure our tests:

-   **Unit Tests (Base):** These form the largest part of our testing suite. They test individual functions, components, and modules in isolation.
    -   **Why:** They are fast, reliable, and precisely pinpoint bugs.
    -   **What:** Backend controllers, utility functions, frontend components' rendering and basic logic.

-   **Integration Tests (Middle):** These tests verify that different parts of the application work together correctly.
    -   **Why:** They catch issues at the boundaries of modules, such as API endpoint integrations or component interactions.
    -   **What:** Backend API route tests (controller + middleware), frontend component flows (e.g., login form submission and state change).

-   **End-to-End (E2E) Tests (Peak):** (Future Scope) These would simulate a full user journey in a real browser.
    -   **Why:** They provide the highest confidence that the application works as expected from a user's perspective.
    -   **What:** A full flow like Register -> Login -> Search User -> Send Message.

## 2. Backend Testing (Server)

### Tools

-   **Jest:** A delightful JavaScript Testing Framework with a focus on simplicity.
-   **Supertest:** A library for testing Node.js HTTP servers. It allows us to make requests to our Express API endpoints.
-   **ts-jest:** A Jest transformer with source map support for TypeScript.
-   **MongoDB Memory Server:** Spins up an in-memory MongoDB database for tests, ensuring a clean, isolated environment for each test run without needing a real database connection.

### Configuration (`jest.config.js`)

-   `preset: 'ts-jest'`: Configures Jest to use `ts-jest` for TypeScript files.
-   `testEnvironment: 'node'`: Specifies that tests will run in a Node.js environment.
-   `setupFilesAfterEnv: ['./tests/setup.ts']`: Points to a setup file that runs before each test suite. This file manages the in-memory MongoDB connection.
-   `collectCoverageFrom`: Defines which files to include in code coverage reports to ensure we're measuring application code, not test code.

### How to Run Tests

```bash
# Run all tests
npm test

# Run tests and generate a coverage report
npm run test:coverage
```

The coverage report can be found in the `server/coverage/` directory.

## 3. Frontend Testing (Client)

### Tools

-   **Vite:** The build tool for our frontend, which comes with a fast, built-in test runner.
-   **Vitest:** A blazing-fast unit test framework powered by Vite. It's configured to be compatible with Jest's API.
-   **React Testing Library:** A library for testing React components in a way that resembles how users interact with them.
-   **@testing-library/jest-dom:** Provides custom Jest matchers to test the state of the DOM.
-   **jsdom:** A pure-JavaScript implementation of web standards, used to simulate a browser environment for tests.

### Configuration (`vite.config.ts`)

-   The `test` object within the Vite config sets up Vitest.
-   `globals: true`: Allows us to use Vitest APIs (like `describe`, `it`, `expect`) without importing them.
-   `environment: 'jsdom'`: Simulates a browser environment.
-   `setupFiles: './src/setupTests.ts'`: Points to a setup file for initial test configuration (e.g., extending `expect` with `jest-dom` matchers).

### Mocking

-   **API Calls (`axios`):** Mocked using `vi.mock()` to prevent real network requests and provide controlled responses.
-   **Socket.IO:** The `socket.io-client` is mocked to simulate socket events without a real server connection.
-   **React Router:** The `<MemoryRouter>` is used to test components that rely on routing hooks like `useNavigate`.

### How to Run Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once and generate a coverage report
npm run test:coverage
```

The coverage report can be found in the `client/coverage/` directory.

## 4. Continuous Integration (CI)

We use **GitHub Actions** to automate our testing process. The configuration is in `.github/workflows/ci.yml`.

### CI Pipeline Flow

1.  **Trigger:** The workflow runs on every `push` or `pull_request` to the `main` branch.
2.  **Jobs:** Two parallel jobs are executed:
    -   `backend-tests`: Installs dependencies for the server and runs `npm run test:coverage`.
    -   `frontend-tests`: Installs dependencies for the client, runs the linter (`npm run lint`), and then runs `npm run test:coverage`.
3.  **Status Check:** If any of these steps fail, the workflow fails, preventing broken code from being merged into the main branch.
