# Test Suite Summary

## Overview
This document summarizes the intent and behavioral coverage of the `StudentRegister` and `TutorRegister` test suites. These tests validate user role gating, data loading, interactive flows (expansion and multi-step wizard), search/filter operations, registration/assignment actions, constraints, error handling, and feedback mechanisms.

---
## StudentRegister Test Cases (13)
1. Renders program list after loading: Ensures async fetch populates UI.
2. Calls services on mount: Verifies initial program and enrollment requests.
3. Filters by search term: Narrows displayed programs using text input.
4. Filters by category: Applies category constraint (Academic vs others).
5. Expands program to show classes: Reveals nested class list on demand.
6. Opens confirmation modal: Presents registration confirmation UI before action.
7. Successful registration: Calls enroll service and shows success alert.
8. Failed registration: Handles rejected enrollment with error alert.
9. Shows enrolled badge: Displays enrollment status for returned enrollments.
10. Disables full class registration: Prevents action when capacity reached.
11. Skips enrollment load for non-student: Role gating for enrollment fetch.
12. Handles empty search results: Proper UI state with no matches.
13. Unregisters from a class: Confirms and calls unenroll service.

### StudentRegister Behavioral Categories
- Data Loading: Program fetch, conditional enrollment fetch by role.
- Search & Filtering: Text search, category filter UI state changes.
- Conditional Expansion: Program expansion reveals classes lazily.
- Registration Flow: Modal confirmation path (open → confirm → service call → alert).
- Capacity & State Indicators: Full class disable, enrolled badge rendering.
- Error Handling: Alert messaging on failed registration.
- Unregistration: Confirmation + service invocation.

### StudentRegister Service Interactions
- `programService.getProgramsForRegistration`: Retrieves active programs & classes.
- `studentService.getStudentEnrollments`: Fetches existing enrollments (student role only).
- `studentService.enrollStudentInClass` (mocked as overwrite of enroll function): Registers student into class.
- `studentService.unenrollStudentFromClass`: Removes student from class.

---
## TutorRegister Test Cases (14)
1. Shows user loading spinner: Displays interim state while user context loads.
2. Shows authentication required: Protects flow when user not authenticated.
3. Calls program + schedule services: Ensures initial data fetch for wizard entry.
4. Search filters program list: Narrows selectable programs and shows count.
5. Handles empty search: Displays "No Programs Found" when zero matches.
6. Program selection advances to step 2: Transitions from program list to class selection.
7. Available class selection → step 3 (new assignment): Initiates schedule configuration for unassigned class.
8. Assigned class selection shows modify header: Differentiates modification path.
9. Week selection limit enforced: Prevents selecting beyond program `number_of_week`.
10. Excess periods alert: Enforces `period_per_week` limit via alert.
11. Duplicate slot configuration alert: Prevents configuring the same time slot twice.
12. New assignment submission: Calls save service and alerts success.
13. Update assignment submission: Calls update service and alerts success.
14. Unregister from class: Calls unregister service and alerts success.

### TutorRegister Behavioral Categories
- Role & Auth Gating: Loading vs unauthenticated messaging.
- Data Loading: Programs with classes + taken schedules retrieval.
- Multi-Step Wizard: Program → Class → Schedule configuration transitions.
- Search & Filtering: Program narrowing + dynamic count feedback.
- Constraint Enforcement: Week count, period-per-week limit, slot uniqueness.
- Path Differentiation: New assignment vs modification vs unregister.
- Service Result Feedback: Alerts on success (new, update, unregister) and constraint violations.

### TutorRegister Service Interactions
- `programService.getProgramsWithClasses`: Loads program list with class metadata.
- `programService.getTakenSchedules`: Supplies existing occupied schedule slots.
- `programService.saveSchedulesForClass`: Persists new tutor schedule assignment.
- `programService.updateTutorAssignment`: Updates existing tutor assignment schedule.
- `programService.unregisterTutorFromClass`: Removes tutor from class assignment.

---
## Cross-Suite Themes
- User Role Awareness: Student-specific enrollment vs tutor assignment flow gating.
- Progressive Disclosure: Expand (Student) vs step-based wizard (Tutor).
- Search & Filtering Consistency: Input-driven narrowing + empty state handling.
- Constraint Validation: Capacity (students), weeks/periods/duplicates (tutor scheduling).
- Service Invocation Patterns: Clear separation of create, update, delete actions.
- Feedback Channels: Badges, disabled buttons, alerts, conditional headers.
- Error Handling: Explicit alert for failed student registration; (Tutor failure cases not yet tested).

---
## Potential Missing Edge Cases
StudentRegister:
- Program fetch failure / retry path.
- Attempting duplicate registration for already enrolled class (idempotency check).
- Modal cancellation flow (no service call / state unchanged).
TutorRegister:
- Service failure scenarios (save/update/unregister error handling path).
- Handling schedule conflicts returned by `getTakenSchedules` (blocked slot selection).
- Unregister confirmation decline (no service call).
- Attempt submission with insufficient weeks or periods (already partially covered by disabled button, but explicit negative test could add clarity).

---
## Coverage Extension Suggestions
- Simulate service error branches for tutor assignment/update/unregister.
- Add tests around slot conflict resolution using non-empty `getTakenSchedules` mock.
- Validate cancellation paths (modal close or unregister confirm = false).
- Edge case: Program with zero classes (empty class list rendering).

---
## Glossary (Selected Terms)
- Period: A single schedule slot (day + period index) to be configured.
- Weeks Selection: Chosen instructional weeks constrained by `number_of_week`.
- Assignment: Tutor linking to a class plus configured weekly schedule.

---
## Maintenance Notes
- Keep test descriptions aligned with business rules as they evolve.
- Update this file when adding new error handling or constraint logic tests.
- Use concise, action-focused test names to preserve clarity.

