# Data Fetching Standards

## Server Components Only

**ALL data fetching MUST be done in Server Components.** This is non-negotiable.

- **DO NOT** fetch data in Client Components.
- **DO NOT** fetch data via Route Handlers.
- **DO NOT** use `useEffect`, `fetch` on the client, or any client-side data fetching libraries (e.g., SWR, React Query).
- **DO** fetch data directly in Server Components using `async` functions and pass the results as props to Client Components when needed.

## Database Queries

All database queries **MUST** go through helper functions located in the `src/data/` directory.

- Every query function lives in `src/data/`.
- Use **Drizzle ORM** for all queries. **DO NOT write raw SQL.**
- Keep query logic out of components — components call helpers from `src/data/`, never construct queries themselves.

## User Data Isolation

**A logged-in user MUST only be able to access their own data.** This is critical.

- Every query helper in `src/data/` **MUST** filter by the authenticated user's ID.
- Never expose an endpoint or query that returns another user's data.
- Always obtain the current user's ID from the auth session within the helper function or require it as a parameter validated against the session.
- Never trust a user-supplied ID without verifying it matches the authenticated session.
