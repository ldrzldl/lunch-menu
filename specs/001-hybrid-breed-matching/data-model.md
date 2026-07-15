# Data Model: 하이브리드 견종 매칭 대시보드

## Breed

One static record per displayed breed.

| Field | Type | Validation |
|---|---|---|
| `id` | ASCII string | Required, unique, stable, not derived from array position |
| `name` | Korean string | Required, non-empty |
| `exercise` | integer | 1..5 |
| `shedding` | integer | 1..5; independent from grooming |
| `grooming` | integer | 1..5; time/cost burden |
| `vocal` | integer | 1..5 |
| `size` | integer or `null` | 1..5; only mixed/unknown size may be `null` |
| `minHome` | integer | 1 compact/community, 2 apartment, 3 detached/yard |
| `noviceFriendly` | boolean | Explicitly reviewed; not inferred from train score |
| `childFriendly` | boolean | Explicitly reviewed; not inferred from social score |
| `tags` | string array | At least one Korean tag |
| `description` | Korean string | Qualified description including material cautions |

Migration from the current data is one-way: `S` → 1, `S/M` → 2, `M` → 2, `M/L` → 3,
`L` → 4, giant breeds → 5, and `S~L` → `null`. Preserve exercise, grooming, vocal, tags, and description.
Remove the unused legacy fields after the old scorer is removed.

## FilterConfig

The only input consumed by hard filtering and ranking.

```text
ranges:
  exercise: null | { min: 1..5, max: 1..5 }
  shedding: null | { min: 1..5, max: 1..5 }
  grooming: null | { min: 1..5, max: 1..5 }
  vocal: null | { min: 1..5, max: 1..5 }
  size: null | { min: 1..5, max: 1..5 }
housing: null | 1 | 2 | 3
experience: null | novice | experienced
children: null | true | false
priority: null | exercise | shedding | grooming
```

Validation rules:

- `null` alone means `상관없음`; size and vocal ranges are hard constraints, while exercise,
  shedding, and grooming ranges are scored preferences.
- Every active range satisfies `min <= max`; equal endpoints are valid.
- Priority is `null` or names an active range. Making that range `null` resets priority.
- Housing labels are 원룸·다세대 공동주택 (1), 아파트 (2), 마당 있는 단독주택 (3).
- At least one non-null range or category is required before results can be requested.

## SurveyQuestion and SurveyAnswer

Questions are static definitions. Answers remain in memory for the current page session.

| Field | Type | Validation |
|---|---|---|
| `id` | ASCII string | Unique and stable |
| `targets` | attribute key array | One or more mapped filter attributes |
| `prompt` | Korean string | Required |
| `options` | option array | At least two explicit values |
| `weight` | integer | Range mappings for one target total 100 |
| answer value | integer/boolean | Must be one of the question's option values |

Question inventory:

| Target | Question 1 | Question 2 | Weights |
|---|---|---|---|
| Activity | Daily walking time | Holiday activity style | 60/40 |
| Shedding | Sensitivity to loose hair | Cleaning/hair tolerance | 60/40 |
| Grooming | Available home-care time | Professional grooming budget | 60/40 |
| Housing + barking | Current home type | Soundproofing/neighbour sensitivity | 60/40 |
| Size | Available living space | Preferred lifting/handling size | 60/40 |
| Experience | Previous dog ownership | Training confidence | Decision table |
| Children | Child co-residence | Frequent child contact at home | Decision table |

Range answer options use ordered values 1, 2, and 3. Higher values mean higher capacity or
tolerance. Activity high maps to 3~5 and size high maps to 3~5. High shedding, grooming, or
barking tolerance maps to `null`, not a high-burden preference.

## MappingRule

| Target | Complete-answer mapping |
|---|---|
| Activity | Weighted points `<170` → 1~2; `<240` → 2~4; otherwise 3~5 |
| Shedding | `<170` → 1~2; `<240` → 1~3; otherwise `null` |
| Grooming | `<170` → 1~2; `<240` → 1~3; otherwise `null` |
| Size | `<170` → 1~2; `<240` → 2~3; otherwise 3~5 |
| Housing | Either answer=1 → tier 1; otherwise current-home answer tier |
| Barking | Either answer=1 → 1~2; otherwise soundproof=2 → 1~3; soundproof=3 → `null` |
| Experience | Either answer is restrictive/no → novice; otherwise experienced |
| Children | Either answer is yes → true; otherwise false |

Weighted points are `sum(answerValue × integerWeight)`. A shared housing/noise answer updates
both completed dependent mappings atomically. Partial answer groups do not change filters.

## RecommendationResult

| Field | Type | Rule |
|---|---|---|
| `breed` | Breed reference | Must survive every active hard filter |
| `penalty` | non-negative number | Sum of weighted active-range distances |
| `matchPercent` | integer or `null` | 0..100; `null` when no soft range is active |
| `matchLabel` | string | Percent text or `선택 조건 충족` |
| `reason` | Korean string | Closest active range or first passed category |
| `caution` | Korean string | Furthest active range plus breed description context |
| `rank` | integer | 1..3 |

Scoring rules:

1. Hard-filter active size and vocal ranges inclusively; missing active metadata fails.
2. Housing passes when `breed.minHome <= selectedHousing`.
3. Novice requires `noviceFriendly`; children=true requires `childFriendly`.
4. For each active exercise, shedding, or grooming range, distance is `abs(value - (min + max) / 2)`.
5. Multiply only the priority distance by 2, then sum.
6. Sort by penalty, then ASCII `id`; return at most three.
7. Maximum penalty uses the farthest scale endpoint for every active midpoint and the same
   priority weight. Percentage is `round(100 × (1 - penalty / maximumPenalty))`, clamped 0..100.
8. With no active soft ranges, omit percentage, sort by ID, and use `선택 조건 충족`.

Reason/caution distance ties use fixed order: activity, shedding, grooming.

## UIState

```text
filters: FilterConfig
answers: map<QuestionId, value>
results: RecommendationResult[]
validation: null | Korean message
guideOpen: boolean
```

Candidate count and whether any condition is active are derived, not stored.

State transitions:

| Event | Transition |
|---|---|
| Initial load | All filters null, no answers/results, guide closed, count 40 |
| Direct change | Write filter, clear stale results, recompute count |
| Partial survey change | Save answer only |
| Completed survey mapping | Atomically write affected filters, clear results, recompute count |
| Submit | Validate active condition, then produce empty state or up to three results |
| Any filter change after submit | Clear stale results while preserving controls/answers |
| Reset | Restore the initial state exactly |

## Dataset Invariants

- Exactly 40 unique breed IDs.
- All required scalar metadata is finite and within scale; only mixed size may be `null`.
- Every mapping target has at least two question signals and exhaustive complete-answer output.
- Results contain no duplicate breed and never exceed three records.
- Same dataset and filter state always serialize to the same ordered result.
