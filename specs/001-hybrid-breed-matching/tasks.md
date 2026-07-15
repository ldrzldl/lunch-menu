# Tasks: 하이브리드 견종 매칭 대시보드

**Input**: Design documents from `specs/001-hybrid-breed-matching/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/ui-contract.md`, `quickstart.md`

**Verification**: Keep one `test/matching.test.js` regression file. Add each story's failing
checks before its implementation, then run `npm test` and `npm run build`.

**Organization**: Tasks are grouped by user story and ordered to avoid shared-file conflicts.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its stated prerequisites because it touches a different file.
- **[Story]**: Maps implementation work to US1, US2, or US3.
- Every task names the exact file or validation document it changes or executes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable the constitution-required built-in regression command without adding a dependency.

- [X] T001 Add the `node --test` test script in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the normalized shared dataset and minimal pure-module boundary used by every story.

**⚠️ CRITICAL**: Complete this phase before any user story work.

- [X] T002 Create failing dataset invariant checks for 40 unique IDs, scalar bounds, mixed-size null, and required metadata in test/matching.test.js
- [X] T003 Replace positional legacy rows with 40 reviewed explicit Breed records and remove unused scoring fields in src/data/breeds.js
- [X] T004 Create shared range metadata, fixed attribute order, empty FilterConfig defaults, and range validation exports in src/matching.js

**Checkpoint**: `npm test` passes dataset invariants and the shared matcher boundary imports without a DOM.

---

## Phase 3: User Story 1 - 조건을 직접 조정해 후보 확인 (Priority: P1) 🎯 MVP

**Goal**: Let users set direct range and categorical conditions, see the live hard-filter count,
and request a stable Top 3 or fewer.

**Independent Test**: Start from all `상관없음`, change activity, housing, and experience,
verify the live count, then submit and confirm stable 0/1/2/3-result behavior.

### Required Regression Check for User Story 1

- [X] T005 [US1] Add failing inclusive hard-filter, missing-metadata, all-Any, stable-ID tie, and 0/1/2/3-result checks in test/matching.test.js

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement active-condition detection, inclusive hard filtering, candidate counting, base penalty ordering, and Top 3 slicing in src/matching.js
- [X] T007 [P] [US1] Replace the mandatory-quiz-first markup with labeled direct range/select controls, candidate status, submit/reset actions, empty state, and basic ordered results in src/index.html
- [X] T008 [US1] Implement canonical direct-filter state, endpoint clamping, live count, stale-result clearing, submit validation, basic results, and reset events in src/app.js
- [X] T009 [P] [US1] Implement the responsive direct-control dashboard, in-flow/sticky candidate summary, visible focus, validation, and empty/result states in src/styles.css
- [X] T010 [US1] Execute the initial, direct-control, result-boundary, and reset scenarios in specs/001-hybrid-breed-matching/quickstart.md and correct failures in src/index.html, src/app.js, src/styles.css, or src/matching.js

**Checkpoint**: User Story 1 works without opening or completing a questionnaire and is a deployable MVP.

---

## Phase 4: User Story 2 - 설문으로 조건 자동 설정 (Priority: P2)

**Goal**: Let users expand a guide whose completed answer groups map every direct condition,
while partial groups do nothing and the last interaction wins.

**Independent Test**: Exercise all 14 questions, mapping boundaries, shared housing/noise
updates, restrictive conflicts, partial groups, manual overrides, and later survey overrides.

### Required Regression Check for User Story 2

- [X] T011 [US2] Add failing weighted-boundary, high-tolerance Any, exhaustive categorical table, restrictive-conflict, shared-answer, and partial-group checks in test/matching.test.js

### Implementation for User Story 2

- [X] T012 [P] [US2] Define the 14-question schema and implement weighted range mappings, categorical decision tables, shared housing/noise updates, and complete-group detection in src/matching.js
- [X] T013 [P] [US2] Add the initially collapsed native disclosure and semantic fieldset/legend question groups for every mapped condition in src/index.html
- [X] T014 [US2] Render survey questions, retain partial answers, atomically apply completed mappings to direct controls, and enforce browser-event last-write-wins behavior in src/app.js
- [X] T015 [P] [US2] Style the disclosure, survey groups, mapped direct values, and one-column mobile flow without hiding required content in src/styles.css
- [X] T016 [US2] Execute the guided-mapping and last-interaction-wins scenarios in specs/001-hybrid-breed-matching/quickstart.md and correct failures in src/index.html, src/app.js, src/styles.css, or src/matching.js

**Checkpoint**: User Story 2 maps every direct condition and remains independently verifiable through the guide.

---

## Phase 5: User Story 3 - 우선순위와 근거가 있는 결과 이해 (Priority: P3)

