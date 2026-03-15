"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MonthlyDataPoint = { day: number; [exerciseName: string]: number };

const toChartKey = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function MonthlySetsChart({
  data,
  exerciseNames,
  totalSets,
  monthLabel,
}: {
  data: MonthlyDataPoint[];
  exerciseNames: string[];
  totalSets: number;
  monthLabel: string;
}) {
  const chartConfig: ChartConfig = Object.fromEntries(
    exerciseNames.map((name, i) => [
      toChartKey(name),
      { label: name, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Progress</CardTitle>
        <CardDescription>
          Total Sets in {monthLabel}: {totalSets}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 || exerciseNames.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">
            No workout data this month.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <LineChart data={data} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
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
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              {exerciseNames.map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={toChartKey(name)}
                  stroke={`var(--color-${toChartKey(name)})`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
