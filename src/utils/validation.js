const VALID_STATUSES = ['draft', 'submitted', 'late', 'graded', 'returned'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isValidUrl(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function normalizeSubmissionInput(body) {
  return {
    student_name: body.student_name ? String(body.student_name).trim() : '',
    student_email: body.student_email ? String(body.student_email).trim().toLowerCase() : '',
    course_name: body.course_name ? String(body.course_name).trim() : '',
    assignment_title: body.assignment_title ? String(body.assignment_title).trim() : '',
    submitted_at: body.submitted_at || new Date().toISOString(),
    status: body.status || 'submitted',
    grade: body.grade === '' || body.grade === undefined || body.grade === null ? null : Number(body.grade),
    feedback: body.feedback ? String(body.feedback).trim() : null,
    file_url: body.file_url ? String(body.file_url).trim() : null,
  };
}

function validateSubmission(body, { partial = false } = {}) {
  const errors = [];
  const data = normalizeSubmissionInput(body);

  const requiredFields = [
    ['student_name', 'Student name is required.'],
    ['student_email', 'Student email is required.'],
    ['course_name', 'Course name is required.'],
    ['assignment_title', 'Assignment title is required.'],
  ];

  if (!partial) {
    requiredFields.forEach(([field, message]) => {
      if (!isNonEmptyString(data[field])) errors.push(message);
    });
  } else {
    Object.keys(body).forEach((field) => {
      if (['student_name', 'student_email', 'course_name', 'assignment_title'].includes(field) && !isNonEmptyString(data[field])) {
        errors.push(`${field} cannot be empty.`);
      }
    });
  }

  if ((!partial || body.student_email !== undefined) && data.student_email && !isValidEmail(data.student_email)) {
    errors.push('Student email must be valid.');
  }

  if ((!partial || body.status !== undefined) && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if ((!partial || body.grade !== undefined) && data.grade !== null) {
    if (Number.isNaN(data.grade) || data.grade < 0 || data.grade > 100) {
      errors.push('Grade must be a number between 0 and 100.');
    }
  }

  if ((!partial || body.file_url !== undefined) && !isValidUrl(data.file_url)) {
    errors.push('File URL must be a valid http or https URL.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data,
  };
}

module.exports = {
  VALID_STATUSES,
  validateSubmission,
  normalizeSubmissionInput,
};