**Goal**: Apply priority-weighted deterministic ranking and explain every result with an
appropriate match label, reason, caution, and responsible-use notice.

**Independent Test**: Change only priority and confirm the ×2 penalty effect, repeat identical
inputs 100 times, verify percentage bounds, and verify categorical-only labels and copy.

### Required Regression Check for User Story 3

- [X] T017 [US3] Add failing priority ×2, maximum-penalty normalization, 0/100 clamp, categorical-only label, reason/caution tie order, and 100-run determinism checks in test/matching.test.js

### Implementation for User Story 3

- [X] T018 [P] [US3] Implement priority-weighted midpoint penalties, maximum-penalty percentages, ASCII-ID ties, categorical-only status, and deterministic reason/caution selection in src/matching.js
- [X] T019 [P] [US3] Add the active-range priority select, semantic results heading/list, complete result-card fields, individual-variation notice, and deterministic-matching copy in src/index.html
- [X] T020 [US3] Populate active priority options, reset priority when its range becomes `상관없음`, render percentage or `선택 조건 충족`, reasons and cautions, move focus after valid submit, and clear stale enriched results in src/app.js
- [X] T021 [P] [US3] Style priority and enriched result cards with AA text contrast, solid focus indicators, textual ranks, and responsive reason/caution layout in src/styles.css
- [X] T022 [US3] Execute the priority, deterministic result, responsible-copy, keyboard/focus, and responsive scenarios in specs/001-hybrid-breed-matching/quickstart.md and correct failures in src/index.html, src/app.js, src/styles.css, or src/matching.js

**Checkpoint**: All three user stories work and every recommendation is deterministic and explainable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Synchronize runtime guidance and run the complete release gate.

- [X] T023 [P] Add `npm test` to local deployment verification and describe the deterministic browser-only matcher in DEPLOYMENT.md
- [X] T024 Run `npm test`, `npm run build`, and every scenario in specs/001-hybrid-breed-matching/quickstart.md; correct any release-blocking issue in package.json, src/index.html, src/app.js, src/matching.js, src/data/breeds.js, src/styles.css, or test/matching.test.js
- [X] T025 Separate size/barking hard constraints from activity/shedding/grooming soft preferences, expand size to 1~5, synchronize UI/design artifacts, and run regression checks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: Starts immediately.
- **Phase 2 Foundational**: Depends on T001 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and delivers the MVP.
- **Phase 4 US2**: Depends on US1's direct controls and canonical filter state.
- **Phase 5 US3**: Depends on US1's filter/result foundation, but not on US2's mappings.
- **Phase 6 Polish**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup → Foundation → US1 (MVP) ─┬→ US2
                                └→ US3
US2 + US3 → Polish
```

US2 and US3 are behaviorally independent after US1, but both edit `test/matching.test.js`,
`src/matching.js`, `src/index.html`, `src/app.js`, and `src/styles.css`; execute them sequentially
unless file ownership is explicitly coordinated.

### Within Each User Story

- Write and run the story's regression task first; it MUST fail for the missing behavior.
- Implement pure logic and markup in parallel where marked `[P]`.
- Integrate state/events after their pure logic and markup prerequisites.
- Style only against established markup, then run the story checkpoint.

### Parallel Opportunities

- **US1**: T006 and T007 can run together; after T007, T009 can run alongside T008.
- **US2**: T012 and T013 can run together; after T013, T015 can run alongside T014.
- **US3**: T018 and T019 can run together; after T019, T021 can run alongside T020.
- **Polish**: T023 can be prepared independently before T024.

## Parallel Examples

### User Story 1

```text
Task T006: Implement direct matching logic in src/matching.js
Task T007: Implement direct dashboard markup in src/index.html
```

### User Story 2

```text
Task T012: Implement survey mapping in src/matching.js
Task T013: Implement questionnaire markup in src/index.html
```

### User Story 3

```text
Task T018: Implement weighted scoring in src/matching.js
Task T019: Implement priority/result markup in src/index.html
```

## Implementation Strategy

### MVP First

1. Complete T001-T004.
2. Complete T005-T010 for User Story 1.
3. Stop and validate the direct-control MVP before guided survey or explanation enhancements.

### Incremental Delivery

1. **US1**: Direct controls, live candidate count, stable Top 3.
2. **US2**: Guided mapping for every direct condition with last-write-wins synchronization.
3. **US3**: Priority, percentage/status, reasons, cautions, and responsible copy.
4. **Polish**: Documentation and full release validation.

## Notes

- No new runtime or test dependency is allowed by this plan.
- Keep all deterministic checks in `test/matching.test.js`; do not create a test framework.
- `상관없음` is `null`, not a full active range.
- Do not infer shedding from grooming or safety flags from legacy scores.
- Commit after each task or logical group if using version control.
