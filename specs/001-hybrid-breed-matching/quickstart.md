# Quickstart: 하이브리드 견종 매칭 대시보드

## Prerequisite

- Node.js 20 or newer

## Automated validation

```bash
npm test
npm run build
```

Expected:

- The single matching regression suite passes all data, mapping, filter, scoring, boundary,
  and repeat-determinism checks.
- The static source copies successfully to `dist/`.

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## End-to-end validation

1. **Initial state**
   - Confirm every control is `상관없음`, priority is `없음`, the guide is closed, no results
     are shown, and the candidate status is 40.

2. **Direct controls**
   - Set an activity range and confirm the hard-candidate count stays stable without focus movement.
   - Set a size or barking range and confirm the count updates without focus movement.
   - Add compact/community housing and novice experience; confirm the count never increases.
   - Set equal range endpoints and confirm they remain valid.
   - Try crossing endpoints and confirm the final minimum never exceeds maximum.

3. **Guided mappings**
   - Expand the guide and each characteristic disclosure with keyboard only.
   - For every range and category, answer one question and confirm its direct control does not
     change; complete the second and confirm the documented mapping appears.
   - Confirm housing/noise updates housing and barking together.
   - Confirm restrictive categorical conflicts choose community housing, novice, and
     children=yes.

4. **Last interaction wins**
   - Manually change a survey-mapped control and confirm the direct value becomes current.
   - Change a related survey answer and confirm the new completed mapping becomes current.
   - Collapse/reopen the guide and confirm answers and filters remain.

5. **Results and boundaries**
   - Submit with all controls `상관없음`; confirm Korean validation and focus correction.
   - Use only hard conditions; confirm results show `선택 조건 충족`.
   - Use soft range conditions and priority; confirm at most three ranked cards with percentages.
   - Exercise zero-, one-, and two-candidate filters; confirm no fabricated cards or ranks.
   - Repeat the same submission and confirm identical order and labels.

6. **Responsible and accessible output**
   - Confirm each card contains reason, caution, and individual-variation language.
   - Confirm no visible copy describes the matcher as AI prediction or adoption approval.
   - Complete direct control, guide, submit, result review, and reset using keyboard only.
   - Confirm visible focus, Korean names/values, polite count announcement, and focused results
     heading after submission.

7. **Responsive layout**
   - At 560 px and below, confirm one-column document order and no hidden/obscured control,
     status, result reason, or caution.

8. **Reset**
   - Confirm reset closes the guide, clears answers/results/validation, restores all `상관없음`
     values and priority `없음`, and returns the count to 40.

See [data-model.md](data-model.md) for exact mapping/scoring rules and
[contracts/ui-contract.md](contracts/ui-contract.md) for observable UI behavior.
