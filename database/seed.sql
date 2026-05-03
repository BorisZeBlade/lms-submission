INSERT INTO submissions (student_name, student_email, course_name, assignment_title, submitted_at, status, grade, feedback, file_url)
VALUES
('Aigerim Sadykova', 'aigerim.sadykova@example.com', 'Software Testing and Quality Assurance', 'API Testing Report', NOW() - INTERVAL '3 days', 'graded', 92, 'Good API coverage and clean explanation.', 'https://example.com/files/api-report.pdf'),
('Daniyar Omarov', 'daniyar.omarov@example.com', 'Software Testing and Quality Assurance', 'Cypress E2E Tests', NOW() - INTERVAL '1 day', 'submitted', NULL, NULL, 'https://example.com/files/cypress-tests.zip'),
('Mariya Kim', 'mariya.kim@example.com', 'Learning Management Systems', 'LMS UI Prototype', NOW() - INTERVAL '5 days', 'late', NULL, 'Submitted after the deadline.', 'https://example.com/files/lms-ui.zip')
ON CONFLICT (student_email, assignment_title) DO NOTHING;
