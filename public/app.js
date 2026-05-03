const API_URL = '/api/submissions';

const form = document.getElementById('submission-form');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const refreshButton = document.getElementById('refresh-button');
const submissionsList = document.getElementById('submissions-list');
const messageBox = document.getElementById('message');
const statsText = document.getElementById('stats-text');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

let submissions = [];

function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  setTimeout(() => {
    messageBox.className = 'message hidden';
  }, 4500);
}

function getFormData() {
  return {
    student_name: document.getElementById('student_name').value,
    student_email: document.getElementById('student_email').value,
    course_name: document.getElementById('course_name').value,
    assignment_title: document.getElementById('assignment_title').value,
    submitted_at: document.getElementById('submitted_at').value || new Date().toISOString(),
    status: document.getElementById('status').value,
    grade: document.getElementById('grade').value,
    file_url: document.getElementById('file_url').value,
    feedback: document.getElementById('feedback').value,
  };
}

function resetForm() {
  form.reset();
  document.getElementById('submission-id').value = '';
  formTitle.textContent = 'Create Submission';
  submitButton.textContent = 'Save Submission';
  cancelButton.classList.add('hidden');
  document.getElementById('status').value = 'submitted';
}

function formatDate(dateValue) {
  if (!dateValue) return 'Not provided';
  return new Date(dateValue).toLocaleString();
}

function toDateTimeLocal(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function renderSubmissions(items) {
  if (!items.length) {
    submissionsList.innerHTML = '<p class="muted">No submissions found.</p>';
    return;
  }

  submissionsList.innerHTML = items.map((submission) => `
    <article class="submission-card" data-id="${submission.id}">
      <div class="list-header">
        <div>
          <h3>${submission.assignment_title}</h3>
          <span class="status ${submission.status}">${submission.status}</span>
        </div>
        <div class="card-actions">
          <button class="secondary edit-button" data-id="${submission.id}">Edit</button>
          <button class="danger delete-button" data-id="${submission.id}">Delete</button>
        </div>
      </div>
      <div class="meta">
        <span><strong>Student:</strong> ${submission.student_name}</span>
        <span><strong>Email:</strong> ${submission.student_email}</span>
        <span><strong>Course:</strong> ${submission.course_name}</span>
        <span><strong>Submitted:</strong> ${formatDate(submission.submitted_at)}</span>
        <span><strong>Grade:</strong> ${submission.grade ?? 'Not graded'}</span>
        <span><strong>File:</strong> ${submission.file_url ? `<a href="${submission.file_url}" target="_blank">Open file</a>` : 'No file'}</span>
      </div>
      ${submission.feedback ? `<p><strong>Feedback:</strong> ${submission.feedback}</p>` : ''}
    </article>
  `).join('');
}

async function loadStats() {
  const response = await fetch(`${API_URL}/stats/summary`);
  const result = await response.json();
  if (!result.success) return;

  const stats = result.data;
  statsText.textContent = `Total: ${stats.total} | Submitted: ${stats.submitted} | Late: ${stats.late} | Graded: ${stats.graded}`;
}

async function loadSubmissions() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
  if (statusFilter.value) params.append('status', statusFilter.value);

  const response = await fetch(`${API_URL}?${params.toString()}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to load submissions.');
  }

  submissions = result.data;
  renderSubmissions(submissions);
  await loadStats();
}

async function saveSubmission(event) {
  event.preventDefault();
  const id = document.getElementById('submission-id').value;
  const payload = getFormData();

  const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!result.success) {
    showMessage(result.errors?.join(' ') || result.message, 'error');
    return;
  }

  showMessage(result.message);
  resetForm();
  await loadSubmissions();
}

function startEdit(id) {
  const submission = submissions.find((item) => Number(item.id) === Number(id));
  if (!submission) return;

  document.getElementById('submission-id').value = submission.id;
  document.getElementById('student_name').value = submission.student_name;
  document.getElementById('student_email').value = submission.student_email;
  document.getElementById('course_name').value = submission.course_name;
  document.getElementById('assignment_title').value = submission.assignment_title;
  document.getElementById('submitted_at').value = toDateTimeLocal(submission.submitted_at);
  document.getElementById('status').value = submission.status;
  document.getElementById('grade').value = submission.grade ?? '';
  document.getElementById('file_url').value = submission.file_url ?? '';
  document.getElementById('feedback').value = submission.feedback ?? '';

  formTitle.textContent = 'Edit Submission';
  submitButton.textContent = 'Update Submission';
  cancelButton.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteSubmission(id) {
  const confirmed = window.confirm('Delete this submission?');
  if (!confirmed) return;

  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  const result = await response.json();

  if (!result.success) {
    showMessage(result.message, 'error');
    return;
  }

  showMessage(result.message);
  await loadSubmissions();
}

form.addEventListener('submit', saveSubmission);
cancelButton.addEventListener('click', resetForm);
refreshButton.addEventListener('click', loadSubmissions);
searchInput.addEventListener('input', () => loadSubmissions().catch((error) => showMessage(error.message, 'error')));
statusFilter.addEventListener('change', () => loadSubmissions().catch((error) => showMessage(error.message, 'error')));

submissionsList.addEventListener('click', (event) => {
  const editButton = event.target.closest('.edit-button');
  const deleteButton = event.target.closest('.delete-button');

  if (editButton) startEdit(editButton.dataset.id);
  if (deleteButton) deleteSubmission(deleteButton.dataset.id);
});

document.addEventListener('DOMContentLoaded', () => {
  loadSubmissions().catch((error) => showMessage(error.message, 'error'));
});
