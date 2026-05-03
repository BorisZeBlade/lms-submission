# LMS Submission Manager - Final Exam Project

**Student:** Roman Nesterenko  
**Assigned topic:** Submission in an LMS  
**Discipline:** Software Testing and Quality Assurance

This project is a complete web application for managing student submissions in a Learning Management System. It uses Node.js, Express.js, PostgreSQL, HTML, JavaScript, Jest, SuperTest, Cypress, and Artillery.

The project is designed for the final creative exam requirements:

- one assigned object only: `Submission in an LMS`;
- one PostgreSQL table: `submissions`;
- RESTful CRUD API;
- frontend interface for CRUD operations;
- HTTP Client API tests;
- Jest and SuperTest tests with mocked database operations;
- test coverage report;
- Cypress E2E tests;
- Artillery load testing;
- no Docker.

---

## 1. Project Structure

```text
lms-submission-testing/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/db.js
│   ├── controllers/submissionController.js
│   ├── models/submissionModel.js
│   ├── routes/submissionRoutes.js
│   ├── middleware/errorHandler.js
│   └── utils/validation.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/
│   ├── api/submissions.api.test.js
│   └── unit/validation.test.js
├── cypress/e2e/submissions.cy.js
├── http-client/submissions-api.http
├── http-client/http-client.env.json
├── load/submission-load-test.yml
├── load/load-data.js
├── load/load-testing-report.md
├── scripts/setupDatabase.js
├── scripts/resetDatabase.js
├── cypress.config.js
├── package.json
└── .env.example
```

---

## 2. Requirements

Install these tools on your computer:

- Node.js
- PostgreSQL
- IntelliJ IDEA or WebStorm

Docker is not used in this project.

---

## 3. Setup Instructions

### Step 1 - Install dependencies

```bash
npm install
```

### Step 2 - Create `.env` file

Copy `.env.example` and rename it to `.env`.

Example:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lms_submissions
```

Change the PostgreSQL username and password if your local PostgreSQL uses different credentials.

### Step 3 - Create database and tables

```bash
npm run db:setup
```

This command creates the `lms_submissions` database if it does not exist, creates the `submissions` table, and inserts seed data.

### Step 4 - Start the application

```bash
npm start
```

Open the application:

```text
http://localhost:3000
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/submissions` | Get all submissions |
| GET | `/api/submissions?status=submitted` | Filter submissions by status |
| GET | `/api/submissions?search=roman` | Search submissions |
| GET | `/api/submissions/:id` | Get one submission |
| POST | `/api/submissions` | Create submission |
| PUT | `/api/submissions/:id` | Update submission |
| DELETE | `/api/submissions/:id` | Delete submission |
| GET | `/api/submissions/stats/summary` | Get submission statistics |

---

## 5. HTTP Client API Testing

Open this file in IntelliJ IDEA or WebStorm:

```text
http-client/submissions-api.http
```

Choose the `local` environment from `http-client/http-client.env.json` and run the requests one by one.

The file includes HTTP Client tests for:

- health check;
- create submission;
- get all submissions;
- search submissions;
- filter submissions;
- get by ID;
- update submission;
- invalid email validation;
- invalid grade validation;
- statistics;
- delete submission;
- check deleted submission returns 404.

---

## 6. Jest and SuperTest API Tests

Run automated tests:

```bash
npm test
```

Run tests with coverage report:

```bash
npm run test:coverage
```

Open coverage report:

```text
coverage/lcov-report/index.html
```

Important: Jest tests mock the model/database layer. This means the tests do not use the real PostgreSQL database. This follows the exam requirement that database operations must be mocked during Jest-based testing.

---

## 7. Cypress E2E Testing

Start the application first:

```bash
npm start
```

Then open Cypress:

```bash
npm run cypress:open
```

Or run Cypress in headless mode:

```bash
npm run cypress:run
```

The Cypress tests cover user actions in the frontend:

- page loading;
- form visibility;
- creating submission;
- validation errors;
- invalid email;
- searching;
- status filtering;
- editing;
- canceling edit;
- deleting submission;
- refreshing the list.

---

## 8. Load Testing with Artillery

Start the application first:

```bash
npm start
```

Run load test:

```bash
npm run load:test
```

Generate HTML report:

```bash
npm run load:report
```

The load test configuration is here:

```text
load/submission-load-test.yml
```

The written load testing report is here:

```text
load/load-testing-report.md
```

---

## 9. Reset Database

To reset the local PostgreSQL data and insert seed data again:

```bash
npm run db:reset
```

---

## 10. Defense Demo Plan

For a live demonstration, show these steps:

1. Open PostgreSQL and show the `submissions` table.
2. Run `npm start` and open `http://localhost:3000`.
3. Create a new submission in the UI.
4. Edit the submission and add a grade.
5. Delete the submission.
6. Open `http-client/submissions-api.http` and run several API tests.
7. Run `npm test`.
8. Run `npm run test:coverage` and show the coverage folder.
9. Run Cypress with `npm run cypress:open` or `npm run cypress:run`.
10. Run Artillery with `npm run load:test` and show the load testing report.

---

## 11. Notes

This project intentionally uses PostgreSQL without Docker. The database connection is configured through the `.env` file.


## Notes about Cypress and Artillery

The script `npm run cypress:run` now checks whether `http://localhost:3000` is running. If the server is not running, it starts the Express server automatically and then runs Cypress.

The current Artillery version does not support the old `artillery report` command. This project uses a local custom report generator instead:

```bash
npm run load:test
npm run load:report
```

The second command reads `load/artillery-report.json` and creates:

- `load/load-testing-report.md`
- `load/artillery-report.html`
