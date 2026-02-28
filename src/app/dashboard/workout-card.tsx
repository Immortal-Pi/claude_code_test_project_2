import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type WorkoutWithDetails = {
  id: string;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  workoutExercises: {
    id: string;
    order: number;
    exercise: { id: string; name: string };
    sets: {
      id: string;
      setNumber: number;
      reps: number | null;
      weightLbs: string | null;
    }[];
  }[];
};

export function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name ?? "Untitled Workout"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Started at {format(workout.startedAt, "h:mm a")}
          {workout.completedAt &&
            ` — Completed at ${format(workout.completedAt, "h:mm a")}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {workout.workoutExercises.map((we) => (
          <div key={we.id}>
            <h3 className="font-semibold">{we.exercise.name}</h3>
            <table className="mt-1 w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1">Set</th>
                  <th className="py-1">Reps</th>
                  <th className="py-1">Weight (lbs)</th>
                </tr>
              </thead>
              <tbody>
                {we.sets.map((set) => (
                  <tr key={set.id}>
                    <td className="py-1">{set.setNumber}</td>
                    <td className="py-1">{set.reps ?? "—"}</td>
                    <td className="py-1">{set.weightLbs ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
