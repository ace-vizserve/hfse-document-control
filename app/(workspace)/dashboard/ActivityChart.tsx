"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartPoint } from "./data";

const config = {
  changes: { label: "Register changes", color: "var(--chart-1)" },
  approvals: { label: "Approvals", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ActivityChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }} accessibilityLayer>
        <defs>
          <linearGradient id="fillChanges" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-changes)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-changes)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area dataKey="changes" type="monotone" stroke="var(--color-changes)" fill="url(#fillChanges)" strokeWidth={2} />
        {/* Approvals are drawn dashed with no fill so the two series differ by form, not only colour. */}
        <Area dataKey="approvals" type="monotone" stroke="var(--color-approvals)" strokeDasharray="4 4" fill="none" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
