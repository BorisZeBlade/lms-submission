const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const submissionRoutes = require('./routes/submissionRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LMS Submission API is running.',
    topic: 'Submission in an LMS',
  });
});

app.use('/api/submissions', submissionRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
