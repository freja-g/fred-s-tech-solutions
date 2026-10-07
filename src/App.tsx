import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
// import { initPush } from "@/lib/push";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import BookingPage from "./pages/BookingPage";
import AuthPage from "./pages/AuthPage";
import MessagesPage from "./pages/MessagesPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import ReviewsPage from "./pages/ReviewsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminContentPage from "./pages/AdminContentPage";
import AdminConsultationsPage from "./pages/AdminConsultationsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import GetSmartPage from "./pages/GetSmartPage";
import ProfilePage from "./pages/ProfilePage";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/layout/BottomNav";
import logoWatermark from "./assets/gicofix-fullmark-transparent.png";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // initPush();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="relative min-h-[100dvh] overflow-x-hidden bg-background pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
              <img
                src={logoWatermark}
                alt=""
                width={1209}
                height={639}
                className="w-[min(92vw,64rem)] max-w-none object-contain opacity-[0.035] dark:opacity-[0.055]"
              />
            </div>
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/admin/messages" element={<AdminMessagesPage />} />
                <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                <Route path="/admin/content" element={<AdminContentPage />} />
                <Route path="/admin/consultations" element={<AdminConsultationsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/get-smart" element={<GetSmartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/consultations" element={<AdminConsultationsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
          <BottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
