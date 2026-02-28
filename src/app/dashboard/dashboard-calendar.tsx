"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardCalendar({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter();

  function handleSelect(day: Date | undefined) {
    if (!day) return;
    const dateStr = format(day, "yyyy-MM-dd");
    router.push(`/dashboard?date=${dateStr}`);
  }

  return (
    <Card>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </CardContent>
    </Card>
  );
}
