import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWorkers, fetchAllShifts, fetchAllPayments } from "@/lib/api";
import type { Worker } from "@/components/workers/WorkerCard";
import {
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { PaymentChart } from "./PaymentChart";
import { WorkerPerformanceChart } from "./WorkerPerformanceChart";
import { WorkerStatusChart } from "./WorkerStatusChart";
import { ShiftTrendsChart } from "./ShiftTrendsChart";
import { WorkerOnboardingChart } from "./WorkerOnboardingChart";
import { AnalyticsSummary } from "./AnalyticsSummary";

export function AnalyticsDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [workersData, shiftsData, paymentsData] = await Promise.all([
          fetchWorkers(),
          fetchAllShifts(),
          fetchAllPayments(),
        ]);

        setWorkers(workersData);
        setShifts(shiftsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsSummary workers={workers} shifts={shifts} payments={payments} />

      <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
        <h2 className="text-lg font-medium text-green-800 mb-2 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Farm Performance Dashboard
        </h2>
        <p className="text-sm text-green-700">
          View key metrics and trends to help manage your farm labor more
          efficiently. Use the tabs below to explore different aspects of your
          farm's performance.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1 sm:gap-2"
            >
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="workers"
              className="flex items-center gap-1 sm:gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Workers</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-1 sm:gap-2"
            >
              <DollarSign className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger
              value="shifts"
              className="flex items-center gap-1 sm:gap-2"
            >
              <Clock className="h-4 w-4" />
              <span>Shifts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <WorkerStatusChart workers={workers} />
            <WorkerPerformanceChart workers={workers} shifts={shifts} />
          </div>
          <ShiftTrendsChart shifts={shifts} />
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <WorkerPerformanceChart workers={workers} shifts={shifts} />
            <WorkerStatusChart workers={workers} />
          </div>
          <WorkerOnboardingChart workers={workers} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentChart payments={payments} />
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <ShiftTrendsChart shifts={shifts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
