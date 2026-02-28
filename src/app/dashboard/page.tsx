import { format } from "date-fns";
import { DashboardCalendar } from "./dashboard-calendar";
import { WorkoutCard } from "./workout-card";
import { getWorkoutsForDate } from "@/data/workouts";
import { getUserTimezone } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const timezone = await getUserTimezone();

  // If no date param, use today in the user's timezone
  const dateStr =
    dateParam ??
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());

  const workouts = await getWorkoutsForDate(dateStr, timezone);

  // Parse components for display only
  const [y, m, d] = dateStr.split("-").map(Number);
  const displayDate = new Date(y, m - 1, d);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Workout Dashboard</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
        <div>
          <h2 className="mb-4 text-lg font-bold">Select Date</h2>
          <DashboardCalendar selectedDate={displayDate} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">
            Workouts for {format(displayDate, "do MMM yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <p className="text-muted-foreground">
                  No workouts logged for this date.
                </p>
                <Button>Log New Workout</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Button>Log New Workout</Button>
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
