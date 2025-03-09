import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Clock } from "lucide-react";

interface ShiftTrendsChartProps {
  shifts: any[];
}

export function ShiftTrendsChart({ shifts }: ShiftTrendsChartProps) {
  const [timeframe, setTimeframe] = useState("weekly");
  const [chartData, setChartData] = useState<
    { label: string; hours: number; earnings: number }[]
  >([]);

  useEffect(() => {
    // Process shifts based on selected timeframe
    const processedData = processShiftData(shifts || [], timeframe);
    setChartData(processedData);
  }, [shifts, timeframe]);

  // Function to process shift data based on timeframe
  const processShiftData = (shifts: any[], timeframe: string) => {
    const data: Record<string, { hours: number; earnings: number }> = {};

    shifts.forEach((shift) => {
      const date = new Date(shift.shift_date);
      let key = "";

      if (timeframe === "weekly") {
        // Get week number and year
        const weekNumber = getWeekNumber(date);
        key = `Week ${weekNumber}`;
      } else if (timeframe === "monthly") {
        // Get month and year
        key = date.toLocaleString("default", { month: "short" });
      } else if (timeframe === "daily") {
        // Get day of week
        key = date.toLocaleString("default", { weekday: "short" });
      }

      if (!data[key]) {
        data[key] = { hours: 0, earnings: 0 };
      }
      data[key].hours += Number(shift.hours);
      data[key].earnings += Number(shift.total_amount);
    });

    // Convert to array and sort
    return Object.entries(data)
      .map(([label, values]) => ({ label, ...values }))
      .sort((a, b) => {
        // Custom sort based on timeframe
        if (timeframe === "daily") {
          // Sort by day of week
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return days.indexOf(a.label) - days.indexOf(b.label);
        } else if (timeframe === "monthly") {
          // Sort by month
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return months.indexOf(a.label) - months.indexOf(b.label);
        } else {
          // Sort by week number
          return (
            parseInt(a.label.replace("Week ", "")) -
            parseInt(b.label.replace("Week ", ""))
          );
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

  // Calculate max value for chart scaling
  const maxHours =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.hours)) * 1.1 // Add 10% padding
      : 10;

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            Shift Trends
          </div>
        </CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">By Day of Week</SelectItem>
            <SelectItem value="weekly">By Week</SelectItem>
            <SelectItem value="monthly">By Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            {/* Line chart for hours */}
            <div className="relative h-full w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
                <span>{maxHours.toFixed(0)}</span>
                <span>{(maxHours * 0.75).toFixed(0)}</span>
                <span>{(maxHours * 0.5).toFixed(0)}</span>
                <span>{(maxHours * 0.25).toFixed(0)}</span>
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

                {/* Data points and line */}
                <svg className="absolute inset-0 h-full w-full overflow-visible">
                  {/* Line connecting points */}
                  <path
                    d={chartData
                      .map((point, i) => {
                        const x = (i / (chartData.length - 1)) * 100;
                        const y = 100 - (point.hours / maxHours) * 100;
                        return `${i === 0 ? "M" : "L"} ${x}% ${y}%`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#3b82f6" // blue-500
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {chartData.map((point, i) => {
                    const x = (i / (chartData.length - 1)) * 100;
                    const y = 100 - (point.hours / maxHours) * 100;
                    return (
                      <g key={i} className="group">
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer"
                        />
                        {/* Tooltip */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <rect
                            x={`${x}%`}
                            y={`${y - 10}%`}
                            width="80"
                            height="30"
                            rx="4"
                            transform="translate(-40, -30)"
                            fill="#1e293b" // slate-800
                          />
                          <text
                            x={`${x}%`}
                            y={`${y - 10}%`}
                            transform="translate(0, -15)"
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            {point.hours.toFixed(1)} hrs
                          </text>
                          <text
                            x={`${x}%`}
                            y={`${y - 10}%`}
                            transform="translate(0, -5)"
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                          >
                            ${point.earnings.toFixed(2)}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute left-0 right-0 bottom-0 transform translate-y-6 flex justify-between text-xs text-gray-500">
                  {chartData.map((point, i) => (
                    <span
                      key={i}
                      className="text-center"
                      style={{ width: `${100 / chartData.length}%` }}
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
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No shift data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
