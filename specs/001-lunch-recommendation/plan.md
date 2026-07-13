# Implementation Plan: 점심 추천 서비스

**Branch**: `001-lunch-recommendation` | **Date**: 2026-07-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-lunch-recommendation/spec.md`

## Summary

Build a small web experience where a user selects either nearby restaurant
menus or general lunch ideas, optionally supplies filters, and receives one or
more results with reasons. The MVP has no accounts or persistence. General
ideas use a local curated dataset; restaurant mode consumes a server-side
verified-menu contract so provider credentials and unverified data never reach
the browser.

## Technical Context

**Language/Version**: Browser JavaScript, HTML, and CSS with Node.js 20+

**Primary Dependencies**: Native browser APIs only for the MVP; one external
restaurant-menu provider behind the documented contract

**Storage**: No user or application persistence; curated general ideas are
versioned repository data

**Testing**: Node's built-in test runner plus acceptance checks from
`quickstart.md`

**Target Platform**: Modern desktop and mobile browsers

**Project Type**: Web application

**Performance Goals**: Show general ideas within 2 seconds and show verified
restaurant results within 10 seconds for 90% of requests

**Constraints**: No secrets in browser code; restaurant results require current
verification, location is optional, keyboard access is required, and no
accounts, ordering, payment, or booking are in scope

**Scale/Scope**: Single-page MVP for individual users; small curated idea
dataset and one restaurant provider integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: PASS. Native browser features and local data avoid unnecessary
  framework, database, and account layers.
- Contracts: PASS. User inputs and restaurant-provider responses have explicit
  validation rules; unverified restaurant data is rejected.
- Delivery: PASS. Each mode and failure path has runnable quickstart checks.
- Safety: PASS. Location is optional, credentials stay server-side, and the UI
  contract includes keyboard labels and error states.

## Project Structure

### Documentation (this feature)

```text
specs/001-lunch-recommendation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── recommendation-interface.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── index.html
├── app.js
├── styles.css
└── data/
    └── lunch-ideas.json

server/
├── index.js
└── restaurant-provider.js

tests/
├── recommendation.test.js
└── acceptance.md
```

Restaurant-provider access remains a boundary described in the contract; its
server-side adapter lives in `server/restaurant-provider.js`. The concrete
runtime and provider credentials are selected before that adapter is implemented.

**Structure Decision**: Use one browser application with native assets and a
small data file, plus one server-side provider adapter. Keep provider
communication behind one contract so the MVP does not grow a general service
layer before it is needed.

## Post-Design Constitution Check

- Simplicity: PASS. The design has one browser flow, one data file, and one
  provider boundary; accounts, persistence, and framework layers remain out of
  scope.
- Contracts: PASS. Request validation, result freshness, and safe error shapes
  are defined in `contracts/recommendation-interface.md`.
- Delivery: PASS. `quickstart.md` covers both modes, filtering, refresh,
  location fallback, empty results, errors, and keyboard use.
- Safety: PASS. Location is optional and non-persistent, provider credentials
  remain server-side, and the UI must expose labels and safe failure messages.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| External restaurant-data boundary | Actual nearby menus must be current and verified | A local-only list cannot satisfy the restaurant-mode requirements |
