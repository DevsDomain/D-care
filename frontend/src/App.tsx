import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Pages
import Index from "./pages/Index";
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
import CaregiverDashboard from "./pages/caregiver/CaregiverDashboard";

const queryClient = new QueryClient();

// 🔹 Criamos um wrapper para esconder a BottomNav em certas rotas
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

        {/* Main app routes */}
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Search />} />
        <Route path="/caregiver/:id" element={<CaregiverProfile />} />
        <Route path="/book/:caregiverId" element={<BookingForm />} />
        <Route path="/bookings" element={<BookingList />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/elder/register" element={<ElderRegistration />} />
        <Route path="/ivcf/:elderId" element={<IvcfAssessment />} />
        <Route path="/caregiver-dashboard" element={<CaregiverDashboard />} />

        {/* Catch-all route */}
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
