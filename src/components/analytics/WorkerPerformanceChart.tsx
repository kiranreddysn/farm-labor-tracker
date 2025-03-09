import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Worker } from "@/components/workers/WorkerCard";
import { Users, Award } from "lucide-react";

interface WorkerPerformanceChartProps {
  workers: Worker[];
  shifts: any[];
}

interface WorkerPerformance {
  id: string;
  name: string;
  totalHours: number;
  totalEarnings: number;
  avgHourlyRate: number;
}

export function WorkerPerformanceChart({
  workers,
  shifts,
}: WorkerPerformanceChartProps) {
  const [topWorkers, setTopWorkers] = useState<WorkerPerformance[]>([]);

  useEffect(() => {
    // Calculate performance metrics for each worker
    const workerPerformance = (workers || []).map((worker) => {
      const workerShifts = (shifts || []).filter(
        (shift) => shift.worker_id === worker.id,
      );
      const totalHours = workerShifts.reduce(
        (sum, shift) => sum + Number(shift.hours),
        0,
      );
      const totalEarnings = workerShifts.reduce(
        (sum, shift) => sum + Number(shift.total_amount),
        0,
      );
      const avgHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

      return {
        id: worker.id,
        name: worker.name,
        totalHours,
        totalEarnings,
        avgHourlyRate,
      };
    });

    // Sort by total hours and get top 5
    const sortedWorkers = [...workerPerformance]
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);

    setTopWorkers(sortedWorkers);
  }, [workers, shifts]);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top Performing Workers
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topWorkers.length > 0 ? (
          <div className="space-y-4">
            {topWorkers.map((worker, index) => (
              <div key={worker.id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{worker.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (worker.totalHours / (topWorkers[0]?.totalHours || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-medium">
                    {worker.totalHours.toFixed(1)} hrs
                  </p>
                  <p className="text-xs text-gray-500">
                    ${worker.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No worker performance data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
