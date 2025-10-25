// src/App.tsx
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { Toaster } from "@/components/ui/sonner";

// Pages
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Search from "./pages/search/Search";
import CaregiverProfile from "./pages/caregiver/CaregiverProfile";
import BookingForm from "./pages/booking/BookingForm";
import BookingList from "./pages/booking/BookingList";
import Guide from "./pages/guide/Guide";
import Profile from "./pages/profile/Profile";
import ElderRegistration from "./pages/elder/ElderRegistration";
import IvcfAssessment from "./pages/ivcf/IvcfAssessment";
import { PrivateRoute } from "./components/private-route";
import DashboardRouter from "./pages/DashboardRouter";
import CaregiverEdition from "./pages/caregiver/CaregiverEdition";
import ElderEditWizard from "@/pages/elder/ElderEditWizard";

const queryClient = new QueryClient();

// 🔹 Wrapper para esconder a BottomNav em certas rotas
function AppLayout() {
  const location = useLocation();

  // rotas onde NÃO queremos mostrar a barra
  const hideBottomNav = ["/login", "/register"];
  const shouldHide = hideBottomNav.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas abertas */}
        <Route path="/search" element={<Search />} />
        <Route path="/caregiver/:id" element={<CaregiverProfile />} />

        {/* Rotas FAMILY */}
        <Route
          path="/book/:caregiverId"
          element={
            <PrivateRoute roles={["FAMILY"]}>
              <BookingForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute roles={["FAMILY"]}>
              <BookingList />
            </PrivateRoute>
          }
        />
        <Route
          path="/elder/register"
          element={
            <PrivateRoute roles={["FAMILY"]}>
              <ElderRegistration />
            </PrivateRoute>
          }
        />
        <Route
          path="/elder/:elderId/edit"
          element={
            <PrivateRoute roles={["FAMILY"]}>
              <ElderEditWizard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ivcf/:elderId"
          element={
            <PrivateRoute roles={["FAMILY"]}>
              <IvcfAssessment />
            </PrivateRoute>
          }
        />

        {/* Dashboard raiz (decide por role) */}
        <Route path="/" element={<DashboardRouter />} />

        {/* Rotas CAREGIVER */}
        <Route
          path="/editCaregiver"
          element={
            <PrivateRoute roles={["CAREGIVER"]}>
              <CaregiverEdition />
            </PrivateRoute>
          }
        />

        {/* Perfil (ambos) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute roles={["FAMILY", "CAREGIVER"]}>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Guia (ambos) */}
        <Route
          path="/guide"
          element={
            <PrivateRoute roles={["FAMILY", "CAREGIVER"]}>
              <Guide />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* só renderiza se não for login/register */}
      {!shouldHide && <BottomNavigation />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
