const db = require('../config/db');

const baseSelect = `
  SELECT id, student_name, student_email, course_name, assignment_title,
         submitted_at, status, grade, feedback, file_url, created_at, updated_at
  FROM submissions
`;

async function getAll(filters = {}) {
  const params = [];
  const conditions = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search.toLowerCase()}%`);
    conditions.push(`(
      LOWER(student_name) LIKE $${params.length}
      OR LOWER(student_email) LIKE $${params.length}
      OR LOWER(course_name) LIKE $${params.length}
      OR LOWER(assignment_title) LIKE $${params.length}
    )`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.query(`${baseSelect} ${whereClause} ORDER BY created_at DESC`, params);
  return result.rows;
}

async function getById(id) {
  const result = await db.query(`${baseSelect} WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function create(data) {
  const result = await db.query(
    `INSERT INTO submissions
      (student_name, student_email, course_name, assignment_title, submitted_at, status, grade, feedback, file_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, student_name, student_email, course_name, assignment_title,
               submitted_at, status, grade, feedback, file_url, created_at, updated_at`,
    [
      data.student_name,
      data.student_email,
      data.course_name,
      data.assignment_title,
      data.submitted_at,
      data.status,
      data.grade,
      data.feedback,
      data.file_url,
    ],
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await db.query(
    `UPDATE submissions
     SET student_name = $1,
         student_email = $2,
         course_name = $3,
         assignment_title = $4,
         submitted_at = $5,
         status = $6,
         grade = $7,
         feedback = $8,
         file_url = $9,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
     RETURNING id, student_name, student_email, course_name, assignment_title,
               submitted_at, status, grade, feedback, file_url, created_at, updated_at`,
    [
      data.student_name,
      data.student_email,
      data.course_name,
      data.assignment_title,
      data.submitted_at,
      data.status,
      data.grade,
      data.feedback,
      data.file_url,
      id,
    ],
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query('DELETE FROM submissions WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

async function getStats() {
  const result = await db.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'submitted')::int AS submitted,
      COUNT(*) FILTER (WHERE status = 'late')::int AS late,
      COUNT(*) FILTER (WHERE status = 'graded')::int AS graded,
      COUNT(*) FILTER (WHERE status = 'returned')::int AS returned,
      COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
      ROUND(AVG(grade), 2) AS average_grade
    FROM submissions
  `);
  return result.rows[0];
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getStats,
};
