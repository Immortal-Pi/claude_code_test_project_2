"use server";

import { z } from "zod";
import {
  updateWorkout,
  getOrCreateExercise,
  addExerciseToWorkout,
  addSetToWorkoutExercise,
  removeWorkoutExercise,
  removeSet,
  updateSet,
  getWorkoutById,
} from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
  startedAt: string;
}) {
  const { workoutId, name, startedAt } = updateWorkoutSchema.parse(params);
  await updateWorkout(workoutId, name, startedAt);
}

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseName: z.string().min(1),
});

export async function addExerciseAction(params: {
  workoutId: string;
  exerciseName: string;
}) {
  const { workoutId, exerciseName } = addExerciseSchema.parse(params);
  const exercise = await getOrCreateExercise(exerciseName);

  const workout = await getWorkoutById(workoutId);
  if (!workout) throw new Error("Workout not found");

  const maxOrder = workout.workoutExercises.reduce(
    (max, we) => Math.max(max, we.order),
    0
  );

  await addExerciseToWorkout(workoutId, exercise.id, maxOrder + 1);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  reps: z.number().int().positive().nullable(),
  weightLbs: z.string().nullable(),
});

export async function addSetAction(params: {
  workoutExerciseId: string;
  reps: number | null;
  weightLbs: string | null;
}) {
  const { workoutExerciseId, reps, weightLbs } = addSetSchema.parse(params);

  // Compute next set number from existing sets
  const { db } = await import("@/db");
  const { sets } = await import("@/db/schema");
  const { eq, max } = await import("drizzle-orm");

  const [result] = await db
    .select({ maxSet: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const nextSetNumber = (result?.maxSet ?? 0) + 1;

  await addSetToWorkoutExercise(workoutExerciseId, nextSetNumber, reps, weightLbs);
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
});

export async function removeExerciseAction(params: {
  workoutExerciseId: string;
}) {
  const { workoutExerciseId } = removeExerciseSchema.parse(params);
  await removeWorkoutExercise(workoutExerciseId);
}

const removeSetSchema = z.object({
  setId: z.string().uuid(),
});

export async function removeSetAction(params: { setId: string }) {
  const { setId } = removeSetSchema.parse(params);
  await removeSet(setId);
}

const updateSetSchema = z.object({
  setId: z.string().uuid(),
  reps: z.number().int().positive().nullable(),
  weightLbs: z.string().nullable(),
});

export async function updateSetAction(params: {
  setId: string;
  reps: number | null;
  weightLbs: string | null;
}) {
  const { setId, reps, weightLbs } = updateSetSchema.parse(params);
  await updateSet(setId, reps, weightLbs);
}
