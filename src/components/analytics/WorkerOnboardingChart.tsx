import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Worker } from "@/components/workers/WorkerCard";
import { TrendingUp, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkerOnboardingChartProps {
  workers: Worker[];
}

export function WorkerOnboardingChart({ workers }: WorkerOnboardingChartProps) {
  const [timeframe, setTimeframe] = useState("monthly");
  const [chartData, setChartData] = useState<
    { label: string; count: number }[]
  >([]);

  useEffect(() => {
    // Process worker data based on selected timeframe
    const processedData = processWorkerData(workers || [], timeframe);
    setChartData(processedData);
  }, [workers, timeframe]);

  // Function to process worker data based on timeframe
  const processWorkerData = (workers: Worker[], timeframe: string) => {
    // For real data, we would use created_at field
    // Since we don't have that in the Worker type, we'll simulate it
    const workerDates = workers.map((worker, index) => {
      // Create dates spread across the last year
      const date = new Date();
      date.setMonth(date.getMonth() - (index % 12));
      date.setDate(Math.max(1, date.getDate() - ((index * 3) % 28)));
      return { worker, date };
    });

    const data: Record<string, number> = {};

    workerDates.forEach(({ worker, date }) => {
      let key = "";

      if (timeframe === "weekly") {
        // Get week number and year
        const weekNumber = getWeekNumber(date);
        key = `Week ${weekNumber}, ${date.getFullYear()}`;
      } else if (timeframe === "monthly") {
        // Get month and year
        key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      } else if (timeframe === "quarterly") {
        // Get quarter and year
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${quarter} ${date.getFullYear()}`;
      }

      if (!data[key]) {
        data[key] = 0;
      }
      data[key]++;
    });

    // Convert to array and sort
    return Object.entries(data)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => {
        // Sort based on timeframe
        if (timeframe === "weekly") {
          // Extract week number and year for comparison
          const [weekA, yearA] = a.label.split(", ");
          const [weekB, yearB] = b.label.split(", ");
          return yearA === yearB
            ? parseInt(weekA.replace("Week ", "")) -
                parseInt(weekB.replace("Week ", ""))
            : parseInt(yearA) - parseInt(yearB);
        } else if (timeframe === "monthly") {
          // Convert month names to dates for comparison
          const dateA = new Date(`${a.label} 1`);
          const dateB = new Date(`${b.label} 1`);
          return dateA.getTime() - dateB.getTime();
        } else {
          // Sort quarters
          const [qA, yearA] = a.label.split(" ");
          const [qB, yearB] = b.label.split(" ");
          return yearA === yearB
            ? qA.localeCompare(qB)
            : parseInt(yearA) - parseInt(yearB);
        }
      });
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Calculate cumulative worker count
  const cumulativeData = chartData.reduce(
    (acc, item, index) => {
      const previousCount = index > 0 ? acc[index - 1].count : 0;
      acc.push({
        label: item.label,
        newWorkers: item.count,
        count: previousCount + item.count,
      });
      return acc;
    },
    [] as { label: string; newWorkers: number; count: number }[],
  );

  // Calculate max value for chart scaling
  const maxValue =
    cumulativeData.length > 0
      ? Math.max(...cumulativeData.map((item) => item.count)) * 1.1 // Add 10% padding
      : 10;

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Worker Onboarding Trends
          </div>
        </CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {cumulativeData.length > 0 ? (
          <div className="h-[300px] w-full">
            <div className="relative h-full w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
                <span>{Math.ceil(maxValue)}</span>
                <span>{Math.ceil(maxValue * 0.75)}</span>
                <span>{Math.ceil(maxValue * 0.5)}</span>
                <span>{Math.ceil(maxValue * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Chart grid */}
              <div className="absolute left-10 right-0 top-0 bottom-0">
                {[0.25, 0.5, 0.75, 1].map((line) => (
                  <div
                    key={line}
                    className="absolute border-t border-gray-200 w-full"
                    style={{ top: `${(1 - line) * 100}%` }}
                  ></div>
                ))}

                {/* Area chart for cumulative count */}
                <svg className="absolute inset-0 h-full w-full overflow-visible">
                  {/* Area fill */}
                  <path
                    d={[
                      // Start at bottom left
                      `M 0 ${100}`,
                      // Draw line to each point
                      ...cumulativeData.map((point, i) => {
                        const x = (i / (cumulativeData.length - 1)) * 100;
                        const y = 100 - (point.count / maxValue) * 100;
                        return `L ${x} ${y}`;
                      }),
                      // Draw line to bottom right
                      `L ${100} ${100}`,
                      // Close path
                      "Z",
                    ].join(" ")}
                    fill="url(#onboarding-gradient)"
                    fillOpacity="0.2"
                  />

                  {/* Define gradient */}
                  <defs>
                    <linearGradient
                      id="onboarding-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>

                  {/* Line for cumulative count */}
                  <path
                    d={cumulativeData
                      .map((point, i) => {
                        const x = (i / (cumulativeData.length - 1)) * 100;
                        const y = 100 - (point.count / maxValue) * 100;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#6366f1" // indigo-500
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {cumulativeData.map((point, i) => {
                    const x = (i / (cumulativeData.length - 1)) * 100;
                    const y = 100 - (point.count / maxValue) * 100;
                    return (
                      <g key={i} className="group">
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#6366f1"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer"
                        />
                        {/* Tooltip */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <rect
                            x={`${x}%`}
                            y={`${y - 10}%`}
                            width="100"
                            height="40"
                            rx="4"
                            transform="translate(-50, -40)"
                            fill="#1e293b" // slate-800
                          />
                          <text
                            x={`${x}%`}
                            y={`${y - 10}%`}
                            transform="translate(0, -25)"
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            Total: {point.count} workers
                          </text>
                          <text
                            x={`${x}%`}
                            y={`${y - 10}%`}
                            transform="translate(0, -10)"
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            New: +{point.newWorkers} in {point.label}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute left-0 right-0 bottom-0 transform translate-y-6 flex justify-between text-xs text-gray-500">
                  {cumulativeData.map((point, i) => (
                    <span
                      key={i}
                      className="text-center"
                      style={{ width: `${100 / cumulativeData.length}%` }}
                    >
                      {point.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No worker onboarding data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
