import { db } from "@/db";
import { workouts, exercises, workoutExercises, sets } from "@/db/schema";
import { eq, and, gte, lt, ilike, max } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";
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
