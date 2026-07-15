# UI Contract: 하이브리드 견종 매칭 대시보드

This feature exposes no network API. This contract defines its user-visible browser interface.

## Direct Controls

- Each range group has a Korean legend, an `상관없음` toggle, labeled minimum and maximum
  native range inputs, and visible current values.
- Turning `상관없음` on disables both range inputs and sets the filter to `null`.
- Moving one endpoint cannot leave minimum greater than maximum.
- Housing, experience, and children use labeled native selects with `상관없음` first.
- Each range identifies whether it is a hard constraint or soft preference.
- Priority offers `없음` plus active soft range attributes only. If its range becomes
  `상관없음`, priority resets to `없음`.

## Guided Questionnaire

- The guide is initially collapsed and each characteristic uses its own keyboard-operable disclosure.
- Collapsing or reopening preserves answers and filters.
- Every filter attribute has two question signals; housing and barking share their two signals.
- A partial answer group changes no direct control.
- Completing a group atomically updates its visible direct control or controls.
- A direct edit after mapping wins immediately. A later related survey edit remaps that
  attribute. Survey answers are never fabricated from direct edits.

## Live Candidate Status

- The visible text is `절대 조건 통과 후보: N마리`.
- It reflects hard-filter survivors before soft ranking and starts at 40.
- It updates synchronously after every effective filter change without moving focus.
- One polite atomic status region exposes the change to assistive technology.
- On wide screens the summary/action area may be sticky at the lower right. On narrow screens
  it returns to normal document order and never obscures a required control.

## Submission and Results

| State | Required output and focus behavior |
|---|---|
| No active condition | Korean validation; focus the first direct control; no cards |
| Zero candidates | Empty-state guidance naming conditions to relax; no placeholder cards |
| One or two candidates | Render only existing candidates |
| Three or more candidates | Render stable Top 3 |
| Hard-only input | Show `선택 조건 충족`, never a percentage |
| Active soft range input | Show clamped integer percentage |

Valid results use an ordered list of articles. Every card includes textual rank, breed name,
match label, main reason, caution, and the individual temperament/health notice. After valid
submission, focus the results heading. Any later filter change clears stale result cards.

## Reset

Reset restores every range and select to `상관없음`, priority to `없음`, clears answers,
validation and results, closes the guide, and restores candidate count 40.

## Accessibility and Copy

- Every input has a programmatic Korean name and visible value or selection.
- Survey radio groups use fieldset/legend semantics.
- All controls work in document order with keyboard alone and retain visible focus.
- Candidate updates use polite status semantics; validation uses alert semantics only when
  user action requires correction.
- Result focus moves only after submission, never after ordinary filter changes.
- Text and focus indicators meet WCAG 2.2 AA contrast expectations.
- Product copy calls the output deterministic condition matching, not AI prediction, adoption
  approval, or breed ranking by worth.

## Responsive Contract

- Wide layout may use two columns for controls and summary.
- At 560 px and below, all content follows one-column DOM order.
- No required label, value, control, status, reason, or caution is hidden at any width.
