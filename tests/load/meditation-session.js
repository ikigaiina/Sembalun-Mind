import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration for 10,000+ concurrent users
export const options = {
  stages: [
    // Ramp up to 1000 users over 2 minutes
    { duration: '2m', target: 1000 },
    // Ramp up to 5000 users over 5 minutes  
    { duration: '5m', target: 5000 },
    // Peak load: 10000 users for 10 minutes
    { duration: '10m', target: 10000 },
    // Gradual ramp down over 5 minutes
    { duration: '5m', target: 1000 },
    // Final ramp down to 0
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // Error rate must be less than 1%
    'errors': ['rate<0.01'],
    // 95% of requests must complete within 2 seconds
    'http_req_duration': ['p(95)<2000'],
    // 99% of requests must complete within 5 seconds
    'http_req_duration': ['p(99)<5000'],
    // Average response time must be under 500ms
    'http_req_duration': ['avg<500'],
    // HTTP request rate should be maintained
    'http_reqs': ['rate>100'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4173';

// Sample user data for testing
const users = [
  { email: 'test1@example.com', password: 'testPassword123!' },
  { email: 'test2@example.com', password: 'testPassword123!' },
  { email: 'test3@example.com', password: 'testPassword123!' },
];

export default function() {
  // Simulate user login flow
  const user = users[Math.floor(Math.random() * users.length)];
  
  // 1. Load main page
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'Main page loads': (r) => r.status === 200,
    'Main page loads fast': (r) => r.timings.duration < 1000,
    'Main page has content': (r) => r.body.includes('Sembalun'),
  });
  errorRate.add(response.status !== 200);
  
  sleep(1);
  
  // 2. Navigate to login
  response = http.get(`${BASE_URL}/login`);
  check(response, {
    'Login page loads': (r) => r.status === 200,
    'Login page has form': (r) => r.body.includes('email') || r.body.includes('password'),
  });
  errorRate.add(response.status !== 200);
  
  sleep(1);
  
  // 3. Simulate authentication (mock)
  const authPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  
  response = http.post(`${BASE_URL}/api/auth/login`, authPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  check(response, {
    'Auth request handled': (r) => r.status >= 200 && r.status < 500,
  });
  errorRate.add(response.status >= 500);
  
  sleep(1);
  
  // 4. Load meditation page
  response = http.get(`${BASE_URL}/meditation`);
  check(response, {
    'Meditation page loads': (r) => r.status === 200,
    'Meditation page responsive': (r) => r.timings.duration < 1500,
  });
  errorRate.add(response.status !== 200);
  
  sleep(2);
  
  // 5. Start meditation session
  response = http.get(`${BASE_URL}/meditation?session=guided&duration=5`);
  check(response, {
    'Meditation session starts': (r) => r.status === 200,
    'Session loads quickly': (r) => r.timings.duration < 2000,
  });
  errorRate.add(response.status !== 200);
  
  sleep(1);
  
  // 6. Test PWA manifest
  response = http.get(`${BASE_URL}/manifest.json`);
  check(response, {
    'PWA manifest available': (r) => r.status === 200,
    'Manifest is JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(response.status !== 200);
  
  // 7. Test service worker
  response = http.get(`${BASE_URL}/sw.js`);
  check(response, {
    'Service worker available': (r) => r.status === 200,
    'Service worker is JS': (r) => r.headers['Content-Type'].includes('javascript'),
  });
  errorRate.add(response.status !== 200);
  
  // 8. Load progress page
  response = http.get(`${BASE_URL}/analytics`);
  check(response, {
    'Progress page loads': (r) => r.status === 200,
  });
  errorRate.add(response.status !== 200);
  
  sleep(1);
  
  // Random think time between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `${indent}Load Test Results:\n`;
  summary += `${indent}================\n`;
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.count}\n`;
  summary += `${indent}Average Response Time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms\n`;
  summary += `${indent}95th Percentile: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}99th Percentile: ${data.metrics.http_req_duration['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}Error Rate: ${(data.metrics.errors.rate * 100).toFixed(2)}%\n`;
  
  return summary;
}