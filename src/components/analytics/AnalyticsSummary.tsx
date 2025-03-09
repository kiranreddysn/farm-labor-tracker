import { Card, CardContent } from "@/components/ui/card";
import type { Worker } from "@/components/workers/WorkerCard";
import { Users, Clock, DollarSign, TrendingUp } from "lucide-react";

interface AnalyticsSummaryProps {
  workers: Worker[];
  shifts: any[];
  payments: any[];
}

export function AnalyticsSummary({
  workers,
  shifts,
  payments,
}: AnalyticsSummaryProps) {
  // Calculate total workers
  const totalWorkers = (workers || []).length;
  const activeWorkers = (workers || []).filter(
    (w) => w.status === "active",
  ).length;

  // Calculate total hours worked
  const totalHours = (shifts || []).reduce(
    (sum, shift) => sum + Number(shift.hours),
    0,
  );

  // Calculate total payments
  const totalPayments = (payments || []).reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  // Calculate average hourly rate
  const avgHourlyRate =
    (shifts || []).length > 0
      ? (shifts || []).reduce(
          (sum, shift) => sum + Number(shift.hourly_rate),
          0,
        ) / (shifts || []).length
      : 0;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Workers</p>
              <div className="flex items-end gap-1">
                <h4 className="text-2xl font-bold">{totalWorkers}</h4>
                <p className="text-sm text-green-600 mb-1">
                  {activeWorkers} active
                </p>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-5 w-5 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <div className="flex items-end gap-1">
                <h4 className="text-2xl font-bold">{totalHours.toFixed(1)}</h4>
                <p className="text-sm text-gray-500 mb-1">hours</p>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Payments
              </p>
              <div className="flex items-end gap-1">
                <h4 className="text-2xl font-bold">
                  ${totalPayments.toFixed(2)}
                </h4>
              </div>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <DollarSign className="h-5 w-5 text-amber-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Avg Hourly Rate
              </p>
              <div className="flex items-end gap-1">
                <h4 className="text-2xl font-bold">
                  ${avgHourlyRate.toFixed(2)}
                </h4>
                <p className="text-sm text-gray-500 mb-1">per hour</p>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
