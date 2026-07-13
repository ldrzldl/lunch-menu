<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Modified principles: II. Explicit Contracts → II. Explicit Simulation Contracts; III. Safe and Accessible by Default → III. Safe, Accessible, and Privacy-Preserving by Default; IV. Runnable Validation → IV. Runnable Validation
- Added sections: Product Scope rewritten for dog-care readiness simulation
- Removed sections: previous recommendation-service and external-provider scope
- Templates requiring updates: ✅ .specify/templates/plan-template.md (reviewed, generic gates remain aligned); ✅ .specify/templates/spec-template.md (reviewed, no change required); ✅ .specify/templates/tasks-template.md (reviewed, no change required); ✅ .specify/templates/commands/*.md (none present)
- Follow-up TODOs: Ratification date is unknown and remains TODO(RATIFICATION_DATE).
-->

# Dog Care Readiness Simulation Constitution

## Core Principles

### I. Minimal Delivery

The service MUST use the smallest implementation that satisfies the approved
simulation journeys. Native browser capabilities, local anonymous data, and the
existing runtime MUST be preferred before adding frameworks, dependencies,
accounts, databases, or external services. Real pet matching, sale, adoption
applications, and animal-care claims MUST NOT be added without an explicit scope
amendment. This keeps the exercise understandable and prevents a readiness tool
from becoming an unbounded pet platform.

### II. Explicit Simulation Contracts

Every simulation action MUST define accepted input, valid state transitions,
derived outputs, persistence failure behavior, and idempotency rules. A request
MUST have one authoritative status, and repeated completion actions MUST NOT
duplicate records or inflate results. Notification delivery MUST NOT be treated
as proof that a care action occurred. Explicit contracts keep the experience
deterministic and make missed or failed events recoverable.

### III. Safe, Accessible, and Privacy-Preserving by Default

The service MUST collect only information needed for the simulation and MUST
explain its purpose and retention. The primary flow MUST support keyboard and
assistive-technology use, visible focus, labels, readable status changes,
loading states, empty states, retry guidance, and understandable failures.
Notification permission MUST be optional, and the in-app request list MUST remain
usable when notifications are denied or unavailable. The service MUST NOT expose
private session data or secrets unnecessarily.

### IV. Runnable Validation

Each non-trivial behavior MUST have a runnable validation using the existing test
runner or documented acceptance checks. Validation MUST cover request generation,
state transitions, duplicate-action protection, missed-notification recovery,
persistence failures, accessibility of the primary flow, and the three primary
user journeys. A feature is not complete until its relevant checks pass and its
quickstart or acceptance documentation is updated.

## Product Scope

The MVP helps people who have not owned a dog assess the time and repeated-care
responsibility involved before adoption. It MUST provide irregular care requests,
care actions such as walking, feeding, changing water, waste handling, and status
checks, a record of completed/deferred/missed actions, and a reflection summary.
It MUST present observed patterns rather than an adoption-readiness verdict.

The service does not include pet matching, sale, adoption applications, actual
animal monitoring, veterinary advice, or automatic tracking of adoption and
abandonment outcomes. Long-term adoption outcomes MAY be studied later only with
explicit opt-in research consent and a documented comparison design.

## Development Workflow and Quality Gates

Feature specifications MUST describe independently testable prioritized user
stories, acceptance scenarios, edge cases, measurable outcomes, and explicit
out-of-scope assumptions. Plans MUST include a Constitution Check before
research and after design, covering minimal delivery, simulation contracts,
safety/accessibility/privacy, and runnable validation. Tasks MUST identify exact
paths, dependencies, and validation work. Any intentional complexity MUST be
recorded with the simpler alternative considered and the reason it was rejected.

## Governance

This constitution governs feature specifications, plans, tasks, implementation,
and reviews for the dog-care readiness simulation. A change requires a written
amendment in this file, an updated Sync Impact Report, a semantic version bump,
and synchronized dependent templates. The amendment author MUST state the
affected principles, migration or compatibility impact, and validation needed.

Versioning follows semantic versioning: MAJOR for incompatible principle or
product-scope changes, MINOR for new principles or materially expanded mandatory
guidance, and PATCH for clarifications or non-semantic corrections.

Every feature review MUST verify the Constitution Check and relevant runnable
validation. Reviewers MUST reject misleading readiness verdicts, unnecessary
personal-data collection, exposed secrets, unjustified complexity, inaccessible
primary flows, and missing failure or recovery handling. If a requirement
conflicts with this constitution, the constitution MUST be amended explicitly
before implementation proceeds.

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-07-13
