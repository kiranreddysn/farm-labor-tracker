import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function LogoutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-1"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
