import { useToast } from "@/components/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/stores/appStore";

export function useLogout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const resetApp = useAppStore((state) => state.resetApp);

  const handleLogout = () => {
    // 1️⃣ Remove stored session data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    // 2️⃣ Reset Zustand state
    resetApp();

    // 3️⃣ Notify user
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });

    // 4️⃣ Redirect to login
    navigate("/login", { replace: true });
  };

  return handleLogout;
}
