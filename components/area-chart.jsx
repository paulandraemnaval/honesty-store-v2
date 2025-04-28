"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Skeleton } from "@/components/ui/skeleton";

export function IncomeChart({ profitHist, isLoading }) {
  const [chartData, setChartData] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    if (profitHist && profitHist.length > 0) {
      // Filter out entries with null dates and calculate total
      const validProfit = profitHist.filter((item) => item.date.start !== null);
      const total = validProfit.reduce((sum, item) => sum + item.total, 0);
      setTotalProfit(total);

      // Format the data for the chart
      const formattedData = validProfit.map((item) => {
        const startDate = new Date(item.date.start);
        return {
          date: startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          profit: item.total,
          fullDate: startDate, // Keep full date for sorting
        };
      });

      // Sort by date
      formattedData.sort((a, b) => a.fullDate - b.fullDate);

      // Remove the redundant fullDate property before setting to state
      setChartData(formattedData.map(({ fullDate, ...rest }) => rest));
    }
  }, [profitHist]);

  const chartConfig = {
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
  };

  if (isLoading) {
    return <IncomeSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 30,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value}`}
              />
              <Tooltip
                content={<ChartTooltipContent indicator="line" />}
                formatter={(value) => [`₱${value.toFixed(2)}`]}
              />
              <Area
                dataKey="profit"
                type="monotone"
                stroke="var(--color-profit, hsl(var(--chart-1)))"
                fill="var(--color-profit, hsl(var(--chart-1)))"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function IncomeSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income</CardTitle>
        <CardDescription>Loading profit data...</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {/* Chart skeleton */}
        <div className="space-y-2 w-full h-full flex flex-col justify-between">
          {/* Chart area skeleton */}
          <div className="flex-1 relative">
            <Skeleton className="absolute inset-0" />
          </div>

          {/* X-axis labels skeleton */}
          <div className="flex justify-between pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-10" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default IncomeChart;
