import http from 'k6/http';
import { check, sleep } from 'k6';

// Basic load test for registration-related endpoints.
// Configure via environment variables.
// Example run:
// k6 run tests/load/k6_registration.js -e BASE_URL=https://your-staging.example -e TOKEN=... -e VUS=50 -e DURATION=60s

export const options = {
  vus: __ENV.VUS ? Number(__ENV.VUS) : 20,
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://encwlxkvhlblxkadqvgz.supabase.co';
const TOKEN = __ENV.TOKEN || '';
const ANON_KEY = __ENV.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY3dseGt2aGxibHhrYWRxdmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzU4OTIsImV4cCI6MjA3NTI1MTg5Mn0.2SAubnKPfaGPGgpGKPFfgLQuXcKUXINYyNe-Ulzwk_M';

// Supabase REST API routes
const routes = {
  programs: '/rest/v1/programs?select=*',
  classes: '/rest/v1/classes?select=*',
  enrollments: '/rest/v1/student_enrollments?select=*',
  schedules: '/rest/v1/schedules?select=*',
};

function authHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  return headers;
}

export default function () {
  // Read-heavy endpoints testing Supabase tables
  const headers = authHeaders();

  const resPrograms = http.get(`${BASE_URL}${routes.programs}`, { headers });
  check(resPrograms, { 'programs 200': (r) => r.status === 200 });

  const resClasses = http.get(`${BASE_URL}${routes.classes}`, { headers });
  check(resClasses, { 'classes 200': (r) => r.status === 200 });

  // Skip enrollments - RLS requires student_id filter
  // const resEnrollments = http.get(`${BASE_URL}${routes.enrollments}`, { headers });
  // check(resEnrollments, { 'enrollments 200': (r) => r.status === 200 });

  const resSchedules = http.get(`${BASE_URL}${routes.schedules}`, { headers });
  check(resSchedules, { 'schedules 200': (r) => r.status === 200 });

  // Short think time
  sleep(1);
}
