---
description: "Implementation tasks for the dog-care readiness simulation"
---

# Tasks: 강아지 양육 시뮬레이션

**Input**: Design documents from `/specs/001-puppy-care-simulation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/simulation-interface.md`, `quickstart.md`

**Tests**: Runnable validation is required for every non-trivial behavior. Tests
use Node's built-in test runner and the scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story; shared domain logic and
persistence are completed before story-specific UI work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the dependency-free browser application structure.

- [X] T001 Create `package.json` with Node.js 20+ metadata and `test`/`start` scripts.
- [X] T002 [P] Create `src/index.html`, `src/app.js`, `src/styles.css`, `src/data/care-scenarios.json`, `server/index.js`, and `tests/simulation.test.js`.
- [X] T003 [P] Verify `.gitignore` contains `node_modules/`, `*.log`, `.env*`, and `.DS_Store`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the domain model, deterministic schedule, and safe local
storage required by every user story.

- [X] T004 Implement session, care-request, care-record, and reflection state transitions in `src/app.js`.
- [X] T005 Implement seeded bounded-irregular request generation from `src/data/care-scenarios.json` in `src/app.js`.
- [X] T006 Implement local session persistence, schema validation, and retry-safe save errors in `src/app.js`.
- [X] T007 [P] Add domain and contract tests for state transitions, seeded schedules, idempotent completion, and invalid actions in `tests/simulation.test.js`.
- [X] T008 [P] Implement static asset serving and safe fallback errors in `server/index.js`.

**Checkpoint**: A session can be created, persisted, reloaded, and advanced
through valid request states without duplicate completion records.

---

## Phase 3: User Story 1 - 강아지 돌봄 일정 체험하기 (Priority: P1) 🎯 MVP

**Goal**: Start a simulation and receive irregular care requests with deadlines.

**Independent Test**: Start a session, wait or advance the fixture clock to a
due request, and verify the request appears with its type, deadline, and status.

### Tests for User Story 1

- [X] T009 [P] [US1] Add start, pause, resume, due-time, and missed-request recovery tests in `tests/simulation.test.js`.

### Implementation for User Story 1

- [X] T010 [US1] Add session start, pause, resume, and abandon controls in `src/index.html`.
- [X] T011 [US1] Render the active request list with type, due time, deadline, status, and actions in `src/app.js`.
- [X] T012 [US1] Implement visibility-change and reload reconciliation for due and missed requests in `src/app.js`.
- [X] T013 [US1] Implement optional system notifications with in-app fallback in `src/app.js`.
- [X] T014 [US1] Add accessible labels, focus styles, status announcements, loading, empty, and retry states in `src/index.html` and `src/styles.css`.
- [X] T015 [US1] Add the start-to-first-request acceptance flow to `tests/acceptance.md`.

**Checkpoint**: The P1 schedule experience works with notifications allowed,
denied, missed, or unavailable.

---

## Phase 4: User Story 2 - 돌봄 행동 수행하기 (Priority: P1)

**Goal**: Record completion, deferral, and missed actions and show current burden.

**Independent Test**: Complete one request, defer another, reload, and verify
the states, counts, and accumulated care time are correct.

### Tests for User Story 2

- [X] T016 [P] [US2] Add complete, defer, duplicate-action, persistence-failure, and current-summary tests in `tests/simulation.test.js`.

### Implementation for User Story 2

- [X] T017 [US2] Add complete, defer, and acknowledge action controls in `src/index.html`.
- [X] T018 [US2] Implement idempotent care-action recording and append-only care records in `src/app.js`.
- [X] T019 [US2] Render pending requests, completion rate, delays, missed count, and total care minutes in `src/app.js`.
- [X] T020 [US2] Implement user-safe persistence failure and retry behavior in `src/app.js`.
- [X] T021 [US2] Add representative care types and bounded duration metadata in `src/data/care-scenarios.json`.

**Checkpoint**: Each care action is recorded once, remains correct after reload,
and never displays an unsuccessful save as completed.

---

## Phase 5: User Story 3 - 양육 준비도 돌아보기 (Priority: P2)

**Goal**: Show a non-judgmental reflection summary without issuing an adoption
readiness verdict.

**Independent Test**: Complete a fixture session and verify derived patterns,
self-check questions, and explicit scope limitations are shown.

### Tests for User Story 3

- [X] T022 [P] [US3] Add completed-session reflection, derived-pattern, and no-readiness-score tests in `tests/simulation.test.js`.

### Implementation for User Story 3

- [X] T023 [US3] Add completion and reflection sections to `src/index.html`.
- [X] T024 [US3] Implement derived reflection counts, difficulty patterns, and self-check questions in `src/app.js`.
- [X] T025 [US3] Add the limitation, no-matching, no-sale, and no-adoption-verdict guidance to `src/index.html`.
- [X] T026 [US3] Add reflection, accessibility, and scope-boundary acceptance scenarios to `tests/acceptance.md`.

**Checkpoint**: A completed session produces useful patterns and questions but no
misleading suitability score or matching action.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against the plan and constitution.

- [X] T027 [P] Add responsive layout and mobile-friendly controls in `src/styles.css`.
- [X] T028 [P] Add keyboard-only and notification-denied acceptance checks to `tests/acceptance.md`.
- [X] T029 Run `npm test` and every scenario in `quickstart.md`; record results in `tests/acceptance.md`.
- [X] T030 Verify Constitution Check gates, accessibility, safe errors, state transitions, idempotency, and persistence-recovery constraints across `src/`, `server/`, and `tests/`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T002 and T003 can run in parallel after T001.
- **Foundational (Phase 2)**: Depends on T001 and T002; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 and delivers the MVP schedule flow.
- **User Story 2 (Phase 4)**: Depends on the request list from US1 but remains independently testable.
- **User Story 3 (Phase 5)**: Depends on persisted care records from US2.
- **Polish (Phase 6)**: Depends on all desired user stories.

### User Story Dependencies

- **US1**: Depends only on the foundational session and schedule model.
- **US2**: Depends on US1's request rendering and action boundary.
- **US3**: Depends on US2's care records and derived counts.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T007 and T008 can run in parallel after the foundational domain shape is agreed.
- T009 and T014 can run in parallel after the US1 markup exists.
- T016 and T021 can run in parallel after the US2 data shape exists.
- T022 and T025 can run in parallel after the reflection shape is agreed.
- T027 and T028 can run in parallel during polish.

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for session start, irregular requests, pause/resume, and notification fallback.
3. Run the US1 tests and quickstart scenarios 1, 2, 4, 5, 6, and 10.
4. Stop and validate the schedule experience before adding reflection polish.

### Incremental Delivery

1. Ship session scheduling and missed-request recovery as the first usable slice.
2. Add care-action recording and burden summary as US2.
3. Add reflection and scope guidance as US3.
4. Complete accessibility, persistence-failure, and end-to-end acceptance checks.

## Notes

- The current MVP intentionally does not add accounts, a database, push-service
  credentials, adoption tracking, matching, or sale workflows.
- Every task includes an exact file path and must be marked `[X]` after completion.
