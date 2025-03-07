import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, MoreVertical, Lock, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasWritePermission } from "@/lib/permissions";
import { Link } from "react-router-dom";
import { Worker } from "./WorkerCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkerTableProps {
  workers: Worker[];
  onLogShift: (workerId: string) => void;
  onRecordPayment: (workerId: string) => void;
  onEditWorker: (workerId: string) => void;
  onViewHistory: (workerId: string) => void;
  onSortColumn: (column: string) => void;
}

export function WorkerTable({
  workers,
  onLogShift,
  onRecordPayment,
  onEditWorker,
  onViewHistory,
  onSortColumn,
}: WorkerTableProps) {
  const { user } = useAuth();
  const canWrite = hasWritePermission(user);
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
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader className="bg-green-50">
          <TableRow>
            <TableHead
              className="w-[250px] cursor-pointer"
              onClick={() => onSortColumn("name")}
            >
              Name
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSortColumn("status")}
            >
              Status
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSortColumn("hoursThisWeek")}
            >
              Hours This Week
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSortColumn("pendingPayment")}
            >
              Payment Due
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/worker/${worker.id}`}
                  className="text-green-700 hover:underline flex items-center gap-1"
                >
                  {worker.name}
                  <User className="h-3 w-3" />
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  className={getStatusColor(worker.status)}
                  variant="secondary"
                >
                  {worker.status.replace("-", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-700" />
                  <span>{worker.hoursThisWeek} hrs</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-700" />
                  <span>${worker.pendingPayment.toFixed(2)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onLogShift(worker.id)}
                      disabled={!canWrite}
                    >
                      {!canWrite && <Lock className="h-3 w-3 mr-1" />}
                      Log Shift
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRecordPayment(worker.id)}
                      disabled={!canWrite}
                    >
                      {!canWrite && <Lock className="h-3 w-3 mr-1" />}
                      Record Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewHistory(worker.id)}>
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/worker/${worker.id}`}>View Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEditWorker(worker.id)}
                      disabled={!canWrite}
                    >
                      {!canWrite && <Lock className="h-3 w-3 mr-1" />}
                      Edit Worker
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
