"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DatePicker } from "./date-picker";
import { WorkoutCard, type WorkoutWithDetails } from "./workout-card";

const mockWorkouts: WorkoutWithDetails[] = [
  {
    id: "1",
    name: "Upper Body",
    startedAt: new Date("2026-02-28T09:00:00"),
    completedAt: new Date("2026-02-28T10:15:00"),
    workoutExercises: [
      {
        id: "we1",
        order: 1,
        exercise: { id: "e1", name: "Bench Press" },
        sets: [
          { id: "s1", setNumber: 1, reps: 8, weightLbs: "185" },
          { id: "s2", setNumber: 2, reps: 8, weightLbs: "185" },
          { id: "s3", setNumber: 3, reps: 6, weightLbs: "195" },
        ],
      },
      {
        id: "we2",
        order: 2,
        exercise: { id: "e2", name: "Overhead Press" },
        sets: [
          { id: "s4", setNumber: 1, reps: 10, weightLbs: "95" },
          { id: "s5", setNumber: 2, reps: 8, weightLbs: "95" },
          { id: "s6", setNumber: 3, reps: 8, weightLbs: "95" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Cardio",
    startedAt: new Date("2026-02-28T17:00:00"),
    completedAt: null,
    workoutExercises: [
      {
        id: "we3",
        order: 1,
        exercise: { id: "e3", name: "Treadmill Run" },
        sets: [
          { id: "s7", setNumber: 1, reps: null, weightLbs: null },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const workouts = mockWorkouts;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {workouts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No workouts logged for {format(selectedDate, "do MMM yyyy")}.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </main>
  );
}
