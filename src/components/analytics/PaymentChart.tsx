import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, DollarSign } from "lucide-react";

interface PaymentChartProps {
  payments: any[];
}

export function PaymentChart({ payments }: PaymentChartProps) {
  const [timeframe, setTimeframe] = useState("monthly");
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    // Process payments based on selected timeframe
    const processedData = processPaymentData(payments || [], timeframe);
    setChartData(processedData);
  }, [payments, timeframe]);

  // Function to process payment data based on timeframe
  const processPaymentData = (payments: any[], timeframe: string) => {
    const data: Record<string, number> = {};

    payments.forEach((payment) => {
      const date = new Date(payment.payment_date);
      let key = "";

      if (timeframe === "weekly") {
        // Get week number and year
        const weekNumber = getWeekNumber(date);
        key = `Week ${weekNumber}, ${date.getFullYear()}`;
      } else if (timeframe === "monthly") {
        // Get month and year
        key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      } else if (timeframe === "yearly") {
        // Get year
        key = date.getFullYear().toString();
      }

      if (!data[key]) {
        data[key] = 0;
      }
      data[key] += Number(payment.amount);
    });

    // Convert to array and sort
    return Object.entries(data)
      .map(([label, value]) => ({ label, value }))
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
          // Simple numeric comparison for years
          return parseInt(a.label) - parseInt(b.label);
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
  const maxValue =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.value)) * 1.1 // Add 10% padding
      : 100;

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-green-700" />
            Payment Trends
          </div>
        </CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <div className="flex h-full items-end gap-2">
              {chartData.map((item, index) => {
                const height = (item.value / maxValue) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-green-200 hover:bg-green-300 transition-all rounded-t relative group"
                      style={{ height: `${height}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        ${item.value.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate w-full text-center">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No payment data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
