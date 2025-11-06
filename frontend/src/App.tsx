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
import ElderEdit from "./pages/elder/ElderEdit"; // ✅ edição do idoso

const queryClient = new QueryClient();

// Wrapper que controla onde esconder a BottomNavigation
function AppLayout() {
  const location = useLocation();

  // Rotas sem bottom nav (ajuste se quiser esconder também em outras telas)
  const hideBottomNav = ["/login", "/register"];
  const shouldHide = hideBottomNav.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Abertas */}
        <Route path="/search" element={<Search />} />
        <Route path="/caregiver/:id" element={<CaregiverProfile />} />

        {/* Raiz resolve para o dashboard (Family ou Caregiver) */}
        <Route path="/" element={<DashboardRouter />} />

        {/* FAMILY */}
        <Route
          path="/book/:caregiverId/:caregiverPrice"
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
          path="/elders/:id/edit" // ✅ nova rota de edição
          element={
            <PrivateRoute roles={["FAMILY"]}>
              <ElderEdit />
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

        {/* CAREGIVER */}
        {/* Rotas CAREGIVER */}
        <Route path="/" element={<DashboardRouter />} />

        {/* Perfil (ambos podem acessar) */}
        <Route
          path="/editCaregiver"
          element={
            <PrivateRoute roles={["CAREGIVER"]}>
              <CaregiverEdition />
            </PrivateRoute>
          }
        />

        {/* Ambos */}
        <Route
          path="/profile"
          element={
            <PrivateRoute roles={["FAMILY", "CAREGIVER"]}>
              <Profile />
            </PrivateRoute>
          }
        />
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
