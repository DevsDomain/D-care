// DashboardRouter.tsx

import FamilyDashboard from "@/pages/FamilyDashboard";
import { Navigate } from "react-router-dom";
import CaregiverDashboard from "./caregiver/CaregiverDashboard";
import { useAppStore } from "@/lib/stores/appStore";

export default function DashboardRouter() {
  const role = useAppStore((state) => state.userRole);
  console.log("ROLE ENCONTRADO",role)

  if (role === "FAMILY") return <FamilyDashboard />;
  if (role === "CAREGIVER") return <CaregiverDashboard />;

  // Fallback: no role or invalid role → redirect
  return <Navigate to="/login" replace />;
}
