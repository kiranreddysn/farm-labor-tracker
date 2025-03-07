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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Worker } from "./WorkerCard";

interface WorkerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    worker: Omit<Worker, "id" | "hoursThisWeek" | "pendingPayment">,
  ) => void;
  worker?: Worker;
  title?: string;
}

export function WorkerForm({
  open,
  onOpenChange,
  onSave,
  worker,
  title = "Add New Worker",
}: WorkerFormProps) {
  // Initialize form with worker data when available
  useEffect(() => {
    if (worker) {
      setName(worker.name);
      setStatus(worker.status);
      setAvatarUrl(worker.avatarUrl || "");
    }
  }, [worker]);

  const [name, setName] = useState(worker?.name || "");
  const [status, setStatus] = useState<"active" | "inactive" | "on-leave">(
    worker?.status || "active",
  );
  const [avatarUrl, setAvatarUrl] = useState(worker?.avatarUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      status,
      avatarUrl: avatarUrl || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the worker's information below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value: "active" | "inactive" | "on-leave") =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="col-span-3" id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Save Worker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
