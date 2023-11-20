/**
 * To run, download k6: https://k6.io/docs/getting-started/installation
 *
 * Then run:
 * >> k6 run k6.js
 */
import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';
import { scenarios } from './scenarios.js';

const errorRate = new Rate('errors');
const { SCENARIO } = __ENV;

export const options = {
  thresholds: {
    errors: ['rate<0.1'], // <10% errors
    http_req_failed: ['rate<0.01'],

    // 90% of requests must finish within 400ms, 95% within 800, and 99.9% within 1.5s.
    http_req_duration: ['p(90) < 400', 'p(95) < 800', 'p(99.9) < 2500'],
  },
  scenarios: SCENARIO
    ? { [SCENARIO]: scenarios[SCENARIO] }
    : {
        testFilesWithVariableEntries_ConstantVus: {
          executor: 'constant-vus',
          startTime: '1s',
          gracefulStop: '5s',
          vus: 100,
          duration: '10s',
          exec: 'testFilesWithVariableEntries',
          tags: { test_type: 'testFilesWithVariableEntries' },
        },
      },
};

// test/var/log directory
const test_files = [
  'testDir/android_2k.log',
  'testDir/apache_2k.log',
  'empty-file.log',
  'file-with-15-lines.log',
  'file-with-line.log',
  'file-with-newline.log',
];

// min and max inclusive
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function testFilesWithVariableEntries() {
  const rnd = randomIntFromInterval(1, 1000);
  const randFile = test_files[Math.floor(Math.random() * test_files.length)];

  const response = http.get(`http://localhost:3000/logs/${encodeURIComponent(randFile)}/entries/${rnd}`);
  const result = check(response, {
    'is status 200': r => r.status === 200,
  });
  errorRate.add(!result);
}

export function testLargeFileWithVariableEntries() {
  const rnd = randomIntFromInterval(1, 1000);

  const response = http.get(`http://localhost:3000/logs/large_log.log/entries/${rnd}`);
  const result = check(response, {
    'is status 200': r => r.status === 200,
  });
  errorRate.add(!result);
}
