const express = require('express');
const controller = require('../controllers/submissionController');

const router = express.Router();

router.get('/stats/summary', controller.getSubmissionStats);
router.get('/', controller.listSubmissions);
router.get('/:id', controller.getSubmission);
router.post('/', controller.createSubmission);
router.put('/:id', controller.updateSubmission);
router.delete('/:id', controller.deleteSubmission);

module.exports = router;
