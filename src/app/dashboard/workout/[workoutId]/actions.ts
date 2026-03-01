"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

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
