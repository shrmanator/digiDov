"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataItem {
  month: string;
  donation: number;
}

interface AnalyticsChartsProps {
  chartData: ChartDataItem[];
}

export default function AnalyticsCharts({ chartData }: AnalyticsChartsProps) {
  // Calculate percentage change compared to previous month
  console.log("chartData:", chartData);
  const calculateTrend = () => {
    if (chartData.length < 2) return 0;

    const currentMonth = chartData[chartData.length - 1].donation;
    const previousMonth = chartData[chartData.length - 2].donation;

    return previousMonth === 0
      ? 0
      : (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1);
  };

  const percentChange = calculateTrend();
  const isPositive = Number(percentChange) >= 0;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Analytics - Monthly Donations</CardTitle>
        <CardDescription>
          Total fiat donations aggregated by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="donationGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                padding={{ left: 10, right: 10 }}
                tickFormatter={(value: string) => {
                  // Format "YYYY-MM" into abbreviated month (e.g. "Jan")
                  const date = new Date(value + "-01");
                  return date.toLocaleString("default", { month: "short" });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Donations",
                ]}
                labelFormatter={(label: string) => {
                  const date = new Date(label + "-01");
                  return date.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  });
                }}
              />
              <Area
                type="monotone"
                dataKey="donation"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#donationGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              <span>
                Trending {isPositive ? "up" : "down"} by{" "}
                {Math.abs(Number(percentChange))}% this month
              </span>
              <TrendingUp
                className={`h-4 w-4 ${
                  isPositive ? "text-green-500" : "text-red-500"
                } ${!isPositive && "rotate-180"}`}
              />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Data from recent months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
