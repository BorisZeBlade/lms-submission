# 5-Minute Defense Speech

Good afternoon. My final exam project is called LMS Submission Manager. My assigned topic is Submission in an LMS, so the whole application is focused only on one object - student submissions.

The project is built with Node.js and Express.js on the backend, PostgreSQL as the database, and a simple HTML and JavaScript interface on the frontend. I did not use Docker because the project is configured to work with a local PostgreSQL database.

The database contains one table called submissions. This table stores the student name, student email, course name, assignment title, submission date, status, grade, feedback, and file URL. This matches the requirement to use one table for one assigned object.

The backend exposes RESTful CRUD endpoints. I implemented endpoints for creating, reading, updating, and deleting submissions. I also added filtering by status, search by text, a health check endpoint, and a small statistics endpoint for the frontend.

The frontend consumes these API endpoints. A user can create a submission, view all submissions, search and filter them, edit a submission, add a grade and feedback, and delete a submission. This shows that the web application is functional, not only the API.

For testing, I used several levels. First, I created HTTP Client tests in IntelliJ format. These tests check the main API endpoints and validate status codes such as 200, 201, 400, 404, and 409.

Second, I used Jest and SuperTest for automated API testing. The important point is that database operations are mocked in these tests. The tests do not depend on a real PostgreSQL database. This makes them faster and more stable, and it also follows the exam requirement that database operations must be mocked for Jest-based testing. The tests cover successful CRUD operations, validation errors, duplicate submission handling, statistics, and server error handling.

Third, I implemented Cypress end-to-end tests. These tests check the application from the user perspective. Cypress opens the web interface and tests actions such as creating a submission, editing it, filtering by status, searching, canceling edit mode, and deleting a record.

Fourth, I added load testing with Artillery. The load test sends concurrent API requests to the application and checks how the system behaves under increasing traffic. The report focuses on response time, throughput, and error rate.

Overall, this project demonstrates a complete testing strategy for a small database-backed web application. It includes the application itself, REST API testing, mocked Jest and SuperTest tests, Cypress E2E tests, Artillery load testing, and a clear project structure.
