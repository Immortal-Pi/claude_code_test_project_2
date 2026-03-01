# Authentication Standards

## Provider

This project uses **Clerk** (`@clerk/nextjs`) for all authentication. **DO NOT** use any other auth library or custom auth solution.

## ClerkProvider

The entire app is wrapped in `<ClerkProvider>` in the root layout (`src/app/layout.tsx`). This is required for all Clerk functionality to work.

## Middleware

Clerk middleware is configured in `src/middleware.ts` using `clerkMiddleware()`. This intercepts all requests and manages auth state globally.

- **DO NOT** remove or bypass the middleware.
- **DO NOT** add manual route protection logic — the middleware handles it.

## Server-Side Auth

Use the `auth()` function from `@clerk/nextjs/server` to get the current user's ID in server-side code.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();

if (!userId) {
  throw new Error("Unauthorized");
}
```

### Rules

- **ALWAYS** call `auth()` in server-side code (Server Components, data helpers, Server Actions) to obtain the `userId`.
- **ALWAYS** check that `userId` is not `null` before proceeding. Throw an error if it is.
- **DO NOT** use `currentUser()` unless you specifically need full user profile data (name, email, etc.). Prefer `auth()` for the `userId`.
- **DO NOT** pass `userId` from the client. Always obtain it server-side via `auth()`.

## Client-Side Auth Components

Use Clerk's pre-built components for all auth UI:

- `<SignedIn>` — Render content only for authenticated users.
- `<SignedOut>` — Render content only for unauthenticated users.
- `<SignInButton>` — Opens the sign-in modal.
- `<SignUpButton>` — Opens the sign-up modal.
- `<UserButton>` — Shows the user avatar with profile/sign-out dropdown.

### Rules

- **DO NOT** build custom sign-in or sign-up forms. Use Clerk's modal-based components (`mode="modal"`).
- **DO NOT** implement custom sign-out logic. Use `<UserButton>` which provides sign-out functionality.

## User Data Isolation

Every database table that stores user-specific data **MUST** include a `userId` (`user_id`) column. Every query against such a table **MUST** filter by the authenticated user's `userId`. See `docs/data-fetching.md` for full details.
