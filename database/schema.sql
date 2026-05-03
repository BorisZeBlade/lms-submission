CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(150) NOT NULL,
    course_name VARCHAR(120) NOT NULL,
    assignment_title VARCHAR(150) NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'late', 'graded', 'returned')),
    grade NUMERIC(5, 2) CHECK (grade IS NULL OR (grade >= 0 AND grade <= 100)),
    feedback TEXT,
    file_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_assignment UNIQUE (student_email, assignment_title)
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_student_email ON submissions(student_email);
CREATE INDEX IF NOT EXISTS idx_submissions_course_name ON submissions(course_name);
