"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateWorkoutAction } from "./actions";

type Props = {
  workout: {
    id: string;
    name: string | null;
    startedAt: Date;
  };
};

export function EditWorkoutForm({ workout }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultDate = format(workout.startedAt, "yyyy-MM-dd");
  const defaultTime = format(workout.startedAt, "HH:mm");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const startedAt = `${date}T${time}`;

    startTransition(async () => {
      await updateWorkoutAction({ workoutId: workout.id, name, startedAt });
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Push Day, Leg Day"
              defaultValue={workout.name ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Start Time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              defaultValue={defaultTime}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
