"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  addExerciseAction,
  addSetAction,
  removeExerciseAction,
  removeSetAction,
  updateSetAction,
} from "./actions";
import type { WorkoutWithDetails } from "@/app/dashboard/workout-card";

type Props = {
  workoutId: string;
  workoutExercises: WorkoutWithDetails["workoutExercises"];
  exercises: { id: string; name: string }[];
};

export function ExerciseLogger({ workoutId, workoutExercises, exercises }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [exerciseName, setExerciseName] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    startTransition(async () => {
      await addExerciseAction({ workoutId, exerciseName: exerciseName.trim() });
      setExerciseName("");
      router.refresh();
    });
  }

  function handleRemoveExercise(workoutExerciseId: string) {
    startTransition(async () => {
      await removeExerciseAction({ workoutExerciseId });
      router.refresh();
    });
  }

  function handleAddSet(workoutExerciseId: string) {
    startTransition(async () => {
      await addSetAction({
        workoutExerciseId,
        reps: null,
        weightLbs: null,
      });
      router.refresh();
    });
  }

  function handleRemoveSet(setId: string) {
    startTransition(async () => {
      await removeSetAction({ setId });
      router.refresh();
    });
  }

  function handleUpdateSet(
    setId: string,
    field: "reps" | "weightLbs",
    value: string
  ) {
    startTransition(async () => {
      // We need current values; find the set in our data
      let currentReps: number | null = null;
      let currentWeight: string | null = null;

      for (const we of workoutExercises) {
        const set = we.sets.find((s) => s.id === setId);
        if (set) {
          currentReps = set.reps;
          currentWeight = set.weightLbs;
          break;
        }
      }

      const reps =
        field === "reps"
          ? value === ""
            ? null
            : parseInt(value, 10) || null
          : currentReps;
      const weightLbs =
        field === "weightLbs"
          ? value === ""
            ? null
            : value
          : currentWeight;

      await updateSetAction({ setId, reps, weightLbs });
      router.refresh();
    });
  }

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExercise} className="flex gap-2">
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="flex-1 justify-between font-normal"
                  disabled={isPending}
                >
                  {exerciseName || "Select or type an exercise..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search exercises..."
                    value={exerciseName}
                    onValueChange={setExerciseName}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {exerciseName.trim() ? (
                        <span>
                          No match — will create &quot;{exerciseName.trim()}&quot;
                        </span>
                      ) : (
                        "Type to search..."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {exercises.map((exercise) => (
                        <CommandItem
                          key={exercise.id}
                          value={exercise.name}
                          onSelect={(value) => {
                            setExerciseName(value);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              exerciseName.toLowerCase() === exercise.name.toLowerCase()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {exercise.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button type="submit" disabled={isPending || !exerciseName.trim()}>
              Add Exercise
            </Button>
          </form>
        </CardContent>
      </Card>

      {workoutExercises.map((we) => (
        <Card key={we.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{we.exercise.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveExercise(we.id)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent>
            {we.sets.length > 0 && (
              <table className="mb-4 w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1 w-16">Set</th>
                    <th className="py-1">Reps</th>
                    <th className="py-1">Weight (lbs)</th>
                    <th className="py-1 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {we.sets.map((set) => (
                    <tr key={set.id}>
                      <td className="py-1">{set.setNumber}</td>
                      <td className="py-1">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-20"
                          defaultValue={set.reps ?? ""}
                          placeholder="—"
                          onBlur={(e) =>
                            handleUpdateSet(set.id, "reps", e.target.value)
                          }
                          disabled={isPending}
                        />
                      </td>
                      <td className="py-1">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="h-8 w-24"
                          defaultValue={set.weightLbs ?? ""}
                          placeholder="—"
                          onBlur={(e) =>
                            handleUpdateSet(set.id, "weightLbs", e.target.value)
                          }
                          disabled={isPending}
                        />
                      </td>
                      <td className="py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveSet(set.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddSet(we.id)}
              disabled={isPending}
            >
              Add Set
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
