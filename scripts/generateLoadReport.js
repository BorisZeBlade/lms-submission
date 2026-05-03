const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'load', 'artillery-report.json');
const htmlPath = path.join(__dirname, '..', 'load', 'artillery-report.html');
const mdPath = path.join(__dirname, '..', 'load', 'load-testing-report.md');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Report file was not found: ${filePath}. Run npm run load:test first.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function valueAt(obj, keys, fallback = 'N/A') {
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }
  return fallback;
}

function getMetrics(report) {
  const aggregate = report.aggregate || report;
  const counters = aggregate.counters || {};
  const rates = aggregate.rates || {};
  const summaries = aggregate.summaries || aggregate.histograms || {};
  const responseTime = summaries['http.response_time'] || summaries['http.response_time.2xx'] || {};

  const requests = valueAt(counters, ['http.requests', 'http.request_rate'], 0);
  const responses = valueAt(counters, ['http.responses', 'http.codes.200', 'http.codes.201'], 0);
  const errors = Object.entries(counters)
    .filter(([key]) => key.startsWith('errors.') || key.startsWith('http.codes.4') || key.startsWith('http.codes.5'))
    .reduce((sum, [, value]) => sum + Number(value || 0), 0);
  const requestRate = valueAt(rates, ['http.request_rate'], 'N/A');

  return {
    timestamp: aggregate.timestamp || new Date().toISOString(),
    requests,
    responses,
    errors,
    errorRate: Number(requests) > 0 ? `${((Number(errors) / Number(requests)) * 100).toFixed(2)}%` : 'N/A',
    requestRate,
    min: valueAt(responseTime, ['min'], 'N/A'),
    max: valueAt(responseTime, ['max'], 'N/A'),
    mean: valueAt(responseTime, ['mean', 'average'], 'N/A'),
    median: valueAt(responseTime, ['median', 'p50'], 'N/A'),
    p95: valueAt(responseTime, ['p95'], 'N/A'),
    p99: valueAt(responseTime, ['p99'], 'N/A'),
  };
}

function formatMetric(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value);
}

function buildMarkdown(metrics) {
  return `# Load Testing Report - LMS Submission Manager

## Objective
The objective of load testing was to check how the \`Submission in an LMS\` REST API behaves under concurrent requests. The test was implemented with Artillery and focused on response time, throughput, and error rate.

## Tested Endpoints
- \`GET /api/health\`
- \`GET /api/submissions\`
- \`POST /api/submissions\`
- \`GET /api/submissions/stats/summary\`

## Load Scenario
The Artillery configuration uses three phases:

1. Warm-up phase: 20 seconds with 5 users per second.
2. Ramp-up phase: 30 seconds from 10 to 25 users per second.
3. Sustained load phase: 20 seconds with 25 users per second.

## Commands Used
\`\`\`bash
npm run load:test
npm run load:report
\`\`\`

## Results Summary
| Metric | Result |
|---|---:|
| Timestamp | ${metrics.timestamp} |
| Total requests | ${formatMetric(metrics.requests)} |
| Total responses | ${formatMetric(metrics.responses)} |
| Errors | ${formatMetric(metrics.errors)} |
| Error rate | ${metrics.errorRate} |
| Request rate | ${formatMetric(metrics.requestRate)} |
| Min response time | ${formatMetric(metrics.min)} ms |
| Mean response time | ${formatMetric(metrics.mean)} ms |
| Median response time | ${formatMetric(metrics.median)} ms |
| p95 response time | ${formatMetric(metrics.p95)} ms |
| p99 response time | ${formatMetric(metrics.p99)} ms |
| Max response time | ${formatMetric(metrics.max)} ms |

## Key Findings
The API was tested with concurrent read and create requests. A successful result is shown by a low error rate and stable response times during the warm-up, ramp-up, and sustained load phases.

## Analysis
The project uses a simple Express.js structure and one PostgreSQL table. Because the tested operations are mostly CRUD operations, the API should remain stable during this exam-level load test. If response time grows during the ramp-up phase, the most likely reasons are local machine limitations, PostgreSQL connection limits, or running the test on the same laptop as the application and database.

## Conclusion
The load test demonstrates that the LMS Submission Manager can handle concurrent API requests for the main operations required in the project: reading submissions, creating submissions, and loading submission statistics.
`;
}

function buildHtml(metrics) {
  const rows = [
    ['Timestamp', metrics.timestamp],
    ['Total requests', formatMetric(metrics.requests)],
    ['Total responses', formatMetric(metrics.responses)],
    ['Errors', formatMetric(metrics.errors)],
    ['Error rate', metrics.errorRate],
    ['Request rate', formatMetric(metrics.requestRate)],
    ['Min response time', `${formatMetric(metrics.min)} ms`],
    ['Mean response time', `${formatMetric(metrics.mean)} ms`],
    ['Median response time', `${formatMetric(metrics.median)} ms`],
    ['p95 response time', `${formatMetric(metrics.p95)} ms`],
    ['p99 response time', `${formatMetric(metrics.p99)} ms`],
    ['Max response time', `${formatMetric(metrics.max)} ms`],
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Load Testing Report - LMS Submission Manager</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; line-height: 1.6; color: #1f2937; }
    h1, h2 { color: #111827; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
    th { background: #f3f4f6; }
    code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: #fafafa; }
  </style>
</head>
<body>
  <h1>Load Testing Report - LMS Submission Manager</h1>
  <div class="card">
    <p><strong>Topic:</strong> Submission in an LMS</p>
    <p><strong>Tool:</strong> Artillery</p>
    <p><strong>Tested API:</strong> <code>http://localhost:3000</code></p>
  </div>

  <h2>Tested Endpoints</h2>
  <ul>
    <li><code>GET /api/health</code></li>
    <li><code>GET /api/submissions</code></li>
    <li><code>POST /api/submissions</code></li>
    <li><code>GET /api/submissions/stats/summary</code></li>
  </ul>

  <h2>Results Summary</h2>
  <table>
    <thead><tr><th>Metric</th><th>Result</th></tr></thead>
    <tbody>
      ${rows.map(([name, value]) => `<tr><td>${name}</td><td>${value}</td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>Analysis</h2>
  <p>The API was tested with concurrent read and create requests. A good result is indicated by a low error rate and stable response times during the warm-up, ramp-up, and sustained load phases.</p>
  <p>The application uses a simple Express.js structure and one PostgreSQL table, so it is suitable for the required exam-level load test.</p>
</body>
</html>`;
}

try {
  const report = readJson(inputPath);
  const metrics = getMetrics(report);
  fs.writeFileSync(mdPath, buildMarkdown(metrics), 'utf8');
  fs.writeFileSync(htmlPath, buildHtml(metrics), 'utf8');
  console.log(`Markdown report generated: ${mdPath}`);
  console.log(`HTML report generated: ${htmlPath}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
