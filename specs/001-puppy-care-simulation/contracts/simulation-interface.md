# Simulation Interface Contract

This is the browser-facing domain contract for the MVP. The server serves static
assets only; no user care history is sent to an external service.

## Start session

Input:

```json
{
  "scenarioVersion": "default",
  "durationMinutes": 30
}
```

Rules:

- `scenarioVersion` must be supported.
- `durationMinutes` must be a positive value within the configured product
  bounds.
- The operation creates one seed, one session, and its complete request schedule.
- Repeating start must require an explicit new-session choice; it must not erase
  an active session silently.

Output:

```json
{
  "sessionId": "session-opaque-id",
  "status": "active",
  "firstDueAt": "2026-07-13T13:05:00Z",
  "requestCount": 8
}
```

## Change session state

Input:

```json
{
  "sessionId": "session-opaque-id",
  "action": "pause"
}
```

`action` is one of `pause`, `resume`, `complete`, or `abandon`. Invalid actions
for the current session state return a user-safe error and do not mutate data.

## List current requests

The view returns all requests for the active session after evaluating due and
deadline timestamps:

```json
{
  "sessionId": "session-opaque-id",
  "requests": [
    {
      "id": "request-opaque-id",
      "type": "walk",
      "dueAt": "2026-07-13T13:05:00Z",
      "deadlineAt": "2026-07-13T13:10:00Z",
      "status": "pending",
      "notificationState": "sent",
      "estimatedMinutes": 15
    }
  ]
}
```

Requests past `deadlineAt` become `missed` only once, unless already completed.
If the notification was denied or missed, the request remains visible in this
list.

## Record care action

Input:

```json
{
  "sessionId": "session-opaque-id",
  "requestId": "request-opaque-id",
  "action": "complete"
}
```

`action` is `complete`, `defer`, or `acknowledge`. `complete` is idempotent.
`defer` leaves the request actionable and does not count as completion. An
already terminal request returns its current state without a duplicate record.

On persistence failure:

```json
{
  "error": "SAVE_FAILED",
  "message": "기록을 저장하지 못했습니다. 다시 시도해 주세요.",
  "retryable": true
}
```

The UI must not show a failed action as completed.

## Notification behavior

- Request permission only from an explicit user action.
- A granted permission may produce a system notification for a due request.
- A denied or unsupported notification channel must still produce an in-app
  status update.
- On app open or visibility change, calculate all missed due requests from stored
  timestamps and show them in the request list.
- Notification delivery is not evidence that a request was completed.

## Reflection output

The completed-session view returns derived counts and patterns:

```json
{
  "sessionId": "session-opaque-id",
  "completedCount": 5,
  "deferredCount": 1,
  "missedCount": 2,
  "totalCareMinutes": 68,
  "difficultyTypes": ["waste", "walk"],
  "questions": [
    "이 돌봄 시간을 평일에도 지속할 수 있나요?",
    "가족과 역할과 비용을 합의했나요?"
  ]
}
```

The contract must not return a readiness score, adoption recommendation, or
matching result.
