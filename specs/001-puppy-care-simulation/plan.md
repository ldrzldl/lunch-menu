# Implementation Plan: 강아지 양육 시뮬레이션

**Branch**: `001-puppy-care-simulation` | **Date**: 2026-07-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-puppy-care-simulation/spec.md`

## Summary

Build a small browser-based simulation that creates irregular dog-care requests,
records completion or delay, and produces a readiness reflection. The MVP uses
the existing Node.js web-app baseline, native browser capabilities, and local
anonymous session data. System notifications are best-effort; the in-app request
list and next-open catch-up remain authoritative when notifications are denied,
missed, or unavailable.

## Technical Context

**Language/Version**: Browser JavaScript, HTML, and CSS with Node.js 20+

**Primary Dependencies**: Existing Node.js runtime and native browser APIs only;
no new runtime dependency is required for the MVP

**Storage**: Browser-local anonymous session data; no account, server-side
profile, or cross-device synchronization in the MVP

**Testing**: Node's built-in test runner plus the acceptance scenarios in
`quickstart.md`

**Target Platform**: Modern desktop and mobile browsers; in-app fallback is
required where system notifications are unavailable

**Project Type**: Web application

**Performance Goals**: Show the first actionable request within 2 seconds of
starting a session; reflect a status change in the current view within 1 second

**Constraints**: Notification permission is optional; background browser timers
are not authoritative; missed requests must be recovered on next open; keyboard
and assistive-technology access is required; no matching, sale, adoption
application, or actual animal-care claim is in scope

**Scale/Scope**: Single-user MVP with one active local session and a short,
configurable simulation period

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Minimal Delivery: PASS. The design reuses the existing browser/Node baseline,
  native APIs, and local storage; it adds no account, database, payment,
  matching, or adoption workflow.
- Explicit Simulation Contracts: PASS. Simulation events, state transitions,
  idempotent completion, and safe persistence failures are defined in the UI
  contract.
- Safe and Accessible by Default: PASS. Notification permission is optional,
  only minimum session data is stored, in-app recovery is mandatory, and the
  primary flow includes labels, keyboard access, focus, status, and error states.
- Runnable Validation: PASS. Domain transitions, duplicate completion, missed
  notification recovery, persistence failure, and the three primary journeys are
  covered by built-in tests and quickstart checks.
- Product Scope: PASS. The constitution now defines the dog-care readiness
  simulation as the product scope; matching, sale, adoption applications, and
  automatic long-term outcome tracking remain excluded.

## Project Structure

### Documentation (this feature)

```text
specs/001-puppy-care-simulation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── simulation-interface.md
└── tasks.md                 # Phase 2 output from /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── index.html
├── app.js
├── styles.css
└── data/
    └── care-scenarios.json

server/
└── index.js

tests/
└── simulation.test.js
```

The browser owns the active session view and local persistence. The server only
serves the application assets in the MVP; no user session or care history is
sent to it. The scenario data file defines the allowed care types and default
request rules without embedding user-specific information.

**Structure Decision**: Keep one browser application, one small scenario data
file, one static server, and one built-in test file. Avoid a service layer,
database, authentication, or notification provider until the MVP demonstrates
that local simulation and recovery are insufficient.

## Post-Design Constitution Check

- Minimal Delivery: PASS for the selected structure and dependencies.
- Explicit Simulation Contracts: PASS; state transitions, validation,
  idempotency, and persistence error behavior are specified in the contract.
- Safe and Accessible by Default: PASS; notification denial, missed events,
  keyboard operation, status announcements, and privacy boundaries are covered.
- Runnable Validation: PASS; each non-trivial behavior has a test or quickstart
  scenario.
- Product Scope: PASS; the amended constitution defines the simulation scope and
  preserves the explicit non-goals.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| System notification fallback | Users may deny permission or browsers may not support notifications | Relying only on system notifications would lose requests and violate recovery requirements |
