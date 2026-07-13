# Quickstart Validation: 점심 추천 서비스

## Prerequisites

- A modern desktop or mobile browser.
- The project runtime and test command selected during implementation.
- A verified restaurant-data provider configuration for restaurant-mode checks.

## Validation Scenarios

1. Open the application and confirm the recommendation mode is required before
   requesting results.
2. Select `일반 메뉴 아이디어`, request without filters, and confirm at least one
   item with a name and reason appears within 2 seconds.
3. Select a food category, budget, or dietary condition and confirm every result
   satisfies the selected condition.
4. Refresh results and confirm previously shown IDs are excluded when alternatives
   exist.
5. Select `주변 식당 메뉴`, allow location, and confirm every result is available,
   current, and within the requested distance.
6. Deny location permission, enter a neighborhood manually, and confirm restaurant
   results still work.
7. Submit a restaurant request with no matching items and confirm the empty-state
   reason and next action are clear.
8. Simulate a provider failure and confirm a retry action appears without exposing
   internal details.
9. Complete mode selection, filtering, submission, and retry using only the
   keyboard; confirm every control has an understandable label.

## Automated Validation

Run the repository's configured test command after implementation. At minimum,
the checks must cover request validation, filtering, freshness rejection,
refresh exclusion, empty results, and provider failure handling.
