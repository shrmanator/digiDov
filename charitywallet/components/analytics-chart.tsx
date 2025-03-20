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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";

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
  console.log("Fiat donations by month with additional metrics:", chartData);

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

  // Get a date range description for the radial chart
  const getDateRangeDescription = () => {
    if (chartData.length === 0) return "No data available";
    try {
      const startDate = new Date(chartData[0].month + "-01");
      const endDate = new Date(chartData[chartData.length - 1].month + "-01");
      return `${startDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })} - ${endDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Data period unavailable";
    }
  };

  // Prepare data for the pie chart (using the last 4 months)
  const pieData = chartData.slice(-4).map((item) => {
    try {
      return {
        name: new Date(item.month + "-01").toLocaleString("default", {
          month: "short",
        }),
        value: item.totalDonationAmount,
      };
    } catch (e) {
      console.error("Error formatting pie chart data:", e);
      return { name: item.month, value: item.totalDonationAmount };
    }
  });

  // Calculate total fiat donations for the radial chart
  const totalDonations = chartData.reduce(
    (sum, item) => sum + item.totalDonationAmount,
    0
  );

  // Calculate a percentage for the radial chart based on the current vs. highest month
  const calculateRadialPercentage = () => {
    if (chartData.length === 0) return 0;
    const currentMonth = chartData[chartData.length - 1].totalDonationAmount;
    const highestMonth = Math.max(
      ...chartData.map((item) => item.totalDonationAmount)
    );
    return Math.round((currentMonth / highestMonth) * 100);
  };

  const radialPercentage = calculateRadialPercentage();

  // Colors for the pie chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  return (
    <div className="space-y-8">
      {/* Area Chart */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Analytics - Monthly Fiat Donations</CardTitle>
          <CardDescription>
            Total fiat donations aggregated by month along with donation count
            and average donation
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
                  formatter={(value: number, name: string, props: any) => {
                    if (props.payload) {
                      const { donationCount, averageDonationAmount } =
                        props.payload;
                      return [
                        `Total: $${value.toLocaleString()} | Count: ${donationCount} | Avg: $${averageDonationAmount.toFixed(
                          2
                        )}`,
                        "Fiat Donations",
                      ];
                    }
                    return [`$${value.toLocaleString()}`, "Fiat Donations"];
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

      {/* Pie Chart and Radial Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Pie Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Recent Fiat Donation Distribution</CardTitle>
            <CardDescription>
              Last {Math.min(4, chartData.length)} months
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Fiat Donations",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {isPositive ? "Growing" : "Declining"} trend in recent fiat
              donations
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Breakdown by month
            </div>
          </CardFooter>
        </Card>

        {/* Radial Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Total Fiat Donations</CardTitle>
            <CardDescription>{getDateRangeDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <div className="mx-auto aspect-square max-h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={[{ name: "Fiat Donations", value: radialPercentage }]}
                  startAngle={0}
                  endAngle={360 * (radialPercentage / 100)}
                  innerRadius={80}
                  outerRadius={110}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[86, 74]}
                  />
                  <RadialBar
                    dataKey="value"
                    background
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    cornerRadius={10}
                  />
                  <PolarRadiusAxis
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const formattedValue =
                            totalDonations >= 1000000
                              ? `$${(totalDonations / 1000000).toFixed(1)}M`
                              : totalDonations >= 1000
                              ? `$${(totalDonations / 1000).toFixed(1)}K`
                              : `$${totalDonations}`;
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-4xl font-bold"
                              >
                                {formattedValue}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total Fiat Donations
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending {isPositive ? "up" : "down"} by{" "}
              {Math.abs(Number(percentChange))}% this month
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Based on data from {chartData.length} months
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
