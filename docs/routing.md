# Routing Standards

## Route Structure

All application routes live under `/dashboard`. There are no feature routes outside of this prefix.

```
/dashboard                          → Main dashboard page
/dashboard/workout/new              → Create a new workout
/dashboard/workout/[workoutId]      → View/edit a specific workout
```

**DO NOT** create routes outside of `/dashboard` for authenticated app features.

## Route Protection

All `/dashboard` routes **MUST** be protected so only authenticated users can access them.

Route protection is handled exclusively via **Next.js middleware** (`src/middleware.ts`) using Clerk's `clerkMiddleware()`. The middleware intercepts every request and enforces auth at the edge before any page renders.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Rules

- **DO NOT** add manual auth checks inside page components to guard against unauthenticated access — the middleware handles this.
- **DO NOT** redirect unauthenticated users manually inside pages. Clerk middleware redirects them automatically.
- **ALWAYS** use `createRouteMatcher(["/dashboard(.*)"])` to protect the entire dashboard subtree.
- **DO NOT** protect routes by conditionally rendering content — protection must happen at the middleware level.

## Dynamic Routes

Use Next.js dynamic segments for resource-specific pages:

- `[workoutId]` — identifies a specific workout by its ID.

The segment name must match what is destructured from `params` in the page component:

```ts
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // ...
}
```

## Navigation

Use Next.js `<Link>` for all internal navigation. **DO NOT** use `<a>` tags for internal links.

```tsx
import Link from "next/link";

<Link href="/dashboard/workout/new">Log New Workout</Link>
```

For programmatic navigation after a mutation (e.g. after form submission), use `redirect()` from `next/navigation` inside Server Actions:

```ts
import { redirect } from "next/navigation";

redirect("/dashboard");
```
