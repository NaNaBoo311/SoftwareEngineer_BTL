# Load Testing Registration APIs (k6)

This folder contains a k6 script to stress registration-related endpoints for Students and Tutors.

## Files
- `k6_registration.js`: Main script performing mixed read/write operations.

## Prerequisites
- Install k6:
  - Windows (Chocolatey): `choco install k6`
- Obtain a JWT `TOKEN` for authenticated endpoints if your API requires it.
- Identify your API base URL (`BASE_URL`) and real endpoints.

## Running
Example against staging:
```powershell
k6 run tests/load/k6_registration.js -e BASE_URL=https://your-staging.example -e TOKEN=yourJwt -e VUS=50 -e DURATION=60s
```
Local run:
```powershell
k6 run tests/load/k6_registration.js -e BASE_URL=http://localhost:3000 -e VUS=20 -e DURATION=30s
```
Thresholds:
- p95 latency `< 500ms`
- failed requests rate `< 2%`

## Route Alignment
Update `routes` in `k6_registration.js` to match your backend:
```js
const routes = {
  programs: '/api/programs/with-classes',
  takenSchedules: '/api/schedules/taken',
  studentEnrollments: '/api/students/enrollments',
  enroll: '/api/students/enroll',
  unenroll: '/api/students/unenroll',
  tutorSave: '/api/tutors/assign/save',
  tutorUpdate: '/api/tutors/assign/update',
  tutorUnregister: '/api/tutors/assign/unregister',
};
```

### Supabase REST/RPC Example
If using Supabase REST or RPC functions, your routes might look like:
```js
const routes = {
  programs: '/rest/v1/programs_with_classes?select=*',
  takenSchedules: '/rest/v1/taken_schedules?select=*',
  studentEnrollments: '/rest/v1/student_enrollments?select=*&student_id=eq.student-123',
  enroll: '/rest/v1/rpc/enroll_student',
  unenroll: '/rest/v1/rpc/unenroll_student',
  tutorSave: '/rest/v1/rpc/save_schedules_for_class',
  tutorUpdate: '/rest/v1/rpc/update_tutor_assignment',
  tutorUnregister: '/rest/v1/rpc/unregister_tutor_from_class',
};
```
Include an `Authorization: Bearer <anon or service key>` header or JWT, and `apikey` header if required by your Supabase config.

## Payloads
Adjust IDs to exist in your staging data:
```js
const payloads = {
  enroll: { studentId: 'student-123', classId: 'class-1' },
  unenroll: { studentId: 'student-123', classId: 'class-1' },
  tutorSave: { classId: 'c1', tutorId: 'tutor-123', schedules: [{ week: 1, day: 2, period: 3, room: 'R101' }] },
  tutorUpdate: { classId: 'c2', tutorId: 'tutor-123', schedules: [{ week: 2, day: 3, period: 2, room: 'R102' }] },
  tutorUnregister: { classId: 'c2' },
};
```

## Results Interpretation
- Watch `http_req_duration` and `http_req_failed` to understand performance and resilience.
- If your API enforces rate limiting, expect `429` for abusive patterns; the script treats 2xx and 429 as acceptable for write calls.

## Tips
- Start with `VUS=20` and `DURATION=30s`, then scale up as needed.
- Run separate scenarios for read-heavy vs write-heavy tests to isolate bottlenecks.
- Tag k6 metrics with environment labels for easier comparison.
