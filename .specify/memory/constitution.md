<!--
Sync Impact Report
- Version change: template/uninitialized -> 1.0.0
- Modified principles: none; established five initial principles
- Added sections: Additional Constraints; Development Workflow, Quality Gates
- Removed sections: none
- Templates requiring updates: .specify/templates/plan-template.md (updated); .specify/templates/spec-template.md (no change required); .specify/templates/tasks-template.md (updated)
- Follow-up TODOs: determine the original ratification date
-->

# My App Constitution

## Core Principles

### I. Simplicity and Reuse

Changes MUST solve the stated problem with the smallest clear design. Existing
helpers, platform capabilities, and installed dependencies MUST be preferred
before new abstractions or dependencies. Speculative flexibility MUST be
omitted. Any deliberate complexity MUST be documented with the simpler
alternative considered and the reason it was rejected.

### II. Explicit Contracts and Validation

Inputs crossing trust boundaries MUST be validated, and failures MUST be
handled without data loss or silent corruption. Public behavior, data formats,
and important invariants MUST be explicit in requirements, code, or tests.

### III. Testable Delivery

Every non-trivial change MUST leave a runnable validation: an automated test,
an integration check, or the smallest appropriate self-check. Features MUST
be independently verifiable against their acceptance scenarios before they
are considered complete.

### IV. Secure and Accessible by Default

Security controls MUST NOT be removed to simplify implementation. Sensitive
data MUST be handled minimally and safely. User-facing behavior MUST preserve
basic accessibility, including keyboard operation, usable labels, and
meaningful error feedback where applicable.

### V. Observable, Documented Changes

Errors and important state transitions MUST be diagnosable at the appropriate
boundary without exposing sensitive data. User-visible or externally consumed
behavior MUST be documented in the relevant specification, contract, or
quickstart. Changes MUST remain traceable to a user story or requirement.

## Additional Constraints

The project MUST prefer the existing repository structure and toolchain. New
runtime dependencies, services, persistence layers, or generated scaffolding
require a documented need and an explicit trade-off. Configuration MUST NOT
contain secrets; local development and test instructions MUST use safe example
values.

## Development Workflow and Quality Gates

Each feature MUST have a specification with prioritized user stories,
acceptance scenarios, edge cases, and measurable outcomes. The implementation
plan MUST include a Constitution Check before research and after design.
Implementation tasks MUST identify exact paths and dependencies. Before
completion, the author MUST run the smallest relevant validation, review the
security and accessibility impact, and update affected documentation.

## Governance

This constitution supersedes conflicting project practices. Amendments require
an update to this file, a Sync Impact Report, and review of all dependent
templates and guidance. Versioning follows semantic versioning: MAJOR for
backward-incompatible governance changes, MINOR for new or materially expanded
principles, and PATCH for clarifications or non-semantic corrections.

Every plan and review MUST check compliance with the principles and record any
justified exception in Complexity Tracking. Compliance is reviewed at feature
planning and before delivery. Unresolved violations block completion unless
the governing project owner explicitly accepts the documented exception.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): determine original adoption date | **Last Amended**: 2026-07-13
