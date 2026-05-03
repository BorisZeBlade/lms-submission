const { validateSubmission, VALID_STATUSES } = require('../../src/utils/validation');

describe('Submission validation helper', () => {
  const payload = {
    student_name: 'Roman Nesterenko',
    student_email: 'roman@example.com',
    course_name: 'Software Testing and Quality Assurance',
    assignment_title: 'Final Exam Project',
    status: 'submitted',
    grade: 90,
    file_url: 'https://example.com/submission.pdf',
  };

  test('accepts a valid submission payload', () => {
    const result = validateSubmission(payload);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('supports all allowed statuses', () => {
    VALID_STATUSES.forEach((status) => {
      const result = validateSubmission({ ...payload, status });
      expect(result.isValid).toBe(true);
    });
  });

  test('rejects invalid file URL', () => {
    const result = validateSubmission({ ...payload, file_url: 'not-a-link' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('File URL must be a valid http or https URL.');
  });
});
