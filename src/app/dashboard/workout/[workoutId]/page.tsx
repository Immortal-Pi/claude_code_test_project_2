import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
    </main>
  );
}
