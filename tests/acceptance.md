# Acceptance Checks: 강아지 양육 시뮬레이션

## P1 schedule flow

- Start a session and confirm a care request shows a type, deadline, and status.
- Deny notification permission and confirm the in-app request list remains usable.
- Reload after a fixture deadline and confirm the request appears as missed.
- Pause and resume the session without changing its request schedule.

## Care actions

- Complete one request and defer another.
- Reload and confirm completed, deferred, and summary counts remain correct.
- Activate completion twice and confirm the count increases only once.
- Simulate a save failure and confirm the failed action is not shown as complete.

## Reflection and scope

- Complete a fixture session and confirm difficulty patterns and self-check
  questions are visible.
- Confirm the result does not show a readiness score or offer matching, sale, or
  adoption application actions.

## Accessibility

- Complete start, notification settings, care action, pause/resume, and
  reflection flows using only the keyboard.
- Confirm focus is visible, buttons have names, and status text is readable by
  assistive technology.

## Test command

Run `npm test` from the repository root. Record browser and notification
permission conditions here after the manual checks are run.

## Automated results

- 2026-07-13: `npm test` — 8 tests passed.
- 2026-07-13: `npm start` — server returned `index.html` and
  `data/care-scenarios.json` over the local smoke-test port.
- Browser-only keyboard and notification-permission checks remain manual.
