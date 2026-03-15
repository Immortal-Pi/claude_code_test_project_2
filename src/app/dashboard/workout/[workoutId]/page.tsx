import { notFound } from "next/navigation";
import { getWorkoutById, getAllExercises } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";
import { ExerciseLogger } from "./exercise-logger";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const [workout, allExercises] = await Promise.all([
    getWorkoutById(workoutId),
    getAllExercises(),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
      <ExerciseLogger
        workoutId={workout.id}
        workoutExercises={workout.workoutExercises}
        exercises={allExercises}
      />
    </main>
  );
}
