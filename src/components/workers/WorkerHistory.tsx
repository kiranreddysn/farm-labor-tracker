import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Worker } from "./WorkerCard";
import { fetchWorkerShifts, fetchWorkerPayments } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { Download, FileText } from "lucide-react";

interface WorkerHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker?: Worker;
}

interface Shift {
  id: string;
  hours: number;
  hourly_rate: number;
  total_amount: number;
  shift_date: string;
  notes: string | null;
  created_at: string | null;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string | null;
}

export function WorkerHistory({
  open,
  onOpenChange,
  worker,
}: WorkerHistoryProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!worker || !open) return;

      setLoading(true);
      try {
        const shiftsData = await fetchWorkerShifts(worker.id);
        const paymentsData = await fetchWorkerPayments(worker.id);

        setShifts(shiftsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Failed to load worker history:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [worker, open]);

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    const csvRows = [];
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle strings with commas by wrapping in quotes
        return `"${value}"`;
      });
      csvRows.push(values.join(","));
    }

    // Create and download the file
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadShiftsReport = () => {
    // Format data for CSV
    const formattedShifts = shifts.map((shift) => ({
      Date: formatDate(shift.shift_date),
      Hours: shift.hours,
      "Hourly Rate": `$${shift.hourly_rate.toFixed(2)}`,
      "Total Amount": `$${shift.total_amount.toFixed(2)}`,
      Notes: shift.notes || "",
    }));

    downloadCSV(
      formattedShifts,
      `${worker?.name.replace(/ /g, "_")}_shifts_report.csv`,
    );
  };

  const downloadPaymentsReport = () => {
    // Format data for CSV
    const formattedPayments = payments.map((payment) => ({
      Date: formatDate(payment.payment_date),
      Amount: `$${payment.amount.toFixed(2)}`,
      Notes: payment.notes || "",
    }));

    downloadCSV(
      formattedPayments,
      `${worker?.name.replace(/ /g, "_")}_payments_report.csv`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{worker?.name} - Work History</DialogTitle>
          <DialogDescription>
            View shift and payment history for this worker.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : (
          <Tabs defaultValue="shifts" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="shifts">Shifts</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <TabsContent value="shifts" className="mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadShiftsReport}
                    disabled={shifts.length === 0}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </TabsContent>
                <TabsContent value="payments" className="mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPaymentsReport}
                    disabled={payments.length === 0}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </TabsContent>
              </div>
            </div>

            <TabsContent value="shifts" className="border rounded-md">
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
                          <td className="px-4 py-2">{shift.notes || "-"}</td>
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
                              (sum, shift) => sum + Number(shift.total_amount),
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
            </TabsContent>

            <TabsContent value="payments" className="border rounded-md">
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
                          <td className="px-4 py-2">{payment.notes || "-"}</td>
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
                              (sum, payment) => sum + Number(payment.amount),
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
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
