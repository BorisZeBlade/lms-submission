const submissionModel = require('../models/submissionModel');
const { validateSubmission } = require('../utils/validation');

function sendSuccess(res, statusCode, data, message = 'Success') {
  return res.status(statusCode).json({ success: true, message, data });
}

function sendError(res, statusCode, message, errors = []) {
  return res.status(statusCode).json({ success: false, message, errors });
}

async function listSubmissions(req, res, next) {
  try {
    const submissions = await submissionModel.getAll({
      status: req.query.status,
      search: req.query.search,
    });
    return sendSuccess(res, 200, submissions, 'Submissions loaded successfully.');
  } catch (error) {
    return next(error);
  }
}

async function getSubmission(req, res, next) {
  try {
    const submission = await submissionModel.getById(req.params.id);
    if (!submission) {
      return sendError(res, 404, 'Submission was not found.');
    }
    return sendSuccess(res, 200, submission, 'Submission loaded successfully.');
  } catch (error) {
    return next(error);
  }
}

async function createSubmission(req, res, next) {
  try {
    const validation = validateSubmission(req.body);
    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed.', validation.errors);
    }

    const created = await submissionModel.create(validation.data);
    return sendSuccess(res, 201, created, 'Submission created successfully.');
  } catch (error) {
    if (error.code === '23505') {
      return sendError(res, 409, 'This student has already submitted this assignment.');
    }
    return next(error);
  }
}

async function updateSubmission(req, res, next) {
  try {
    const existing = await submissionModel.getById(req.params.id);
    if (!existing) {
      return sendError(res, 404, 'Submission was not found.');
    }

    const merged = { ...existing, ...req.body };
    const validation = validateSubmission(merged);
    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed.', validation.errors);
    }

    const updated = await submissionModel.update(req.params.id, validation.data);
    return sendSuccess(res, 200, updated, 'Submission updated successfully.');
  } catch (error) {
    if (error.code === '23505') {
      return sendError(res, 409, 'This student has already submitted this assignment.');
    }
    return next(error);
  }
}

async function deleteSubmission(req, res, next) {
  try {
    const removed = await submissionModel.remove(req.params.id);
    if (!removed) {
      return sendError(res, 404, 'Submission was not found.');
    }
    return sendSuccess(res, 200, { id: Number(req.params.id) }, 'Submission deleted successfully.');
  } catch (error) {
    return next(error);
  }
}

async function getSubmissionStats(req, res, next) {
  try {
    const stats = await submissionModel.getStats();
    return sendSuccess(res, 200, stats, 'Submission statistics loaded successfully.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionStats,
};
