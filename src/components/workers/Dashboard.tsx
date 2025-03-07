import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkerCard, Worker } from "./WorkerCard";
import { WorkerTable } from "./WorkerTable";
import { WorkerForm } from "./WorkerForm";
import { ShiftForm } from "./ShiftForm";
import { PaymentForm } from "./PaymentForm";
import { WorkerHistory } from "./WorkerHistory";
import { ReportsDialog } from "./ReportsDialog";
import {
  Clock,
  DollarSign,
  Download,
  Filter,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  fetchWorkers,
  createWorker,
  updateWorker,
  createShift,
  createPayment,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasWritePermission } from "@/lib/permissions";
import { Link } from "react-router-dom";

// Sample data for demonstration
const MOCK_WORKERS: Worker[] = [
  {
    id: "1",
    name: "John Doe",
    status: "active",
    hoursThisWeek: 32,
    pendingPayment: 480,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  {
    id: "2",
    name: "Jane Smith",
    status: "active",
    hoursThisWeek: 28,
    pendingPayment: 420,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
  },
  {
    id: "3",
    name: "Robert Johnson",
    status: "on-leave",
    hoursThisWeek: 12,
    pendingPayment: 180,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
  },
  {
    id: "4",
    name: "Maria Garcia",
    status: "inactive",
    hoursThisWeek: 0,
    pendingPayment: 150,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
  },
  {
    id: "5",
    name: "David Wilson",
    status: "active",
    hoursThisWeek: 40,
    pendingPayment: 600,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
  },
  {
    id: "6",
    name: "Sarah Brown",
    status: "active",
    hoursThisWeek: 35,
    pendingPayment: 525,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  },
];

export function Dashboard() {
  const { user } = useAuth();
  const canWrite = hasWritePermission(user);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modal states
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [editWorkerOpen, setEditWorkerOpen] = useState(false);
  const [logShiftOpen, setLogShiftOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(
    undefined,
  );

  // Load workers from database
  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkers();
      setWorkers(data);
    } catch (error) {
      console.error("Failed to load workers:", error);
      toast({
        title: "Error",
        description: "Failed to load workers. Please try again.",
        variant: "destructive",
      });
      // Fall back to mock data if database fails
      setWorkers(MOCK_WORKERS);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // Filter and sort workers
  const filterAndSortWorkers = () => {
    let result = [...workers];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((worker) => worker.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "hoursThisWeek":
          comparison = a.hoursThisWeek - b.hoursThisWeek;
          break;
        case "pendingPayment":
          comparison = a.pendingPayment - b.pendingPayment;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredWorkers(result);
  };

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    filterAndSortWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workers, searchTerm, statusFilter, sortColumn, sortDirection]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle column sort
  const handleSortColumn = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle adding a new worker
  const handleAddWorker = async (
    workerData: Omit<Worker, "id" | "hoursThisWeek" | "pendingPayment">,
  ) => {
    try {
      const newWorker = await createWorker(workerData);
      if (newWorker) {
        setWorkers([...workers, newWorker]);
        toast({
          title: "Success",
          description: `Worker ${workerData.name} has been added.`,
        });
      }
    } catch (error) {
      console.error("Failed to add worker:", error);
      toast({
        title: "Error",
        description: "Failed to add worker. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle editing a worker
  const handleEditWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    setSelectedWorker(worker);
    setEditWorkerOpen(true);
  };

  // Handle saving edited worker
  const handleSaveEditedWorker = async (
    workerData: Omit<Worker, "id" | "hoursThisWeek" | "pendingPayment">,
  ) => {
    if (!selectedWorker) return;

    try {
      const success = await updateWorker(selectedWorker.id, workerData);
      if (success) {
        const updatedWorkers = workers.map((worker) => {
          if (worker.id === selectedWorker.id) {
            return {
              ...worker,
              name: workerData.name,
              status: workerData.status,
              avatarUrl: workerData.avatarUrl,
            };
          }
          return worker;
        });

        setWorkers(updatedWorkers);
        toast({
          title: "Success",
          description: `Worker ${workerData.name} has been updated.`,
        });
      }
    } catch (error) {
      console.error("Failed to update worker:", error);
      toast({
        title: "Error",
        description: "Failed to update worker. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle logging a shift
  const handleLogShift = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    setSelectedWorker(worker);
    setLogShiftOpen(true);

    // Log which worker we're adding a shift for
    if (worker) {
      console.log(`Logging shift for: ${worker.name}`);
      toast({
        title: "Logging Shift",
        description: `Recording hours for ${worker.name}`,
      });
    }
  };

  // Handle saving a shift
  const handleSaveShift = async (shiftData: {
    workerId: string;
    hours: number;
    hourlyRate: number;
    totalAmount: number;
    date: string;
    notes: string;
  }) => {
    try {
      const success = await createShift(shiftData);
      if (success) {
        // Refresh workers to get updated stats
        await loadWorkers();

        toast({
          title: "Success",
          description: `Shift logged successfully. Total: $${shiftData.totalAmount.toFixed(2)}`,
        });
      }
    } catch (error) {
      console.error("Failed to log shift:", error);
      toast({
        title: "Error",
        description: "Failed to log shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle recording a payment
  const handleRecordPayment = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    setSelectedWorker(worker);
    setRecordPaymentOpen(true);

    // Log which worker we're recording payment for
    if (worker) {
      console.log(`Recording payment for: ${worker.name}`);
      toast({
        title: "Recording Payment",
        description: `Recording payment for ${worker.name}`,
      });
    }
  };

  // Handle viewing worker history
  const handleViewHistory = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    setSelectedWorker(worker);
    setHistoryOpen(true);
  };

  // Handle saving a payment
  const handleSavePayment = async (paymentData: {
    workerId: string;
    amount: number;
    date: string;
    notes: string;
  }) => {
    try {
      const success = await createPayment(paymentData);
      if (success) {
        // Refresh workers to get updated stats
        await loadWorkers();

        toast({
          title: "Success",
          description: `Payment of $${paymentData.amount.toFixed(2)} recorded successfully.`,
        });
      }
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-6 max-w-7xl">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">
          Worker Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your farm workers, shifts, and payments
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
          <div className="w-40">
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setAddWorkerOpen(true)}
            className="bg-green-600 hover:bg-green-700"
            disabled={!canWrite}
            title={!canWrite ? "Only admin can add workers" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>

          <Button
            onClick={() => setLogShiftOpen(true)}
            variant="outline"
            className="border-green-200 hover:bg-green-50 hover:text-green-700"
            disabled={!canWrite}
            title={!canWrite ? "Only admin can log shifts" : ""}
          >
            <Clock className="h-4 w-4 mr-2" />
            Log Shift
          </Button>

          <Button
            onClick={() => setRecordPaymentOpen(true)}
            variant="outline"
            className="border-green-200 hover:bg-green-50 hover:text-green-700"
            disabled={!canWrite}
            title={!canWrite ? "Only admin can record payments" : ""}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>

          <Link to="/reports">
            <Button
              variant="outline"
              className="border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border shadow-sm p-6 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workers...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onLogShift={handleLogShift}
                    onRecordPayment={handleRecordPayment}
                    onEditWorker={handleEditWorker}
                    onViewHistory={handleViewHistory}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <WorkerTable
                workers={filteredWorkers}
                onLogShift={handleLogShift}
                onRecordPayment={handleRecordPayment}
                onEditWorker={handleEditWorker}
                onViewHistory={handleViewHistory}
                onSortColumn={handleSortColumn}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Forms/Modals */}
      <WorkerForm
        open={addWorkerOpen}
        onOpenChange={setAddWorkerOpen}
        onSave={handleAddWorker}
        title="Add New Worker"
      />

      <WorkerForm
        open={editWorkerOpen}
        onOpenChange={setEditWorkerOpen}
        onSave={handleSaveEditedWorker}
        worker={selectedWorker}
        title="Edit Worker"
      />

      <ShiftForm
        open={logShiftOpen}
        onOpenChange={(open) => {
          setLogShiftOpen(open);
          if (!open) setSelectedWorker(undefined);
        }}
        onSave={handleSaveShift}
        worker={selectedWorker}
        workers={workers}
      />

      <PaymentForm
        open={recordPaymentOpen}
        onOpenChange={(open) => {
          setRecordPaymentOpen(open);
          if (!open) setSelectedWorker(undefined);
        }}
        onSave={handleSavePayment}
        worker={selectedWorker}
        workers={workers}
      />

      <WorkerHistory
        open={historyOpen}
        onOpenChange={(open) => {
          setHistoryOpen(open);
          if (!open) setSelectedWorker(undefined);
        }}
        worker={selectedWorker}
      />

      <ReportsDialog open={reportsOpen} onOpenChange={setReportsOpen} />
    </div>
  );
}
