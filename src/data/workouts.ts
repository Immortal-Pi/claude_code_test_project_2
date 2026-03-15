import { db } from "@/db";
import { workouts, exercises, workoutExercises, sets } from "@/db/schema";
import { eq, and, gte, lt, ilike, max, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { TZDate } from "@date-fns/tz";

export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: { orderBy: (s, { asc }) => [asc(s.setNumber)] },
        },
      },
    },
  });
}

export async function updateWorkout(
  workoutId: string,
  name: string,
  startedAt: Date
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db
    .update(workouts)
    .set({ name, startedAt, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

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

export async function getWorkoutsForDate(dateStr: string, timezone: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [y, m, d] = dateStr.split("-").map(Number);
  const dateInTz = new TZDate(y, m - 1, d, 0, 0, 0, timezone);

  const dayStart = startOfDay(dateInTz);
  const dayEnd = endOfDay(dateInTz);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, dayStart),
      lt(workouts.startedAt, dayEnd)
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
}

export async function getWorkoutsForMonth(
  year: number,
  month: number,
  timezone: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const monthStart = startOfDay(new TZDate(year, month - 1, 1, 0, 0, 0, timezone));
  const monthEnd =
    month === 12
      ? startOfDay(new TZDate(year + 1, 0, 1, 0, 0, 0, timezone))
      : startOfDay(new TZDate(year, month, 1, 0, 0, 0, timezone));

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, monthStart),
      lt(workouts.startedAt, monthEnd)
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
}

export async function getWorkoutsForWeek(dateStr: string, timezone: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [y, m, d] = dateStr.split("-").map(Number);
  const dateInTz = new TZDate(y, m - 1, d, 0, 0, 0, timezone);

  const weekStart = startOfWeek(dateInTz, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(dateInTz, { weekStartsOn: 1 });

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay(weekStart)),
      lt(workouts.startedAt, endOfDay(weekEnd))
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
}

export async function getAllExercises() {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}

export async function getOrCreateExercise(name: string) {
  const trimmed = name.trim();

  const existing = await db.query.exercises.findFirst({
    where: ilike(exercises.name, trimmed),
  });

  if (existing) return existing;

  const [inserted] = await db
    .insert(exercises)
    .values({ name: trimmed })
    .returning();

  return inserted;
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  order: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
  if (!workout) throw new Error("Workout not found");

  const [inserted] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning();

  return inserted;
}

export async function addSetToWorkoutExercise(
  workoutExerciseId: string,
  setNumber: number,
  reps: number | null,
  weightLbs: string | null
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const we = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: { workout: true },
  });
  if (!we || we.workout.userId !== userId) throw new Error("Not found");

  const [inserted] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weightLbs })
    .returning();

  return inserted;
}

export async function removeWorkoutExercise(workoutExerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const we = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: { workout: true },
  });
  if (!we || we.workout.userId !== userId) throw new Error("Not found");

  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

export async function removeSet(setId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: { workoutExercise: { with: { workout: true } } },
  });
  if (!set || set.workoutExercise.workout.userId !== userId)
    throw new Error("Not found");

  await db.delete(sets).where(eq(sets.id, setId));
}

export async function updateSet(
  setId: string,
  reps: number | null,
  weightLbs: string | null
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: { workoutExercise: { with: { workout: true } } },
  });
  if (!set || set.workoutExercise.workout.userId !== userId)
    throw new Error("Not found");

  await db.update(sets).set({ reps, weightLbs }).where(eq(sets.id, setId));
}
