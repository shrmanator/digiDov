"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
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
import { Payload } from "recharts/types/component/DefaultTooltipContent";

// Updated interface with new key names
interface ChartDataItem {
  month: string;
  totalDonationAmount: number; // Total fiat donation amount for the month
  donationCount: number; // Number of donations in the month
  averageDonationAmount: number; // Average donation value for the month
}

interface AnalyticsChartsProps {
  chartData: ChartDataItem[];
}

export default function AnalyticsCharts({ chartData }: AnalyticsChartsProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center p-10">
        <p>No fiat donation data available for analysis.</p>
      </div>
    );
  }

  // Calculate percentage change compared to the previous month
  const calculateTrend = () => {
    if (chartData.length < 2) return 0;
    const currentMonth = chartData[chartData.length - 1].totalDonationAmount;
    const previousMonth = chartData[chartData.length - 2].totalDonationAmount;
    return previousMonth === 0
      ? 0
      : (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1);
  };

  const percentChange = calculateTrend();
  const isPositive = Number(percentChange) >= 0;

  return (
    <div className="space-y-8">
      {/* Area Chart */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Monthly Donations</CardTitle>
          <CardDescription>
            Total donations aggregated by month along with donation count and
            average donation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[calc(100vh-450px)] w-full">
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
                    try {
                      const date = new Date(value + "-01");
                      return date.toLocaleString("default", { month: "short" });
                    } catch (e) {
                      console.error("XAxis formatting error:", e);
                      return value;
                    }
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
                  formatter={(
                    value: number,
                    name: string,
                    props: Payload<number, string>
                  ) => {
                    if (props && props.payload) {
                      const payload = props.payload as unknown as ChartDataItem;
                      const { donationCount, averageDonationAmount } = payload;
                      return [
                        `Total: ${value.toLocaleString()} | Count: ${donationCount} | Avg: ${averageDonationAmount.toFixed(
                          2
                        )}`,
                        name,
                      ];
                    }
                    return [`${value.toLocaleString()}`, name];
                  }}
                  labelFormatter={(label: string) => {
                    try {
                      const date = new Date(label + "-01");
                      return date.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      });
                    } catch (e) {
                      console.error("Tooltip formatting error:", e);
                      return label;
                    }
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalDonationAmount"
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
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Data from {chartData.length} months of fiat donations
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
