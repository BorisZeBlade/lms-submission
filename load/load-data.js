function generateSubmission(userContext, events, done) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  userContext.vars.student_name = `Load Tester ${stamp}`;
  userContext.vars.student_email = `load.tester.${stamp}@example.com`;
  userContext.vars.course_name = 'Software Testing and Quality Assurance';
  userContext.vars.assignment_title = `Load Testing Submission ${stamp}`;
  return done();
}

module.exports = {
  generateSubmission,
};
