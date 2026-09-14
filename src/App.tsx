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
import backgroundAsset from "./assets/gicofix-3d-background.jpg.asset.json";

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
          <div className="relative min-h-[100dvh] overflow-x-hidden pb-20">
            <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
              <img
                src={backgroundAsset.url}
                alt=""
                width={1920}
                height={1080}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-background/88 dark:bg-background/76" />
            </div>
            <div className="relative z-10 [&_section]:!bg-transparent">
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
                <Route path="/consultations" element={<AdminConsultationsPage />} />
                <Route path="/get-smart" element={<GetSmartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/legal" element={<LegalPage />} />
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
