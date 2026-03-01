# Data Mutation Standards

## Server Actions Only

**ALL data mutations MUST be done via Server Actions.** This is non-negotiable.

- **DO NOT** mutate data via Route Handlers (`route.ts`).
- **DO NOT** mutate data directly inside Server Components.
- **DO NOT** call database mutation functions from anywhere other than a Server Action.

## Server Action Files

Server Actions **MUST** live in colocated files named `actions.ts` within the relevant route directory.

```
src/app/dashboard/actions.ts       ← Server Actions for the dashboard route
src/app/dashboard/[date]/actions.ts ← Server Actions for the date route
```

Every `actions.ts` file **MUST** start with the `"use server"` directive:

```ts
"use server";
```

## Typed Parameters

All Server Action parameters **MUST** be explicitly typed.

- **DO NOT** use `FormData` as a parameter type. Parse and type your inputs instead.

```ts
// GOOD
export async function createWorkout(name: string, startedAt: Date) { ... }

// BAD — DO NOT do this
export async function createWorkout(formData: FormData) { ... }
```

## Zod Validation

**ALL Server Actions MUST validate their arguments using Zod.**

- Define a Zod schema for the action's input.
- Parse the arguments at the top of every Server Action before any other logic.
- Let Zod throw on invalid input — do not silently ignore validation failures.

```ts
"use server";

import { z } from "zod";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function createWorkout(params: { name: string; startedAt: Date }) {
  const { name, startedAt } = createWorkoutSchema.parse(params);

  // ... proceed with mutation
}
```

## Redirects After Mutations

**DO NOT call `redirect()` inside a Server Action.** Redirects after a mutation must be handled client-side.

- After calling a Server Action, the client component handles navigation using `useRouter()`.
- Server Actions should return data or throw errors — they do not control navigation.

```ts
// GOOD — redirect handled in the client component
"use client";

import { useRouter } from "next/navigation";
import { createWorkout } from "./actions";

function MyForm() {
  const router = useRouter();

  async function handleSubmit() {
    await createWorkout({ name, startedAt });
    router.push("/dashboard");
  }
}
```

```ts
// BAD — DO NOT do this in a Server Action
"use server";

import { redirect } from "next/navigation";

export async function createWorkout(params: { ... }) {
  await insertWorkout(...);
  redirect("/dashboard"); // ← DO NOT do this
}
```

## Database Mutations via `src/data/` Helpers

All database writes **MUST** go through helper functions in the `src/data/` directory, just like reads.

- Server Actions call helpers from `src/data/` — they **DO NOT** import `db` or construct queries themselves.
- Use **Drizzle ORM** for all mutations (`insert`, `update`, `delete`). **DO NOT write raw SQL.**
- Every mutation helper **MUST** enforce user data isolation by filtering on the authenticated user's `userId`. See `docs/data-fetching.md` and `docs/auth.md` for details.

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function insertWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db.insert(workouts).values({
    userId,
    name,
    startedAt,
  });
}
```

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { insertWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function createWorkout(params: { name: string; startedAt: Date }) {
  const { name, startedAt } = createWorkoutSchema.parse(params);
  await insertWorkout(name, startedAt);
}
```
