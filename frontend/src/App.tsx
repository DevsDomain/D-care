import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/common/BottomNavigation";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
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
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;