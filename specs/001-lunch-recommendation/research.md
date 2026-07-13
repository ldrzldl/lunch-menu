# Research: 점심 추천 서비스

## Decision: Native browser UI for the MVP

**Rationale**: The repository has no existing application framework or runtime.
HTML, CSS, and browser JavaScript cover the two user journeys, native form
controls, keyboard access, and browser location permission with the least code.

**Alternatives considered**: A frontend framework and component library were
rejected because they add dependencies before the project has repeated UI
patterns or scale requirements.

## Decision: No accounts or persistence

**Rationale**: The specification explicitly excludes user accounts and the
feature only needs per-request filters. Keeping state in the current page avoids
a database, consent flow, and retention policy for the MVP.

**Alternatives considered**: Saved preferences and recommendation history were
deferred because they are not required to choose lunch.

## Decision: Separate recommendation modes

**Rationale**: The user chooses either verified nearby restaurant menus or
general menu ideas before requesting results. This prevents mixing data with
different freshness and location semantics.

**Alternatives considered**: A single ranked list was rejected because it would
make actual availability and general inspiration look equivalent.

## Decision: Verified restaurant data at the boundary

**Rationale**: Restaurant prices, availability, and locations can change.
Restaurant results are accepted only when the provider response marks those
fields as current at request time. Provider-specific credentials and response
formats stay outside the browser contract.

**Alternatives considered**: A static restaurant list was rejected because it
cannot satisfy the requirement that 100% of restaurant results be currently
verified. Provider selection is an implementation dependency, not a user-facing
choice; it must be selected before restaurant mode ships.

## Decision: Location permission with manual fallback

**Rationale**: Browser location can reduce input for nearby results, while manual
address or neighborhood entry preserves functionality when permission is denied.
Location is requested only after the user selects restaurant mode.

**Alternatives considered**: Requiring location was rejected for privacy and
accessibility reasons; omitting location would make distance filtering unusable.
