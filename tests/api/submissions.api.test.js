const request = require('supertest');
const app = require('../../src/app');
const submissionModel = require('../../src/models/submissionModel');

jest.mock('../../src/models/submissionModel');

const sampleSubmission = {
  id: 1,
  student_name: 'Roman Nesterenko',
  student_email: 'roman.nesterenko@example.com',
  course_name: 'Software Testing and Quality Assurance',
  assignment_title: 'Final Exam Project',
  submitted_at: '2026-05-03T10:00:00.000Z',
  status: 'submitted',
  grade: null,
  feedback: null,
  file_url: 'https://example.com/final-project.pdf',
  created_at: '2026-05-03T10:00:00.000Z',
  updated_at: '2026-05-03T10:00:00.000Z',
};

function validPayload(overrides = {}) {
  return {
    student_name: 'Roman Nesterenko',
    student_email: `roman.${Date.now()}@example.com`,
    course_name: 'Software Testing and Quality Assurance',
    assignment_title: 'Final Exam Project',
    submitted_at: '2026-05-03T10:00:00.000Z',
    status: 'submitted',
    grade: '',
    feedback: 'Initial submission.',
    file_url: 'https://example.com/final-project.pdf',
    ...overrides,
  };
}

describe('LMS Submission API with mocked database operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/health returns API status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.topic).toBe('Submission in an LMS');
  });

  test('GET /api/submissions returns all submissions', async () => {
    submissionModel.getAll.mockResolvedValue([sampleSubmission]);

    const response = await request(app).get('/api/submissions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(submissionModel.getAll).toHaveBeenCalledWith({ status: undefined, search: undefined });
  });

  test('GET /api/submissions supports status and search filters', async () => {
    submissionModel.getAll.mockResolvedValue([sampleSubmission]);

    const response = await request(app).get('/api/submissions?status=submitted&search=Roman');

    expect(response.status).toBe(200);
    expect(submissionModel.getAll).toHaveBeenCalledWith({ status: 'submitted', search: 'Roman' });
  });

  test('GET /api/submissions/:id returns one submission', async () => {
    submissionModel.getById.mockResolvedValue(sampleSubmission);

    const response = await request(app).get('/api/submissions/1');

    expect(response.status).toBe(200);
    expect(response.body.data.student_name).toBe('Roman Nesterenko');
    expect(submissionModel.getById).toHaveBeenCalledWith('1');
  });

  test('GET /api/submissions/:id returns 404 when submission does not exist', async () => {
    submissionModel.getById.mockResolvedValue(null);

    const response = await request(app).get('/api/submissions/999');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/submissions creates a valid submission', async () => {
    const payload = validPayload();
    submissionModel.create.mockResolvedValue({ ...sampleSubmission, ...payload, id: 2 });

    const response = await request(app).post('/api/submissions').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.student_name).toBe('Roman Nesterenko');
    expect(submissionModel.create).toHaveBeenCalledTimes(1);
  });

  test('POST /api/submissions rejects missing required fields', async () => {
    const response = await request(app).post('/api/submissions').send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      'Student name is required.',
      'Student email is required.',
      'Course name is required.',
      'Assignment title is required.',
    ]));
    expect(submissionModel.create).not.toHaveBeenCalled();
  });

  test('POST /api/submissions rejects invalid email', async () => {
    const response = await request(app)
      .post('/api/submissions')
      .send(validPayload({ student_email: 'wrong-email' }));

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Student email must be valid.');
  });

  test('POST /api/submissions rejects duplicate submission', async () => {
    const duplicateError = new Error('duplicate key');
    duplicateError.code = '23505';
    submissionModel.create.mockRejectedValue(duplicateError);

    const response = await request(app).post('/api/submissions').send(validPayload());

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('This student has already submitted this assignment.');
  });

  test('PUT /api/submissions/:id updates an existing submission', async () => {
    submissionModel.getById.mockResolvedValue(sampleSubmission);
    submissionModel.update.mockResolvedValue({ ...sampleSubmission, status: 'graded', grade: 95, feedback: 'Excellent work.' });

    const response = await request(app)
      .put('/api/submissions/1')
      .send({ status: 'graded', grade: 95, feedback: 'Excellent work.' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('graded');
    expect(response.body.data.grade).toBe(95);
  });

  test('PUT /api/submissions/:id rejects invalid grade', async () => {
    submissionModel.getById.mockResolvedValue(sampleSubmission);

    const response = await request(app).put('/api/submissions/1').send({ grade: 150 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Grade must be a number between 0 and 100.');
    expect(submissionModel.update).not.toHaveBeenCalled();
  });

  test('PUT /api/submissions/:id returns 404 for missing submission', async () => {
    submissionModel.getById.mockResolvedValue(null);

    const response = await request(app).put('/api/submissions/999').send({ status: 'graded' });

    expect(response.status).toBe(404);
    expect(submissionModel.update).not.toHaveBeenCalled();
  });

  test('DELETE /api/submissions/:id deletes submission', async () => {
    submissionModel.remove.mockResolvedValue(true);

    const response = await request(app).delete('/api/submissions/1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Submission deleted successfully.');
  });

  test('DELETE /api/submissions/:id returns 404 when record does not exist', async () => {
    submissionModel.remove.mockResolvedValue(false);

    const response = await request(app).delete('/api/submissions/999');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('GET /api/submissions/stats/summary returns statistics', async () => {
    submissionModel.getStats.mockResolvedValue({ total: 3, submitted: 1, late: 1, graded: 1, returned: 0, draft: 0, average_grade: '92.00' });

    const response = await request(app).get('/api/submissions/stats/summary');

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(3);
    expect(submissionModel.getStats).toHaveBeenCalledTimes(1);
  });

  test('API returns 500 when model throws unexpected error', async () => {
    submissionModel.getAll.mockRejectedValue(new Error('database is down'));

    const response = await request(app).get('/api/submissions');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error.');
  });
});
