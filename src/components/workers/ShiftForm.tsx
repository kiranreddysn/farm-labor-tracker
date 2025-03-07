import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Worker } from "./WorkerCard";

interface ShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (shift: {
    workerId: string;
    hours: number;
    hourlyRate: number;
    totalAmount: number;
    date: string;
    notes: string;
  }) => void;
  worker?: Worker;
  workers: Worker[];
}

export function ShiftForm({
  open,
  onOpenChange,
  onSave,
  worker,
  workers,
}: ShiftFormProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [hours, setHours] = useState("0");
  const [hourlyRate, setHourlyRate] = useState("15.00");
  const [totalAmount, setTotalAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Update selected worker when worker prop changes
  useEffect(() => {
    if (worker) {
      setSelectedWorkerId(worker.id);
    }
  }, [worker]);

  // Calculate total amount when hours or hourly rate changes
  useEffect(() => {
    const calculatedTotal = parseFloat(hours) * parseFloat(hourlyRate || "0");
    setTotalAmount(isNaN(calculatedTotal) ? 0 : calculatedTotal);
  }, [hours, hourlyRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      workerId: selectedWorkerId,
      hours: parseFloat(hours),
      hourlyRate: parseFloat(hourlyRate),
      totalAmount,
      date,
      notes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Shift</DialogTitle>
          <DialogDescription>
            {worker
              ? `Record hours worked for ${worker.name}`
              : "Record hours worked for a farm worker."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!worker && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="worker" className="text-right">
                  Worker
                </Label>
                <select
                  id="worker"
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    Select a worker
                  </option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {w.status}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">
                Hours
              </Label>
              <Input
                id="hours"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="col-span-3"
                min="0"
                step="0.5"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Hourly Rate ($)
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalAmount" className="text-right">
                Total Amount
              </Label>
              <div className="col-span-3 flex h-10 items-center px-3 border rounded-md bg-muted/50">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Optional notes about this shift"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Save Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
