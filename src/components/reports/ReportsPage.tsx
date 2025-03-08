import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllShifts, fetchAllPayments, fetchWorkers } from "@/lib/api";
import { formatDate } from "@/lib/date-utils";
import {
  Download,
  FileText,
  ArrowLeft,
  FileDown,
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Worker } from "@/components/workers/WorkerCard";

export default function ReportsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [shiftsData, paymentsData, workersData] = await Promise.all([
          fetchAllShifts(),
          fetchAllPayments(),
          fetchWorkers(),
        ]);

        setShifts(shiftsData);
        setFilteredShifts(shiftsData);
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
        setWorkers(workersData);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  // Apply filters when filter criteria change
  useEffect(() => {
    // Filter shifts
    let filteredShiftsResult = [...shifts];
    let filteredPaymentsResult = [...payments];

    // Apply worker filter
    if (workerFilter !== "all") {
      filteredShiftsResult = filteredShiftsResult.filter(
        (shift) => shift.worker_id === workerFilter,
      );
      filteredPaymentsResult = filteredPaymentsResult.filter(
        (payment) => payment.worker_id === workerFilter,
      );
    }

    // Apply search filter (search in worker name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredShiftsResult = filteredShiftsResult.filter((shift) =>
        shift.workers?.name?.toLowerCase().includes(searchLower),
      );
      filteredPaymentsResult = filteredPaymentsResult.filter((payment) =>
        payment.workers?.name?.toLowerCase().includes(searchLower),
      );
    }

    // Apply date range filter
    if (dateRangeFilter.startDate) {
      filteredShiftsResult = filteredShiftsResult.filter(
        (shift) => shift.shift_date >= dateRangeFilter.startDate,
      );
      filteredPaymentsResult = filteredPaymentsResult.filter(
        (payment) => payment.payment_date >= dateRangeFilter.startDate,
      );
    }

    if (dateRangeFilter.endDate) {
      filteredShiftsResult = filteredShiftsResult.filter(
        (shift) => shift.shift_date <= dateRangeFilter.endDate,
      );
      filteredPaymentsResult = filteredPaymentsResult.filter(
        (payment) => payment.payment_date <= dateRangeFilter.endDate,
      );
    }

    setFilteredShifts(filteredShiftsResult);
    setFilteredPayments(filteredPaymentsResult);
  }, [shifts, payments, searchTerm, workerFilter, dateRangeFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setWorkerFilter("all");
    setDateRangeFilter({ startDate: "", endDate: "" });
  };

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

  const downloadPDF = (data: any[], title: string, filename: string) => {
    if (!data.length) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    // Get headers and prepare data for autotable
    const headers = Object.keys(data[0]);
    const tableData = data.map((row) => headers.map((header) => row[header]));

    // Create table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 35,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255] },
    });

    // Save PDF
    doc.save(filename);
  };

  const downloadShiftsReport = () => {
    // Format data for CSV - use filtered shifts
    const formattedShifts = filteredShifts.map((shift) => ({
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
    // Format data for CSV - use filtered payments
    const formattedPayments = filteredPayments.map((payment) => ({
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
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <TabsList>
                        <TabsTrigger value="shifts">All Shifts</TabsTrigger>
                        <TabsTrigger value="payments">All Payments</TabsTrigger>
                      </TabsList>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="flex items-center gap-1"
                        >
                          <Filter className="h-4 w-4" />
                          {showFilters ? "Hide Filters" : "Show Filters"}
                        </Button>
                        <TabsContent value="shifts" className="mt-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={filteredShifts.length === 0}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" />
                                Download Report
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={downloadShiftsReport}>
                                <FileDown className="h-4 w-4 mr-2" />
                                CSV Format
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const formattedShifts = filteredShifts.map(
                                    (shift) => ({
                                      Worker: shift.workers?.name || "Unknown",
                                      Date: formatDate(shift.shift_date),
                                      Hours: shift.hours,
                                      "Hourly Rate": `$${shift.hourly_rate.toFixed(2)}`,
                                      "Total Amount": `$${shift.total_amount.toFixed(2)}`,
                                      Notes: shift.notes || "",
                                    }),
                                  );
                                  downloadPDF(
                                    formattedShifts,
                                    "Farm Labor Shifts Report",
                                    `farm_shifts_report_${new Date().toISOString().split("T")[0]}.pdf`,
                                  );
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                PDF Format
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TabsContent>
                        <TabsContent value="payments" className="mt-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={filteredPayments.length === 0}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" />
                                Download Report
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={downloadPaymentsReport}
                              >
                                <FileDown className="h-4 w-4 mr-2" />
                                CSV Format
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const formattedPayments =
                                    filteredPayments.map((payment) => ({
                                      Worker:
                                        payment.workers?.name || "Unknown",
                                      Date: formatDate(payment.payment_date),
                                      Amount: `$${payment.amount.toFixed(2)}`,
                                      Notes: payment.notes || "",
                                    }));
                                  downloadPDF(
                                    formattedPayments,
                                    "Farm Labor Payments Report",
                                    `farm_payments_report_${new Date().toISOString().split("T")[0]}.pdf`,
                                  );
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                PDF Format
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TabsContent>
                      </div>
                    </div>

                    {showFilters && (
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <h3 className="text-sm font-medium mb-3">
                          Filter Reports
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label
                              htmlFor="search"
                              className="text-xs mb-1 block"
                            >
                              Search by Worker Name
                            </Label>
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor="worker"
                              className="text-xs mb-1 block"
                            >
                              Filter by Worker
                            </Label>
                            <Select
                              value={workerFilter}
                              onValueChange={setWorkerFilter}
                            >
                              <SelectTrigger id="worker">
                                <SelectValue placeholder="All Workers" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Workers</SelectItem>
                                {workers.map((worker) => (
                                  <SelectItem key={worker.id} value={worker.id}>
                                    {worker.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label
                                htmlFor="startDate"
                                className="text-xs mb-1 block"
                              >
                                Start Date
                              </Label>
                              <div className="relative">
                                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  id="startDate"
                                  type="date"
                                  value={dateRangeFilter.startDate}
                                  onChange={(e) =>
                                    setDateRangeFilter((prev) => ({
                                      ...prev,
                                      startDate: e.target.value,
                                    }))
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </div>
                            <div>
                              <Label
                                htmlFor="endDate"
                                className="text-xs mb-1 block"
                              >
                                End Date
                              </Label>
                              <div className="relative">
                                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  id="endDate"
                                  type="date"
                                  value={dateRangeFilter.endDate}
                                  onChange={(e) =>
                                    setDateRangeFilter((prev) => ({
                                      ...prev,
                                      endDate: e.target.value,
                                    }))
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="text-sm"
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <TabsContent value="shifts" className="border rounded-md">
                    {filteredShifts.length > 0 ? (
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
                            {filteredShifts.map((shift) => (
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
                                {filteredShifts
                                  .reduce(
                                    (sum, shift) => sum + Number(shift.hours),
                                    0,
                                  )
                                  .toFixed(1)}
                              </td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2">
                                $
                                {filteredShifts
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
                    {filteredPayments.length > 0 ? (
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
                            {filteredPayments.map((payment) => (
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
                                {filteredPayments
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
