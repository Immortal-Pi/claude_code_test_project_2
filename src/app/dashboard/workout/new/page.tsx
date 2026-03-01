import { NewWorkoutForm } from "./new-workout-form";

export default function NewWorkoutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Log New Workout</h1>
      <NewWorkoutForm />
    </main>
  );
}
