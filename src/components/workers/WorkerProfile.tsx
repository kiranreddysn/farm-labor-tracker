import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  fetchWorkers,
  fetchWorkerShifts,
  fetchWorkerPayments,
} from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { Worker } from "./WorkerCard";
import { ArrowLeft, Clock, DollarSign, FileText, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useToast } from "@/components/ui/use-toast";

import { PageContainer } from "@/components/layout/PageContainer";

export default function WorkerProfile() {
  const { workerId } = useParams<{ workerId: string }>();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [shiftsForSelectedDate, setShiftsForSelectedDate] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch worker data
  useEffect(() => {
    async function fetchWorkerData() {
      if (!workerId) return;

      setLoading(true);
      try {
        // Get worker details from API
        const workerDetails = await fetchWorkers();
        const workerData = workerDetails.find((w) => w.id === workerId);

        if (!workerData) throw new Error("Worker not found");

        // Set worker data
        setWorker(workerData);

        // Fetch shifts and payments
        const shiftsData = await fetchWorkerShifts(workerId);
        const paymentsData = await fetchWorkerPayments(workerId);

        setShifts(shiftsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Failed to load worker data:", error);
        toast({
          title: "Error",
          description: "Failed to load worker data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWorkerData();
  }, [workerId, toast]);

  // Update shifts for selected date when date or shifts change
  useEffect(() => {
    if (!selectedDate || !shifts.length) {
      setShiftsForSelectedDate([]);
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];
    const filteredShifts = shifts.filter(
      (shift) => shift.shift_date === dateString,
    );
    setShiftsForSelectedDate(filteredShifts);
  }, [selectedDate, shifts]);

  // Function to check if a date has shifts
  const hasShifts = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return shifts.some((shift) => shift.shift_date === dateString);
  };

  // Function to download worker's data as CSV
  const downloadWorkerData = () => {
    // Combine shifts and payments data
    const combinedData = [
      ...shifts.map((shift) => ({
        Type: "Shift",
        Date: formatDate(shift.shift_date),
        Hours: shift.hours,
        Rate: `$${shift.hourly_rate.toFixed(2)}`,
        Amount: `$${shift.total_amount.toFixed(2)}`,
        Notes: shift.notes || "",
      })),
      ...payments.map((payment) => ({
        Type: "Payment",
        Date: formatDate(payment.payment_date),
        Hours: "-",
        Rate: "-",
        Amount: `$${payment.amount.toFixed(2)}`,
        Notes: payment.notes || "",
      })),
    ];

    // Sort by date
    combinedData.sort((a, b) => {
      return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    });

    // Create CSV
    const headers = Object.keys(combinedData[0]);
    const csvRows = [headers.join(",")];

    for (const row of combinedData) {
      const values = headers.map((header) => {
        const value = row[header];
        return `"${value}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `${worker?.name.replace(/ /g, "_")}_complete_history.csv`,
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading worker data...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Worker Not Found
          </h2>
          <p className="mb-6">
            The worker you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "on-leave":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <PageContainer>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="mb-6">
          <div className="mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Worker Profile Card */}
            <Card className="w-full md:w-1/3">
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4 border border-gray-200">
                    <AvatarImage src={worker.avatarUrl} alt={worker.name} />
                    <AvatarFallback className="bg-green-50 text-green-700 text-xl">
                      {worker.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl mb-1">{worker.name}</CardTitle>
                  <Badge
                    className={`${getStatusColor(worker.status)} mb-4`}
                    variant="secondary"
                  >
                    {worker.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <Clock className="h-5 w-5 text-green-700 mb-1" />
                    <span className="text-sm text-gray-600">
                      Hours This Week
                    </span>
                    <span className="text-xl font-semibold">
                      {worker.hoursThisWeek}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-700 mb-1" />
                    <span className="text-sm text-gray-600">Payment Due</span>
                    <span className="text-xl font-semibold">
                      ${worker.pendingPayment.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={downloadWorkerData}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Download Complete History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendar and History */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  <TabsTrigger value="shifts">Shifts History</TabsTrigger>
                  <TabsTrigger value="payments">Payments History</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border w-full"
                            modifiers={{
                              hasShift: (date) => hasShifts(date),
                            }}
                            modifiersClassNames={{
                              hasShift: "bg-green-100 font-bold text-green-800",
                            }}
                          />
                        </div>
                        <div className="md:w-1/2">
                          <h3 className="text-lg font-semibold mb-3">
                            {selectedDate
                              ? formatDate(selectedDate.toISOString())
                              : "Select a date"}
                          </h3>
                          {shiftsForSelectedDate.length > 0 ? (
                            <div className="space-y-3">
                              {shiftsForSelectedDate.map((shift) => (
                                <div
                                  key={shift.id}
                                  className="p-3 border rounded-md bg-green-50"
                                >
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">Hours:</span>
                                    <span>{shift.hours}</span>
                                  </div>
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">Rate:</span>
                                    <span>
                                      ${shift.hourly_rate.toFixed(2)}/hr
                                    </span>
                                  </div>
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">Total:</span>
                                    <span>
                                      ${shift.total_amount.toFixed(2)}
                                    </span>
                                  </div>
                                  {shift.notes && (
                                    <div className="mt-2 pt-2 border-t text-sm">
                                      <span className="font-medium">
                                        Notes:
                                      </span>
                                      <p className="text-gray-600">
                                        {shift.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 border rounded-md">
                              <Clock className="h-12 w-12 mb-2 text-gray-300" />
                              <p>No shifts recorded for this date</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shifts" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      {shifts.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Hours</th>
                                <th className="px-4 py-2 text-left">Rate</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {shifts.map((shift) => (
                                <tr key={shift.id} className="border-t">
                                  <td className="px-4 py-2">
                                    {formatDate(shift.shift_date)}
                                  </td>
                                  <td className="px-4 py-2">{shift.hours}</td>
                                  <td className="px-4 py-2">
                                    ${shift.hourly_rate.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2">
                                    ${shift.total_amount.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2">
                                    {shift.notes || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-green-50 font-medium">
                              <tr>
                                <td className="px-4 py-2">Total</td>
                                <td className="px-4 py-2">
                                  {shifts
                                    .reduce(
                                      (sum, shift) => sum + Number(shift.hours),
                                      0,
                                    )
                                    .toFixed(1)}
                                </td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2">
                                  $
                                  {shifts
                                    .reduce(
                                      (sum, shift) =>
                                        sum + Number(shift.total_amount),
                                      0,
                                    )
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 py-2"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mb-2 text-gray-300" />
                          <p>No shift records found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      {payments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((payment) => (
                                <tr key={payment.id} className="border-t">
                                  <td className="px-4 py-2">
                                    {formatDate(payment.payment_date)}
                                  </td>
                                  <td className="px-4 py-2">
                                    ${payment.amount.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2">
                                    {payment.notes || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-green-50 font-medium">
                              <tr>
                                <td className="px-4 py-2">Total</td>
                                <td className="px-4 py-2">
                                  $
                                  {payments
                                    .reduce(
                                      (sum, payment) =>
                                        sum + Number(payment.amount),
                                      0,
                                    )
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 py-2"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mb-2 text-gray-300" />
                          <p>No payment records found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
