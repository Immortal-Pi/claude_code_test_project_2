import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";
import { TZDate } from "@date-fns/tz";

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
