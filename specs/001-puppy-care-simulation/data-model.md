# Data Model: 강아지 양육 시뮬레이션

## Simulation Session

Represents one local simulation run.

| Field | Type | Rules |
|---|---|---|
| `id` | opaque string | Required; unique within the local store |
| `status` | enum | `active`, `paused`, `completed`, or `abandoned` |
| `seed` | opaque string | Required; fixed after session creation |
| `startedAt` | timestamp | Required; immutable |
| `pausedAt` | timestamp | Present only while paused |
| `endedAt` | timestamp | Present only for completed or abandoned sessions |
| `scenarioVersion` | string | Required; identifies the care rules used |
| `requestIds` | list of IDs | Required; references generated care requests |

### State transitions

```text
new → active ↔ paused
active → completed
active → abandoned
paused → abandoned
```

Only `active` sessions generate due requests. Resume returns a paused session to
`active` without regenerating requests. Completed or abandoned sessions are
read-only.

## Care Request

Represents one requested care action.

| Field | Type | Rules |
|---|---|---|
| `id` | opaque string | Required; unique within a session |
| `sessionId` | opaque string | Required; references one session |
| `type` | enum | `walk`, `feed`, `water`, `waste`, or `check` |
| `dueAt` | timestamp | Required; generated from the session seed |
| `deadlineAt` | timestamp | Required; later than `dueAt` |
| `status` | enum | `pending`, `deferred`, `completed`, or `missed` |
| `statusChangedAt` | timestamp | Required after the first status change |
| `completedAt` | timestamp | Present only when completed |
| `estimatedMinutes` | positive integer | Required; scenario-defined estimate |
| `notificationState` | enum | `not-sent`, `sent`, `denied`, or `missed` |

### State transitions

```text
pending → deferred
pending → completed
pending → missed (after deadline)
deferred → completed
deferred → missed (after deadline)
```

Completed and missed requests are terminal. A completion operation is idempotent:
repeating it leaves one completed record and does not increase counts twice.

## Care Record

The status history for a request. It is append-only within the local session.

| Field | Type | Rules |
|---|---|---|
| `id` | opaque string | Required |
| `requestId` | opaque string | Required; references one care request |
| `fromStatus` | enum | Previous request status |
| `toStatus` | enum | Valid next status |
| `changedAt` | timestamp | Required; non-decreasing within a request |
| `elapsedMinutes` | non-negative number | Derived from `dueAt` and `changedAt` |

## Readiness Reflection

The end-of-session summary and optional user responses.

| Field | Type | Rules |
|---|---|---|
| `sessionId` | opaque string | Required; one reflection per completed session |
| `completedCount` | non-negative integer | Derived from care requests |
| `deferredCount` | non-negative integer | Derived from care requests |
| `missedCount` | non-negative integer | Derived from care requests |
| `totalCareMinutes` | non-negative number | Sum of recorded care time |
| `difficultyTypes` | list of care types | Derived from repeated delays or misses |
| `answers` | limited text/choice values | Optional; no sensitive free-text required |
| `createdAt` | timestamp | Required |

The reflection describes observed patterns and questions. It does not contain an
adoption eligibility field or a pass/fail decision.

## Validation Rules

- All timestamps must be valid and use one consistent timezone representation.
- A request must reference an existing session and one known care type.
- A status transition not listed above must be rejected without changing data.
- A completed request must have exactly one completion transition.
- Derived counts must be recalculated from requests rather than trusted from UI
  input.
- Persistence failure must leave the prior valid state intact and return a
  retryable error.
