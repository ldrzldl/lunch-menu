# Data Model: 점심 추천 서비스

## Lunch Menu

Represents either a verified restaurant menu item or a general menu idea.

| Field | Required | Rules |
|---|---|---|
| `id` | Yes | Unique within the source and result set |
| `name` | Yes | User-visible menu name |
| `kind` | Yes | `restaurant` or `idea` |
| `category` | Yes | Food type used by filtering |
| `price` | Restaurant only | Non-negative amount when supplied; current when shown |
| `location` | Restaurant only | Searchable location when supplied |
| `distance` | Restaurant only | Non-negative distance from requested location |
| `isAvailable` | Restaurant only | Must be true for recommendation |
| `dietTags` | Yes | Tags used for dietary filtering |
| `reason` | Yes | Short explanation tied to selected conditions |
| `verifiedAt` | Restaurant only | Must be current according to the provider contract |

## Recommendation Criteria

Represents the user's request for one recommendation run.

| Field | Required | Rules |
|---|---|---|
| `mode` | Yes | `restaurant` or `idea` |
| `category` | No | Matches the menu category when supplied |
| `maxPrice` | No | Non-negative; restaurant results must not exceed it |
| `maxDistance` | Restaurant only | Non-negative distance |
| `dietTags` | No | Every required tag must be satisfied |
| `location` | Restaurant only | Browser coordinates or manually entered area |
| `excludedIds` | No | Prior result IDs excluded on refresh |

## Recommendation Result

An ordered list returned for one criteria set.

- Every item has the requested `mode`.
- Every required criterion is satisfied.
- Restaurant items are available and verified.
- A refresh excludes items already shown in the current session when alternatives
  exist.
- An empty result includes a reason and a next action.

## State Transitions

`criteria editing` → `requesting` → `results shown`

`requesting` may transition to `error` or `empty`; both states offer retry or a
clear next action. `results shown` may transition back to `requesting` when the
user refreshes or changes criteria.
