import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Worker } from "@/components/workers/WorkerCard";
import { PieChart, Users } from "lucide-react";

interface WorkerStatusChartProps {
  workers: Worker[];
}

interface StatusCount {
  status: string;
  count: number;
  color: string;
}

export function WorkerStatusChart({ workers }: WorkerStatusChartProps) {
  const [statusData, setStatusData] = useState<StatusCount[]>([]);

  useEffect(() => {
    // Count workers by status
    const statusCounts: Record<string, number> = {};
    (workers || []).forEach((worker) => {
      if (!statusCounts[worker.status]) {
        statusCounts[worker.status] = 0;
      }
      statusCounts[worker.status]++;
    });

    // Define colors for each status
    const statusColors: Record<string, string> = {
      active: "#22c55e", // green-500
      inactive: "#94a3b8", // slate-400
      "on-leave": "#f59e0b", // amber-500
    };

    // Convert to array format for chart
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || "#cbd5e1", // Default color
    }));

    setStatusData(chartData);
  }, [workers]);

  // Calculate total for percentages
  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Worker Status Distribution
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statusData.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Pie Chart */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {statusData.map((item, index) => {
                  // Calculate pie chart segments
                  let cumulativePercent = 0;
                  for (let i = 0; i < index; i++) {
                    cumulativePercent += (statusData[i].count / total) * 100;
                  }

                  const percent = (item.count / total) * 100;
                  const startX = Math.cos(
                    (2 * Math.PI * cumulativePercent) / 100,
                  );
                  const startY = Math.sin(
                    (2 * Math.PI * cumulativePercent) / 100,
                  );
                  const endX = Math.cos(
                    (2 * Math.PI * (cumulativePercent + percent)) / 100,
                  );
                  const endY = Math.sin(
                    (2 * Math.PI * (cumulativePercent + percent)) / 100,
                  );

                  const largeArcFlag = percent > 50 ? 1 : 0;

                  // Create SVG arc path
                  const pathData = [
                    `M 50 50`,
                    `L ${50 + 50 * startX} ${50 + 50 * startY}`,
                    `A 50 50 0 ${largeArcFlag} 1 ${50 + 50 * endX} ${50 + 50 * endY}`,
                    `Z`,
                  ].join(" ");

                  return (
                    <path
                      key={item.status}
                      d={pathData}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {statusData.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="capitalize">
                    {item.status.replace("-", " ")}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {item.count} ({((item.count / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No worker status data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
