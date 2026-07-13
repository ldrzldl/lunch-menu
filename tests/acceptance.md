# Acceptance Checks

- [x] Mode selection is required and clearly labeled.
- [x] General ideas return a name and reason without provider configuration.
- [x] Restaurant mode requests location and supports manual area fallback.
- [x] Results render safely as text and show loading, empty, and error states.
- [x] Keyboard users can select a mode, fill filters, submit, clear, and retry.
- [x] Filtered results are validated by `tests/recommendation.test.js`.

Run `npm test` for the automated checks and `npm start` to exercise the browser
flow at `http://localhost:3000`.

## Latest Validation

- `npm test`: 4 passed, 0 failed.
- `GET /`: 200.
- Idea recommendation with category and budget filters: returned matching items.
- Invalid recommendation mode: 400 with a safe user-facing error.
- Restaurant mode: requires `RESTAURANT_PROVIDER_URL`; credentials use
  `RESTAURANT_PROVIDER_API_KEY` and are never sent to browser code.
