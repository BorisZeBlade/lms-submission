require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`LMS Submission app is running on http://localhost:${PORT}`);
});
