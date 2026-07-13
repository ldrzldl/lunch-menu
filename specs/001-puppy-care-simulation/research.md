# Research: 강아지 양육 시뮬레이션

## Decision 1: Use in-app timing as the source of truth and system notifications as a best-effort channel

**Decision**: Persist each request's due time and evaluate overdue requests when
the app is open or becomes visible. Request system-notification permission only
after an explicit user action. Use a system notification when supported and
permitted; always render the same request in the in-app request list.

**Rationale**: Browser notifications require user permission, and background tab
timers are throttled or otherwise not reliable enough to define whether a care
request exists. A persisted due time makes missed notifications recoverable and
keeps the simulation behavior deterministic.

**Alternatives considered**:

- Web Push with a server scheduler: deferred because it adds push subscriptions,
  credentials, delivery infrastructure, and privacy scope before the MVP proves
  the simulation value.
- Foreground `setTimeout` only: rejected because closing or backgrounding the
  page can lose the event; persisted due times provide a smaller reliable guard.

References: [MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API),
[MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API.)

## Decision 2: Use deterministic seeded scenarios with bounded irregularity

**Decision**: Generate request times from a session seed and a bounded scenario
definition. Store the generated request IDs and due times in the session so a
reload cannot create a different history. Keep the interval range and care mix
visible in product configuration and validation fixtures.

**Rationale**: Pure randomness makes tests flaky and can create an unfair or
unfinishable experience. A seed preserves unpredictability for the user while
making replay, support, and acceptance checks reproducible.

**Alternatives considered**:

- Fixed daily schedule: rejected because it teaches users to expect a schedule
  rather than experience irregular responsibility.
- Unseeded random generation: rejected because results cannot be reproduced or
  reliably tested.

## Decision 3: Report patterns, not an adoption-readiness score

**Decision**: The result view reports completion, delay, missed requests, time,
and self-reflection answers. It MUST NOT label a user as suitable or unsuitable
for adoption.

**Rationale**: A short simulation cannot establish whether a person can care for
an individual animal. Pattern reporting supports informed reflection without
turning a limited exercise into a misleading decision or shame mechanism.

**Alternatives considered**:

- Single readiness score: rejected because it implies precision the simulation
  cannot support and could encourage users to treat the score as approval.
- No result summary: rejected because users need a concrete reflection point to
  connect the experience to real-life preparation.

## Decision 4: Keep long-term adoption outcomes outside the MVP data model

**Decision**: Define the six-month abandonment comparison as an evaluation plan,
not as automatic tracking. If later research collects follow-up outcomes, it must
be opt-in, purpose-limited, and designed with a pre-defined comparison cohort.

**Rationale**: Linking service use to adoption and abandonment creates sensitive
behavioral data and requires consent, retention, cohort definition, and bias
controls. None is necessary to ship the core simulation.

**Alternatives considered**:

- Automatically collect adoption and abandonment outcomes: rejected because it
  expands privacy and research obligations beyond the requested MVP.
- Omit the long-term metric: rejected because it is an important product outcome;
  it is retained as a future evaluation requirement.
