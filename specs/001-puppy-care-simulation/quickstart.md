# Quickstart: 강아지 양육 시뮬레이션

## Prerequisites

- Node.js 20 or newer
- A modern desktop or mobile browser
- Notification permission available for the notification scenario; the core
  flow must also work with permission denied

## Run

From the repository root:

```bash
npm test
npm start
```

Open the local address printed by the server. The exact port is defined by the
implementation task and must be documented in the final README or acceptance
record.

## Validation scenarios

1. **Start and first request**
   - Start a new simulation.
   - Confirm the first request includes a type, due time, deadline, and action.
   - Expected: the request appears within 2 seconds and can be acknowledged.

2. **Irregular request sequence**
   - Run a complete fixture using the deterministic test seed.
   - Expected: at least three care types occur and due times are not a fixed
     repeating interval.

3. **Complete and defer**
   - Complete one request and defer another.
   - Reload the page.
   - Expected: completion remains complete exactly once; deferred request remains
     actionable.

4. **Missed request recovery**
   - Advance the fixture clock beyond a request deadline, or use the test clock.
   - Deny notification permission and reopen the app.
   - Expected: the request is visible as missed with its deadline and no duplicate
     notification record.

5. **Notification permission**
   - Start a session and explicitly allow notifications.
   - Expected: a due request may produce a system notification and always appears
     in the in-app request list.
   - Repeat with permission denied.
   - Expected: the in-app flow remains complete and explains the fallback.

6. **Pause and resume**
   - Pause an active session, reload, and resume it.
   - Expected: the existing schedule and request IDs remain unchanged.

7. **Duplicate action protection**
   - Activate complete on the same request twice.
   - Expected: one completion record and one increment in completion totals.

8. **Persistence failure**
   - Run the test fixture that rejects a save operation.
   - Expected: the UI shows a retryable error and does not display the action as
     completed.

9. **Reflection and scope boundary**
   - Complete a session with known completed, deferred, and missed requests.
   - Expected: the summary shows derived patterns and questions, not a readiness
     score, adoption decision, matching, or sale action.

10. **Accessibility**
    - Complete start, request action, pause/resume, and reflection using only the
      keyboard.
    - Expected: focus is visible, controls have accessible names, and status
      changes are announced or otherwise readable.

## Required implementation checks

The built-in tests must cover the state transitions and contract examples in
[data-model.md](data-model.md) and [contracts/simulation-interface.md](contracts/simulation-interface.md).
The acceptance record must include the browser and notification-permission
conditions used for scenarios 5 and 10.
