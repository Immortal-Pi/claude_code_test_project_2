"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  selectedDate,
  onDateChange,
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleSelect(day: Date | undefined) {
    if (!day) return;
    setOpen(false);
    onDateChange(day);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[240px] justify-start text-left font-normal")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(selectedDate, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
