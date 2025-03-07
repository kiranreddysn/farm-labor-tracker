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

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payment: {
    workerId: string;
    amount: number;
    date: string;
    notes: string;
  }) => void;
  worker?: Worker;
  workers: Worker[];
}

export function PaymentForm({
  open,
  onOpenChange,
  onSave,
  worker,
  workers,
}: PaymentFormProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Update selected worker when worker prop changes
  useEffect(() => {
    if (worker) {
      setSelectedWorkerId(worker.id);
      setAmount(worker.pendingPayment.toString());
    }
  }, [worker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      workerId: selectedWorkerId,
      amount: parseFloat(amount),
      date,
      notes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {worker
              ? `Record a payment made to ${worker.name}`
              : "Record a payment made to a farm worker."}
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
                  onChange={(e) => {
                    setSelectedWorkerId(e.target.value);
                    const selectedWorker = workers.find(
                      (w) => w.id === e.target.value,
                    );
                    if (selectedWorker) {
                      setAmount(selectedWorker.pendingPayment.toString());
                    }
                  }}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    Select a worker
                  </option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (${w.pendingPayment.toFixed(2)} due)
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
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
                placeholder="Optional payment notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
