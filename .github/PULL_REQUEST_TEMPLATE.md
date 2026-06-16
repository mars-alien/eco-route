## What does this PR do?
<!-- A clear one-line summary of the change -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] DevOps / CI

## Related Issue
Closes #<!-- issue number -->

## Changes Made
<!-- List the key changes -->
-
-
-

## How to Test
<!-- Steps to verify the change works -->
1.
2.
3.

## Checklist
- [ ] Code follows the existing style (CSS vars, no hardcoded hex outside globals.css)
- [ ] `routing/algorithms/` files have zero FastAPI/Motor imports
- [ ] All MongoDB `_id` fields serialized to `str` in response schemas
- [ ] GeoJSON coordinates stored as `[lng, lat]`, returned as `{ lat, lng }`
- [ ] No `useEffect` + `useState` for data fetching — React Query only
- [ ] `DeliveryMap` receives props only, makes no API calls
- [ ] Tested locally with `python seed.py` fresh data

## Screenshots (if UI change)
<!-- Before / After screenshots -->
