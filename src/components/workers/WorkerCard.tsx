import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  DollarSign,
  Edit,
  UserPlus,
  Lock,
  User,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasWritePermission } from "@/lib/permissions";
import { useNavigate } from "react-router-dom";

export interface Worker {
  id: string;
  name: string;
  status: "active" | "inactive" | "on-leave";
  hoursThisWeek: number;
  pendingPayment: number;
  avatarUrl?: string;
}

interface WorkerCardProps {
  worker: Worker;
  onLogShift: (workerId: string) => void;
  onRecordPayment: (workerId: string) => void;
  onEditWorker: (workerId: string) => void;
  onViewHistory: (workerId: string) => void;
  onDeleteWorker?: (workerId: string) => void;
}

export function WorkerCard({
  worker,
  onLogShift,
  onRecordPayment,
  onEditWorker,
  onViewHistory,
  onDeleteWorker,
}: WorkerCardProps) {
  const navigate = useNavigate();
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
    <Card
      className="w-full bg-white border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/worker/${worker.id}`)}
    >
      <CardHeader
        className="pb-2 px-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar
              className="h-10 w-10 sm:h-12 sm:w-12 border border-gray-200"
              onClick={() => navigate(`/worker/${worker.id}`)}
            >
              <AvatarImage src={worker.avatarUrl} alt={worker.name} />
              <AvatarFallback className="bg-green-50 text-green-700">
                {worker.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">
                {worker.name}
              </h3>
              <Badge
                className={getStatusColor(worker.status)}
                variant="secondary"
              >
                {worker.status.replace("-", " ")}
              </Badge>
            </div>
          </div>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewHistory(worker.id)}
              title="View History"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditWorker(worker.id)}
              title={canWrite ? "Edit Worker" : "Only admin can edit workers"}
              disabled={!canWrite}
            >
              {canWrite ? (
                <Edit className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </Button>
            {onDeleteWorker && canWrite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteWorker(worker.id)}
                title="Delete Worker"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent
        className="pb-3 px-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium">
              {worker.hoursThisWeek} hrs this week
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium">
              ${worker.pendingPayment.toFixed(2)} due
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter
        className="flex gap-2 pt-0 px-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-700"
          onClick={() => onLogShift(worker.id)}
          disabled={!canWrite}
          title={!canWrite ? "Only admin can log shifts" : ""}
        >
          Log Shift
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-700"
          onClick={() => onRecordPayment(worker.id)}
          disabled={!canWrite}
          title={!canWrite ? "Only admin can record payments" : ""}
        >
          Record Payment
        </Button>
      </CardFooter>
    </Card>
  );
}
