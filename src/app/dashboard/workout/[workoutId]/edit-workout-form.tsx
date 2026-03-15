"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  const [selectedDate, setSelectedDate] = useState<Date>(workout.startedAt);
  const [hour, setHour] = useState(workout.startedAt.getHours());
  const [minute, setMinute] = useState(workout.startedAt.getMinutes());
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const startedAt = `${dateStr}T${timeStr}`;

    startTransition(async () => {
      await updateWorkoutAction({ workoutId: workout.id, name, startedAt });
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "do MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setDateOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {String(hour).padStart(2, "0")}:
                {String(minute).padStart(2, "0")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <div className="flex gap-4 items-end">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Hour
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={hour}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0 && val <= 23)
                        setHour(val);
                    }}
                    className="w-16 text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Minute
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={minute}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0 && val <= 59)
                        setMinute(val);
                    }}
                    className="w-16 text-center"
                  />
                </div>
                <Button size="sm" onClick={() => setTimeOpen(false)}>
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
      </div>
    </form>
  );
}
