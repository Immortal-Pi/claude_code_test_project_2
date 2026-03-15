"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WeeklyDataPoint = { day: string; sets: number; isToday: boolean };

const chartConfig = {
  sets: {
    label: "Sets",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function WeeklyTrackerChart({
  data,
}: {
  data: WeeklyDataPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.sets === 0) ? (
          <p className="text-muted-foreground text-center py-8 text-sm">
            No workouts this week.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={data} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill="var(--color-sets)"
                    fillOpacity={entry.isToday ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
