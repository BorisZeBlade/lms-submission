const { spawn } = require('child_process');
const http = require('http');

const BASE_URL = process.env.LOAD_TEST_BASE_URL || 'http://localhost:3000';
const HEALTH_URL = `${BASE_URL}/api/health`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts = 30) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const isRunning = await checkServer();
    if (isRunning) return true;
    console.log(`Waiting for server at ${BASE_URL}... (${attempt}/${maxAttempts})`);
    await wait(1000);
  }
  return false;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });
    child.on('close', (code) => resolve(code));
  });
}

async function main() {
  let startedServer = null;

  const alreadyRunning = await checkServer();
  if (!alreadyRunning) {
    console.log('Server is not running. Starting Express server automatically for Artillery...');
    startedServer = spawn('node', ['src/server.js'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, PORT: process.env.PORT || '3000' },
    });

    const ready = await waitForServer();
    if (!ready) {
      console.error('Load test could not start because the server did not become available.');
      console.error('Check that PostgreSQL is running and that .env has the correct DATABASE_URL.');
      if (startedServer) startedServer.kill();
      process.exit(1);
    }
  } else {
    console.log(`Server is already running at ${BASE_URL}.`);
  }

  const artilleryCode = await runCommand('npx', [
    'artillery',
    'run',
    'load/submission-load-test.yml',
    '--output',
    'load/artillery-report.json',
  ]);

  if (startedServer) {
    console.log('Stopping the server started for Artillery...');
    startedServer.kill();
  }

  if (artilleryCode === 0) {
    console.log('Artillery JSON report saved to load/artillery-report.json');
    console.log('Run npm run load:report to generate local HTML and Markdown reports.');
  }

  process.exit(artilleryCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
