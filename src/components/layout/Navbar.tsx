import { Link, useLocation } from "react-router-dom";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Users, BarChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasWritePermission } from "@/lib/permissions";

export function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = hasWritePermission(user);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-green-700 text-xl font-bold">
                Farm Labor Tracker
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                isActive("/")
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700",
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              Workers
            </Link>

            {isAdmin && (
              <Link
                to="/reports"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                  isActive("/reports")
                    ? "bg-green-100 text-green-800"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                )}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Reports
              </Link>
            )}

            <LogoutButton />
          </div>

          <div className="md:hidden flex items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
