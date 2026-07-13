---
description: "Implementation tasks for the lunch recommendation service"
---

# Tasks: 점심 추천 서비스

**Input**: Design documents from `/specs/001-lunch-recommendation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/recommendation-interface.md`, `quickstart.md`

**Tests**: Runnable validation is required for each non-trivial behavior. Tests
use Node's built-in test runner and the acceptance scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story; shared request validation
and provider boundaries are completed first.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the minimal dependency-free web application structure.

- [X] T001 Create `package.json` with Node.js 20+ metadata and `test`/`start` scripts.
- [X] T002 [P] Create `src/index.html`, `src/app.js`, `src/styles.css`, `server/index.js`, `server/restaurant-provider.js`, and `tests/recommendation.test.js`.
- [X] T003 [P] Add the curated general-menu fixture structure in `src/data/lunch-ideas.json`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the contract, validation, and server boundary required by
both user stories.

- [X] T004 Implement recommendation request validation in `server/index.js` for mode, numeric filters, coordinates, area fallback, and excluded IDs.
- [X] T005 Implement response normalization and freshness filtering in `server/restaurant-provider.js` using the contract in `contracts/recommendation-interface.md`.
- [X] T006 Implement the static-file server and recommendation route dispatch in `server/index.js` without exposing provider credentials to `src/`.
- [X] T007 [P] Add contract-focused validation cases for invalid requests, unverified restaurant items, safe errors, and empty responses in `tests/recommendation.test.js`.

**Checkpoint**: The server boundary rejects invalid input and cannot return
unavailable or unverified restaurant results.

---

## Phase 3: User Story 1 - 오늘의 점심 추천 받기 (Priority: P1) 🎯 MVP

**Goal**: Let a user select recommendation mode and receive a named result with
a recommendation reason, including location fallback for restaurant mode.

**Independent Test**: Select either mode, request recommendations without
filters, and verify at least one correctly typed result or a clear retry/empty
state.

### Implementation for User Story 1

- [X] T008 [US1] Add accessible mode selection, recommendation controls, loading state, result region, and error region in `src/index.html`.
- [X] T009 [US1] Implement idea-mode loading from `src/data/lunch-ideas.json` and result reasons in `src/app.js`.
- [X] T010 [US1] Implement restaurant-mode location permission and manual neighborhood/address fallback in `src/app.js`.
- [X] T011 [US1] Implement the browser request flow for both modes and render only matching result types in `src/app.js`.
- [X] T012 [US1] Implement restaurant-provider configuration and verified-menu mapping in `server/restaurant-provider.js`.
- [X] T013 [US1] Connect the recommendation route to idea data and restaurant-provider results in `server/index.js`.
- [X] T014 [US1] Add responsive layout, visible focus styles, labels, and user-safe loading/error/empty states in `src/styles.css`.
- [X] T015 [US1] Add mode, location fallback, result rendering, refresh exclusion, and provider failure checks in `tests/recommendation.test.js`.
- [X] T016 [US1] Document the completed P1 acceptance flow and expected outcomes in `tests/acceptance.md`.

**Checkpoint**: User Story 1 works independently for both recommendation modes.

---

## Phase 4: User Story 2 - 내 상황에 맞는 추천 받기 (Priority: P2)

**Goal**: Apply category, budget, distance, and dietary filters while preserving
the selected recommendation mode and clear no-match behavior.

**Independent Test**: Select a mode, set one or more filters, request results,
and verify every returned item satisfies the selected filters.

- [X] T017 [US2] Add category, maximum price, maximum distance, and dietary-condition controls in `src/index.html`.
- [X] T018 [US2] Validate and serialize optional filters in the request payload in `src/app.js`.
- [X] T019 [US2] Implement shared category, price, distance, diet-tag, and excluded-ID filtering in `server/index.js`.
- [X] T020 [US2] Pass restaurant location and filter criteria to the provider adapter in `server/restaurant-provider.js`.
- [X] T021 [US2] Implement no-match guidance, condition-clearing, and retry behavior in `src/app.js`.
- [X] T022 [US2] Add filter, invalid-input, no-match, and retry validation cases in `tests/recommendation.test.js`.

**Checkpoint**: User Stories 1 and 2 both work independently and filtered
results never violate required conditions.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete feature against the constitution and quickstart.

- [X] T023 [P] Add representative idea records and filter metadata in `src/data/lunch-ideas.json`.
- [X] T024 [P] Add keyboard-only and accessible-label checks to `tests/acceptance.md`.
- [X] T025 Run the full built-in test command and record the result in `tests/acceptance.md`.
- [X] T026 Run every scenario in `quickstart.md` and document any provider configuration prerequisites in `quickstart.md`.
- [X] T027 Review `src/`, `server/`, and `tests/` for secret exposure, unnecessary dependencies, safe errors, and stale documentation.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T002 and T003 can run in parallel after T001.
- **Foundational (Phase 2)**: Depends on T001 and T002; blocks both user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2; delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 3's request flow and can then be implemented independently.
- **Polish (Phase 5)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1**: Depends on the foundational contract and server boundary only.
- **US2**: Depends on the shared request flow from US1, but its filter behavior is independently testable.

### Parallel Opportunities

- T003 and T007 can run in parallel with unrelated setup/foundation work.
- T008 and T012 can run in parallel after Phase 2 because they touch different boundaries.
- T017 and T020 can run in parallel after US1's request shape is stable.
- T023 and T024 can run in parallel during polish.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for both idea and restaurant modes.
3. Run the independent US1 checks and `quickstart.md` scenarios 1, 2, 5, 6, 8, and 9.
4. Stop and validate before adding filters.

### Incremental Delivery

1. Ship mode selection and unfiltered recommendations as the first usable slice.
2. Add filters and no-match guidance as US2.
3. Complete accessibility, security, and end-to-end validation in Phase 5.

## Notes

- The concrete restaurant data provider and its credentials must be selected
  before T012; do not commit credentials.
- No database, login, ordering, booking, or payment tasks are included because
  they are outside the MVP scope.
