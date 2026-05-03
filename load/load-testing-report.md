# Load Testing Report - LMS Submission Manager

## Objective
The objective of load testing was to check how the `Submission in an LMS` REST API behaves under concurrent requests. The test was implemented with Artillery and focused on response time, throughput, and error rate.

## Tested Endpoints
- `GET /api/health`
- `GET /api/submissions`
- `POST /api/submissions`
- `GET /api/submissions/stats/summary`

## Load Scenario
The Artillery configuration uses three phases:

1. Warm-up phase: 20 seconds with 5 users per second.
2. Ramp-up phase: 30 seconds from 10 to 25 users per second.
3. Sustained load phase: 20 seconds with 25 users per second.

## Commands Used
```bash
npm run load:test
npm run load:report
```

## Results Summary
| Metric | Result |
|---|---:|
| Timestamp | 2026-05-03T19:40:44.823Z |
| Total requests | 4500 |
| Total responses | 4500 |
| Errors | 0 |
| Error rate | 0.00% |
| Request rate | 71 |
| Min response time | 0 ms |
| Mean response time | 3.60 ms |
| Median response time | 2 ms |
| p95 response time | 13.10 ms |
| p99 response time | 16.90 ms |
| Max response time | 162 ms |

## Key Findings
The API was tested with concurrent read and create requests. A successful result is shown by a low error rate and stable response times during the warm-up, ramp-up, and sustained load phases.

## Analysis
The project uses a simple Express.js structure and one PostgreSQL table. Because the tested operations are mostly CRUD operations, the API should remain stable during this exam-level load test. If response time grows during the ramp-up phase, the most likely reasons are local machine limitations, PostgreSQL connection limits, or running the test on the same laptop as the application and database.

## Conclusion
The load test demonstrates that the LMS Submission Manager can handle concurrent API requests for the main operations required in the project: reading submissions, creating submissions, and loading submission statistics.
