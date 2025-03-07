import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllShifts, fetchAllPayments } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReportsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const shiftsData = await fetchAllShifts();
        const paymentsData = await fetchAllPayments();

        setShifts(shiftsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

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
      Worker: shift.workers?.name || "Unknown",
      Date: formatDate(shift.shift_date),
      Hours: shift.hours,
      "Hourly Rate": `$${shift.hourly_rate.toFixed(2)}`,
      "Total Amount": `$${shift.total_amount.toFixed(2)}`,
      Notes: shift.notes || "",
    }));

    downloadCSV(
      formattedShifts,
      `farm_shifts_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
  };

  const downloadPaymentsReport = () => {
    // Format data for CSV
    const formattedPayments = payments.map((payment) => ({
      Worker: payment.workers?.name || "Unknown",
      Date: formatDate(payment.payment_date),
      Amount: `$${payment.amount.toFixed(2)}`,
      Notes: payment.notes || "",
    }));

    downloadCSV(
      formattedPayments,
      `farm_payments_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
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

          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
            Reports & Analytics
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Farm Labor Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="shifts" className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="shifts">All Shifts</TabsTrigger>
                      <TabsTrigger value="payments">All Payments</TabsTrigger>
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
                      <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full">
                          <thead className="bg-green-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left">Worker</th>
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
                                  {shift.workers?.name || "Unknown"}
                                </td>
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
                          <tfoot className="bg-green-50 font-medium sticky bottom-0">
                            <tr>
                              <td className="px-4 py-2" colSpan={2}>
                                Total
                              </td>
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
                  </TabsContent>

                  <TabsContent value="payments" className="border rounded-md">
                    {payments.length > 0 ? (
                      <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full">
                          <thead className="bg-green-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left">Worker</th>
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                              <th className="px-4 py-2 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr key={payment.id} className="border-t">
                                <td className="px-4 py-2">
                                  {payment.workers?.name || "Unknown"}
                                </td>
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
                          <tfoot className="bg-green-50 font-medium sticky bottom-0">
                            <tr>
                              <td className="px-4 py-2" colSpan={2}>
                                Total
                              </td>
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
