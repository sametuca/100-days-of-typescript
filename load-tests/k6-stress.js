import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/health`],
    ['GET', `${BASE_URL}/tasks`],
    ['GET', `${BASE_URL}/metrics/system`],
  ]);

  check(responses[0], {
    'health check status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}