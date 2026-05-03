function uniqueSubmission(overrides = {}) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return {
    student_name: `Cypress Tester ${stamp}`,
    student_email: `cypress.tester.${stamp}@example.com`,
    course_name: 'Software Testing and Quality Assurance',
    assignment_title: `Cypress E2E Assignment ${stamp}`,
    file_url: 'https://example.com/cypress-submission.pdf',
    feedback: 'Created during Cypress test.',
    ...overrides,
  };
}

function typeField(selector, value) {
  cy.get(selector)
    .scrollIntoView({ duration: 0 })
    .should('exist')
    .clear({ force: true })
    .type(value, { force: true });
}

function selectField(selector, value) {
  cy.get(selector)
    .scrollIntoView({ duration: 0 })
    .should('exist')
    .select(value, { force: true });
}

function fillSubmissionForm(data) {
  typeField('#student_name', data.student_name);
  typeField('#student_email', data.student_email);
  typeField('#course_name', data.course_name);
  typeField('#assignment_title', data.assignment_title);
  selectField('#status', data.status || 'submitted');
  if (data.grade !== undefined) typeField('#grade', String(data.grade));
  typeField('#file_url', data.file_url);
  typeField('#feedback', data.feedback);
}

describe('LMS Submission Manager E2E tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the homepage and shows project title', () => {
    cy.contains('h1', 'LMS Submission Manager').should('be.visible');
    cy.contains('Submission in an LMS').should('be.visible');
  });

  it('shows the create submission form fields', () => {
    cy.get('#student_name').should('be.visible');
    cy.get('#student_email').should('be.visible');
    cy.get('#course_name').should('be.visible');
    cy.get('#assignment_title').should('be.visible');
    cy.get('#submit-button').should('contain', 'Save Submission');
  });

  it('creates a new submission through the UI', () => {
    const data = uniqueSubmission();
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    cy.contains('Submission created successfully.').should('be.visible');
    cy.contains(data.assignment_title).should('be.visible');
    cy.contains(data.student_email).should('be.visible');
  });

  it('shows validation errors for an empty submission form', () => {
    cy.get('#student_name').clear();
    cy.get('#student_email').clear();
    cy.get('#course_name').clear();
    cy.get('#assignment_title').clear();
    cy.get('#submit-button').click();
    cy.contains('Student name is required.').should('be.visible');
  });

  it('shows validation error for invalid email', () => {
    const data = uniqueSubmission({ student_email: 'wrong-email' });
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    cy.contains('Student email must be valid.').should('be.visible');
  });

  it('filters submissions by search text', () => {
    const data = uniqueSubmission({ student_name: 'Searchable Cypress Student' });
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    typeField('#search-input', data.student_email);
    cy.contains(data.assignment_title).should('be.visible');
    cy.contains(data.student_email).should('be.visible');
  });

  it('filters submissions by status', () => {
    const data = uniqueSubmission({ status: 'late' });
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    cy.get('#status-filter').select('late');
    cy.contains(data.assignment_title).should('be.visible');
    cy.contains('late').should('be.visible');
  });

  it('updates a submission status, grade, and feedback', () => {
    const data = uniqueSubmission();
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    cy.contains(data.assignment_title).parents('.submission-card').find('.edit-button').click();
    cy.get('#status').select('graded');
    typeField('#grade', '97');
    typeField('#feedback', 'Updated by Cypress after review.');
    cy.get('#submit-button').click();
    cy.contains('Submission updated successfully.').should('be.visible');
    cy.contains('97').should('be.visible');
    cy.contains('Updated by Cypress after review.').should('be.visible');
  });

  it('cancels edit mode and returns to create mode', () => {
    const data = uniqueSubmission();
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    cy.contains(data.assignment_title).parents('.submission-card').find('.edit-button').click();
    cy.get('#cancel-button').click();
    cy.get('#form-title').should('contain', 'Create Submission');
    cy.get('#submit-button').should('contain', 'Save Submission');
  });

  it('deletes a submission from the UI', () => {
    const data = uniqueSubmission();
    fillSubmissionForm(data);
    cy.get('#submit-button').click();
    cy.contains(data.assignment_title).should('be.visible');
    cy.on('window:confirm', () => true);
    cy.contains(data.assignment_title).parents('.submission-card').find('.delete-button').click();
    cy.contains('Submission deleted successfully.').should('be.visible');
    cy.contains(data.assignment_title).should('not.exist');
  });

  it('refreshes the submission list', () => {
    cy.get('#refresh-button').click();
    cy.get('#stats-text').should('contain', 'Total:');
  });
});
