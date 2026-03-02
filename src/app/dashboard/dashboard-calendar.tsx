"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardCalendar({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();
  const [y, m, d] = selectedDate.split("-").map(Number);
  const selected = new Date(y, m - 1, d);

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
          selected={selected}
          onSelect={handleSelect}
        />
      </CardContent>
    </Card>
  );
}
