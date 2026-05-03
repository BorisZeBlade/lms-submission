# Project Requirements Checklist

| Requirement | Status | Where implemented |
|---|---:|---|
| Assigned object only | Done | Submission in an LMS |
| Node.js | Done | `package.json`, `src/` |
| Express.js | Done | `src/app.js`, `src/server.js` |
| PostgreSQL | Done | `src/config/db.js`, `database/schema.sql` |
| No Docker | Done | No Docker files included |
| One table/collection | Done | `submissions` table |
| RESTful CRUD API | Done | `src/routes/submissionRoutes.js` |
| Web interface for CRUD | Done | `public/index.html`, `public/app.js` |
| HTTP Client API tests | Done | `http-client/submissions-api.http` |
| Jest and SuperTest | Done | `tests/api/submissions.api.test.js` |
| At least 10 API test cases | Done | 16 API tests + 3 validation tests |
| Mock database operations in Jest | Done | `jest.mock('../../src/models/submissionModel')` |
| Coverage report | Done | `npm run test:coverage` |
| Cypress E2E tests | Done | `cypress/e2e/submissions.cy.js` |
| At least 10 E2E test cases | Done | 11 Cypress tests |
| Artillery load testing | Done | `load/submission-load-test.yml` |
| Load testing report | Done | `load/load-testing-report.md` |
| Defense script | Done | `DEFENSE_SCRIPT.md` |
