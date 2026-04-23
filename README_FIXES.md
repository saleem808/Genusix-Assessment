# Assessment Fixes Report

This document explains the key issues found in the project and how each one was resolved.

## Goal

Align frontend behavior with backend API contracts and fix broken user flows for filtering, pagination, updates, and error handling.

## Issues Found and How They Were Solved

### 0) Logging middleware compatibility issue (server startup/runtime stability)

- **Issue:** `winston-middleware` is built around older Winston APIs and is not compatible with the Winston 3.x format pipeline used in this project.
- **Impact:** Logger integration could crash or behave incorrectly at runtime when using modern format combinators.
- **Fix:** In `server/src/index.js`, used `express-winston` with Winston 3-compatible configuration and documented the reason in code comments.

### 1) Task update endpoint mismatch

- **Issue:** Frontend called `PATCH /task/:id` (singular), but backend exposes `PATCH /tasks/:id` (plural).
- **Impact:** Status updates failed even when payload was valid.
- **Fix:** Updated API call in `client/api/tasks.js` to use `/tasks/${id}`.

### 2) Frontend query state did not match backend query contract

- **Issue:** Frontend only sent a subset of supported query params (`status`, `search`, `page`, `limit`).
- **Impact:** Priority/assignee/sort behavior was not integrated end-to-end.
- **Fix:** Extended `fetchTasks()` in `client/api/tasks.js` to include:
  - `priority`
  - `assignee`
  - `sortBy`
  - `sortOrder`
  - `includeAudit`
  - trimmed `search`

### 3) Page was not reset when filters/search/sorting changed

- **Issue:** Filter updates kept the previous page number.
- **Impact:** Users could land on empty pages or see confusing pagination after changing filters.
- **Fix:** In `client/store/tasksSlice.js`, reset `page = 1` in:
  - `setStatusFilter`
  - `setPriorityFilter`
  - `setAssigneeFilter`
  - `setSorting`
  - `setSearchFilter`

### 4) Missing filter/sort controls in state and UI wiring

- **Issue:** Redux filters and toolbar were incomplete for backend-supported query features.
- **Impact:** Users could not fully use backend filtering/sorting capabilities.
- **Fix:**
  - Added filter state fields in `client/store/tasksSlice.js`:
    - `priority`, `assignee`, `sortBy`, `sortOrder`
  - Added reducers:
    - `setPriorityFilter`, `setAssigneeFilter`, `setSorting`
  - Wired controls and dispatches in `client/components/App.jsx` and `client/components/Toolbar.jsx`.

### 5) Data reload dependencies were incomplete

- **Issue:** Dashboard reload effect did not depend on all filter/sort dimensions.
- **Impact:** Some user selections did not trigger a refetch.
- **Fix:** Updated `useEffect` dependencies in `client/components/App.jsx` to include all query fields:
  - `status`, `priority`, `assignee`, `sortBy`, `sortOrder`, `search`, `page`, `limit`

### 6) Backend validation details were not surfaced clearly

- **Issue:** Frontend mostly read `body.message`, while backend returns errors as:
  - `error.message`
  - `error.details[]`
- **Impact:** Users saw less actionable error feedback.
- **Fix:** Added `normalizeApiError()` in `client/api/tasks.js` to read backend error shape and include validation detail messages when present.

### 7) Stats response shape mismatch in UI

- **Issue:** UI expected top-level stats fields, but backend returns summary under `stats.totals`.
- **Impact:** Stats cards displayed wrong/empty values.
- **Fix:** Updated `client/components/StatsGrid.jsx` to read values from `stats?.totals`.

### 8) Optimistic update failure handling clarity

- **Issue:** Optimistic update existed, but failure behavior needed clear rollback explanation and error surfacing.
- **Impact:** Potential confusion when server rejected updates.
- **Fix:** Kept optimistic update in `client/components/App.jsx` and ensured:
  - errors are cleared before mutation
  - rollback to previous items on rejection
  - server error message is shown in `updateError`

## Files Updated

- `client/api/tasks.js`
- `client/store/tasksSlice.js`
- `client/components/App.jsx`
- `client/components/Toolbar.jsx`
- `client/components/StatsGrid.jsx`


