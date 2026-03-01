"use server";

import { z } from "zod";
import { insertWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function createWorkout(params: {
  name: string;
  startedAt: string;
}) {
  const { name, startedAt } = createWorkoutSchema.parse(params);
  await insertWorkout(name, startedAt);
}
