import Link from "next/link";
import { format, getDay, getDaysInMonth } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { DashboardCalendar } from "./dashboard-calendar";
import { WorkoutCard } from "./workout-card";
import { MonthlySetsChart } from "./monthly-sets-chart";
import { WeeklyTrackerChart } from "./weekly-tracker-chart";
import {
  getWorkoutsForDate,
  getWorkoutsForMonth,
  getWorkoutsForWeek,
} from "@/data/workouts";
import { getUserTimezone } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toChartKey = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const timezone = await getUserTimezone();

  const dateStr =
    dateParam ??
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());

  const [y, m, d] = dateStr.split("-").map(Number);

  const [workouts, monthlyWorkouts, weeklyWorkouts] = await Promise.all([
    getWorkoutsForDate(dateStr, timezone),
    getWorkoutsForMonth(y, m, timezone),
    getWorkoutsForWeek(dateStr, timezone),
  ]);

  const displayDate = new Date(y, m - 1, d);

  // --- Monthly data processing ---
  const exerciseSetCounts = new Map<string, number>();
  const monthlyMap = new Map<number, Map<string, number>>();

  for (const workout of monthlyWorkouts) {
    const workoutDay = new TZDate(workout.startedAt, timezone).getDate();
    for (const we of workout.workoutExercises) {
      const name = we.exercise.name;
      const setCount = we.sets.length;
      exerciseSetCounts.set(name, (exerciseSetCounts.get(name) ?? 0) + setCount);
      if (!monthlyMap.has(workoutDay)) monthlyMap.set(workoutDay, new Map());
      const dayMap = monthlyMap.get(workoutDay)!;
      dayMap.set(name, (dayMap.get(name) ?? 0) + setCount);
    }
  }

  const topExercises = [...exerciseSetCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const totalSets = [...exerciseSetCounts.values()].reduce((a, b) => a + b, 0);

  const daysInMonth = getDaysInMonth(displayDate);
  const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const point: { day: number; [key: string]: number } = { day };
    const exerciseMap = monthlyMap.get(day);
    if (exerciseMap) {
      for (const name of topExercises) {
        const val = exerciseMap.get(name);
        if (val) point[toChartKey(name)] = val;
      }
    }
    return point;
  });

  const monthLabel = format(displayDate, "MMM yyyy");

  // --- Weekly data processing ---
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date()
  );

  const weeklySetsByDay = new Map<string, number>();
  const weeklyDayStrings = new Map<string, string>();

  for (const workout of weeklyWorkouts) {
    const wDate = new TZDate(workout.startedAt, timezone);
    const jsDay = getDay(wDate);
    // Convert JS day (0=Sun) to Mon-start index
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const dayLabel = DAY_LABELS[dayIndex];
    const dayStr = format(wDate, "yyyy-MM-dd");
    weeklyDayStrings.set(dayLabel, dayStr);

    let sets = 0;
    for (const we of workout.workoutExercises) {
      sets += we.sets.length;
    }
    weeklySetsByDay.set(dayLabel, (weeklySetsByDay.get(dayLabel) ?? 0) + sets);
  }

  const weeklyData = DAY_LABELS.map((day) => ({
    day,
    sets: weeklySetsByDay.get(day) ?? 0,
    isToday: weeklyDayStrings.get(day) === todayStr,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Workout Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Workouts for {format(displayDate, "do MMM yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <DashboardCalendar selectedDate={dateStr} />
              <Button asChild>
                <Link href={`/dashboard/workout/new?date=${dateStr}`}>
                  Log New Workout
                </Link>
              </Button>
            </div>
          </div>

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <p className="text-muted-foreground">
                  No workouts logged for this date.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <MonthlySetsChart
            data={monthlyData}
            exerciseNames={topExercises}
            totalSets={totalSets}
            monthLabel={monthLabel}
          />
          <WeeklyTrackerChart data={weeklyData} />
        </div>
      </div>
    </main>
  );
}
