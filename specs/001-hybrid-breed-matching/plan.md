# Implementation Plan: 하이브리드 견종 매칭 대시보드

**Branch**: `main` | **Feature Key**: `001-hybrid-breed-matching` | **Date**: 2026-07-15 |
**Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-hybrid-breed-matching/spec.md`

## Summary

기존 13문항 우선 흐름을 직접 제어 대시보드와 접이식 설문 가이드로 교체한다.
상위 가이드 안에서는 7개 특성을 각각 독립적으로 펼쳐 필요한 설문만 답할 수 있게 한다.
브라우저 내 단일 상태를 사용하고, DOM과 무관한 매핑·필터·랭킹 로직만
`src/matching.js`로 분리한다. 40개 견종을 크기·짖음·주거·초보·아동 조건으로
하드 필터링한 뒤 활동량·털 빠짐·미용 선호의 중앙값 거리 페널티로 Top 3을 정렬한다.
새 런타임 의존성이나 서버는 추가하지 않는다.

## Technical Context

**Language/Version**: Browser JavaScript ES modules; Node.js 20+

**Primary Dependencies**: None; browser and Node.js standard APIs only

**Storage**: Static JavaScript dataset and in-memory session state; no persistence

**Testing**: Node.js built-in `node:test` and `node:assert/strict`; manual UI quickstart

**Target Platform**: Modern evergreen browsers; Vercel static deployment

**Project Type**: Single static web application

**Performance Goals**: Candidate count updates within 200 ms for at least 95% of changes;
deterministic results across 100 identical runs

**Constraints**: Korean-first UI; keyboard and small-screen support; no backend, analytics,
remote storage, new dependency, or runtime recommendation service

**Scale/Scope**: 40 breed records, 5 range controls (2 hard, 3 soft), 3 categorical controls, 14 guided
questions in 7 independently expandable characteristic groups with shared housing/noise
inputs, Top 3 results

## Constitution Check

*GATE: Passed before Phase 0 research and re-checked after Phase 1 design.*

| Principle | Pre-research | Post-design evidence |
|---|---|---|
| Responsible Guidance | PASS | Results retain reasons, cautions, and individual-variation notice; copy describes deterministic matching rather than AI prediction. |
| Explainable Determinism | PASS | Mapping tables, hard filters, penalties, percentage normalization, and ASCII-ID tie order are explicit and covered by one regression file. |
| Accessible Experience | PASS | Native controls, disclosure, Korean labels, focus rules, polite status updates, and narrow-screen flow are defined in the UI contract. |
| Private, Static Simplicity | PASS | All state remains in memory; one pure module and no dependency, server, storage, or analytics are added. |
| Proportionate Verification | PASS | `npm test`, `npm run build`, and the focused quickstart journey are required. |

## Project Structure

### Documentation (this feature)

```text
specs/001-hybrid-breed-matching/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md                 # Created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── index.html               # Dashboard, disclosure, status, and results structure
├── styles.css               # Responsive dashboard and accessible states
├── app.js                   # In-memory state, rendering, and DOM event handling
├── matching.js              # Pure mapping, filtering, ranking, and reset defaults
└── data/
    └── breeds.js            # 40 normalized breed records

test/
└── matching.test.js         # One deterministic Node regression suite
```

**Structure Decision**: Preserve the current single static application. Extract only the
logic that must run without a DOM for deterministic tests; keep rendering and events in the
existing `app.js` and keep breed metadata in the existing data file.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
