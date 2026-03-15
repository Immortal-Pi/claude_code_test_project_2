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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createWorkout } from "./actions";

export function NewWorkoutForm({ initialDate }: { initialDate?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const now = initialDate
    ? (() => { const [y, m, d] = initialDate.split("-").map(Number); return new Date(y, m - 1, d); })()
    : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [month, setMonth] = useState<Date>(now);
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
      await createWorkout({ name, startedAt });
      router.push(`/dashboard?date=${dateStr}`);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Push Day, Leg Day"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={dateOpen} onOpenChange={(isOpen) => {
              if (isOpen) setMonth(selectedDate);
              setDateOpen(isOpen);
            }}>
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
                      setMonth(date);
                      setDateOpen(false);
                    }
                  }}
                  month={month}
                  onMonthChange={setMonth}
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
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Workout"}
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
