# Recommendation Interface Contract

This is the boundary between the user-facing application and recommendation
data. It is intentionally provider-neutral.

## Request

```json
{
  "mode": "restaurant | idea",
  "category": "optional string",
  "maxPrice": "optional non-negative number",
  "maxDistance": "optional non-negative number",
  "dietTags": ["optional strings"],
  "location": {
    "latitude": "required for restaurant mode unless area is supplied",
    "longitude": "required for restaurant mode unless area is supplied",
    "area": "optional string"
  },
  "excludedIds": ["optional strings"]
}
```

The request MUST reject unknown modes, negative numeric values, malformed
coordinates, and restaurant requests without either coordinates or an area.
Location data MUST be sent only for restaurant mode and MUST NOT be persisted by
the MVP.

## Successful Response

```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "kind": "restaurant | idea",
      "category": "string",
      "price": "optional non-negative number",
      "location": "optional string",
      "distance": "optional non-negative number",
      "isAvailable": "true for restaurant items",
      "dietTags": ["strings"],
      "reason": "string",
      "verifiedAt": "required for restaurant items"
    }
  ],
  "checkedAt": "ISO timestamp"
}
```

Restaurant items MUST have `isAvailable: true` and a verification timestamp
accepted as current by the service. Items that fail those checks MUST be
discarded before display.

## Empty and Error Responses

```json
{ "code": "NO_MATCHES", "message": "string", "nextAction": "string" }
```

```json
{ "code": "TEMPORARY_FAILURE", "message": "string", "retryable": true }
```

Messages are user-safe and MUST NOT expose provider credentials or internal
failure details.
