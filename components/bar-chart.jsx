"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
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

export function RevenueChart({ salesHist, isLoading }) {
  const [chartData, setChartData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (salesHist && salesHist.length > 0) {
      // Filter out entries with null dates and calculate total
      const validSales = salesHist.filter((item) => item.date.start !== null);
      const total = validSales.reduce((sum, item) => sum + item.total, 0);
      setTotalSales(total);

      // Format the data for the chart
      const formattedData = validSales.map((item) => {
        const startDate = new Date(item.date.start);
        return {
          date: startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          sales: item.total,
          fullDate: startDate, // Keep full date for sorting
        };
      });

      // Sort by date
      formattedData.sort((a, b) => a.fullDate - b.fullDate);

      // Remove the redundant fullDate property before setting to state
      setChartData(formattedData.map(({ fullDate, ...rest }) => rest));
    }
  }, [salesHist]);

  const chartConfig = {
    sales: {
      label: "Revenue",
      color: "#4285f4",
    },
  };

  if (isLoading) {
    return <RevenueSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
      </CardHeader>
      <CardContent className="h-fit">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value}`}
              />
              <Tooltip
                content={<ChartTooltipContent hideLabel />}
                formatter={(value) => [`₱${value.toFixed(2)}`]}
              />
              <Bar
                dataKey="sales"
                fill="var(--color-sales, hsl(var(--chart-2)))"
                radius={8}
                fillOpacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RevenueSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Loading Revenue data...</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {/* Bar chart skeleton */}
        <div className="space-y-2 w-full h-full flex flex-col justify-between">
          {/* Chart area skeleton */}
          <div className="flex-1 flex items-end justify-between gap-2 px-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="w-8 rounded-t-md" />
            ))}
          </div>

          {/* X-axis labels skeleton */}
          <div className="flex justify-between pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-10" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
