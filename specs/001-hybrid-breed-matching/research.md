# Phase 0 Research: 하이브리드 견종 매칭 대시보드

## Decision 1: Preserve the static browser architecture

**Decision**: Keep browser ES modules, the existing `src/` build input, and in-memory state.
Add no framework, backend, persistence, worker, cache, or runtime recommendation service.

**Rationale**: Forty local records can be filtered synchronously well inside the 200 ms goal.
The existing architecture already meets deployment and privacy constraints.

**Alternatives considered**: A UI framework, backend API, web worker, and debounced search were
rejected because each adds state or delivery complexity without solving a measured problem.

## Decision 2: Extract one pure matching module

**Decision**: Put survey mapping, hard filtering, penalty scoring, percentage normalization,
stable sorting, and reset defaults in `src/matching.js`. Keep DOM rendering and event handling
in `src/app.js`.

**Rationale**: The current `app.js` accesses `document` at module load, so pure logic cannot be
tested in Node without extraction. One module is the smallest useful boundary.

**Alternatives considered**: Testing DOM code with jsdom or a browser framework adds a
dependency; splitting models, services, and repositories creates unused abstraction layers.

## Decision 3: Use native controls and progressive disclosure

**Decision**: Use two labeled native range inputs plus an `상관없음` toggle for each range,
native selects for categories, and an initially closed `<details>/<summary>` survey. Recompute
the visual candidate count on every effective change and expose it through one polite status
region without moving focus.

**Rationale**: Native controls supply keyboard behavior and semantics. W3C guidance defines a
disclosure as one control that toggles a content region and requires keyboard activation;
WCAG 2.2 requires dynamic result counts to be programmatically available without taking
focus. See [W3C Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) and
[WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

**Alternatives considered**: Tabs, a second page, and a custom dual-handle slider require more
state, focus handling, and ARIA than the feature needs.

## Decision 4: Use one canonical filter state

**Decision**: Represent `상관없음` as `null`, never as the full numeric range. Direct changes
write the canonical filter immediately. Survey changes update an attribute only when its
required answers are complete. Browser event order implements last-interaction-wins.

**Rationale**: A full range would incorrectly take part in midpoint scoring. Event order avoids
timestamps, provenance flags, and synchronization loops.

**Alternatives considered**: Bidirectional synchronization was rejected because changing a
direct control must not fabricate survey answers.

## Decision 5: Make every mapping explicit

**Decision**: Store survey answer values as integers and weights as integer percentages that
sum to 100. Compare integer weighted points to avoid floating threshold edges.

- Activity: 60/40 weights; `<170` → 1~2, `<240` → 2~4, otherwise 3~5.
- Size: 60/40 weights; `<170` → 1~2, `<240` → 2~3, otherwise 3~5.
- Shedding and grooming: 60/40 weights; `<170` → 1~2, `<240` → 1~3,
  otherwise `상관없음`.
- Housing/noise: the two shared answers feed both housing and barking. Any most-restrictive
  answer forces compact/community housing and barking 1~2; otherwise average soundproofing
  maps barking to 1~3 and good soundproofing maps it to `상관없음`.
- Experience: either novice signal maps to novice; only two experienced signals map to
  experienced.
- Children: either co-residence/contact signal maps to yes; otherwise no.

**Rationale**: High tolerance for shedding, grooming, or barking is not a preference for high
burden, so it must remove that constraint rather than exclude easier breeds.

**Alternatives considered**: One universal numeric mapper for categorical facts and mapping
high tolerance to 3~5 were rejected as misleading.

## Decision 6: Replace the legacy breed schema once

**Decision**: Use explicit objects with stable ASCII IDs. Preserve exercise, grooming, vocal,
tags, and descriptions; add shedding, housing tier, novice-friendly, and child-friendly
metadata; convert size labels to 1~5 so giant breeds remain distinguishable. The mixed-breed record may use `null` size and fails only
an active size filter. Remove legacy `alone`, `train`, `social`, and `cost` after the old scorer
is deleted.

Do not reintroduce the legacy `alone` score as breed-level independence or separation-anxiety
risk. The [RVC Generation Pup study](https://www.rvc.ac.uk/research/facilities-and-resources/animal-welfare-science-and-ethics/news/new-research-reveals-biggest-risk-factors-for-puppies-developing-separation-related-behaviours)
found no significant association between breed and separation-related behaviour occurrence;
that signal needs individual history rather than an invented breed scalar.

**Rationale**: Grooming burden cannot stand in for shedding, and stable IDs cannot depend on
array order. Parallel old/new metadata would allow hidden legacy scoring to survive.

**Alternatives considered**: Inferring new safety fields from train/social scores or tags was
rejected. Each new field requires explicit conservative review.

## Decision 7: Use inclusive pruning and deterministic penalties

**Decision**: Active size and vocal ranges require finite metadata within inclusive bounds.
Housing uses a nested minimum-home tier; novice requires `noviceFriendly`; children=yes requires
`childFriendly`. Experienced and children=no impose no exclusion. Missing active metadata
fails closed.

Survivors receive the sum of absolute distances from active exercise, shedding, and grooming
range midpoints; the selected
priority term is multiplied by 2. Sort ascending by penalty and then by direct ASCII ID
comparison. Normalize percentage against the maximum possible soft-range penalty. With no
active soft range, sort by ID and display `선택 조건 충족`.

**Rationale**: These rules directly implement the specification and make repeated runs and
ties predictable.

**Alternatives considered**: Locale-aware tie sorting and candidate-relative percentage
normalization were rejected because results could change across environments or datasets.

## Decision 8: Use Node's built-in regression runner

**Decision**: Add `npm test` as `node --test` and one `test/matching.test.js` using
`node:assert/strict`. Cover data integrity, every mapping boundary and conflict, inclusive
filters, missing data, priority weight, 0/1/2 candidates, percentage bounds, categorical-only
status, ties, reset, and 100 repeated runs. Validate DOM, keyboard, focus, and responsive flow
through `quickstart.md`.

**Rationale**: Node 20 automatically discovers JavaScript files under `test/`, so no test
dependency or configuration is needed. See the
[Node.js v20 test runner documentation](https://nodejs.org/download/release/v20.0.0/docs/api/test.html).

**Alternatives considered**: jsdom, Playwright, and a multi-file test suite were rejected as
disproportionate for a single static page.
