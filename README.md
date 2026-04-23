# Advanced Full Stack - Frontend Assessment Project

This assessment is designed to test **full-stack product thinking**, not just bug fixing.

The candidate should reason about:
- request / response contracts
- frontend state and UX
- backend validation and filtering
- optimistic updates and rollback
- pagination and query handling
- loading, error, and empty states
- how UI behavior depends on backend behavior
- how middleware, validation, and observability shape API design

## Stack
- Frontend: React + Next.js + Redux Toolkit
- Backend: Express
- Data: local in-memory JSON

## Setup

From the root:

```bash
npm install
npm run install:all
```

## Run

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

Frontend:
- http://localhost:3000

Backend:
- http://localhost:4000

## Assessment Scenario

You are working on an internal operations dashboard for an engineering team.
The dashboard shows work items, supports filtering, search, pagination, sorting, stats, and task updates.

The project is deliberately incomplete. Some parts are correct, some parts are buggy, and some parts are only partially integrated.

## API surface

### `GET /tasks`
Supports:
- `status=all|todo|in_progress|done`
- `priority=all|low|medium|high`
- `assignee=all|Maya|Leo|Sarah|Chris|Ava`
- `search=<string>`
- `page=<number>`
- `limit=<number>`
- `sortBy=updatedAt|createdAt|title|priority|status`
- `sortOrder=asc|desc`
- `includeAudit=true|false`

### `PATCH /tasks/:id`
Supports partial updates for:
- `status`
- `priority`
- `assignee`
- `estimateHours`
- `note`

### `GET /tasks/stats/summary`
Returns:
- totals by status
- totals by priority
- workload metrics

### `GET /tasks/audit`
Returns recent task update audit history.

## Candidate Tasks

### Full-stack integration
1. Fix the frontend/backend task update flow
2. Make filters, search, sort, and pagination work together correctly
3. Keep frontend query state synced with backend query contracts
4. Add clear empty, loading, stale, and error states
5. Keep optimistic updates safe when server validation fails
6. Decide what should live in Redux vs local component state

### Backend reasoning
7. Validate request payloads and query params consistently
8. Keep pagination metadata accurate when filters reduce results
9. Make search trimmed and case-insensitive
10. Preserve a consistent API error shape
11. Explain how request IDs, logging, and rate limiting help in production
12. Explain why audit trails matter for admin/internal tools
13. Reason about sorting and filter composition order
14. Explain tradeoffs of in-memory state vs persistence

### Frontend reasoning
15. Fix page reset behavior when filters change
16. Prevent bad UX during update failures
17. Make pending controls reflect in-flight mutation state
18. Surface backend validation details clearly to the user
19. Handle race conditions between refetches and optimistic updates
20. Decide whether stats should be fetched separately or derived client-side

### Senior-level discussion
21. Explain how you would test this end to end
22. Explain how you would move from in-memory data to database-backed pagination
23. Explain tradeoffs of optimistic updates in this UI
24. Explain where caching would or would not help
25. Explain how you would evolve audit history once a real DB exists
26. Explain what middleware should stay in the app vs API gateway / infra layer

## Tip of seeded issues
1. frontend PATCH path may be wrong depending on candidate implementation
2. frontend query state may not include new backend filters and sorting
3. frontend may not reset page correctly when filters change
4. optimistic update flow may not surface validation failures well
5. backend now supports richer validation, but UI may not send payloads correctly
6. audit history exists on backend, but frontend does not use it yet
7. stats and table filtering are separate concerns and should be reasoned about
8. error shape should remain consistent across all API failures
