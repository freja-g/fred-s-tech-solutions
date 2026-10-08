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
import { ThemeProvider } from "next-themes";
import BottomNav from "./components/layout/BottomNav";
import logoWatermark from "./assets/gicofix-fullmark-transparent.png";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // initPush();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <div className="relative min-h-[100dvh] overflow-x-clip bg-background pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                  <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-accent/20 dark:bg-accent/30 blur-3xl" />
                  <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-primary/20 dark:bg-primary/35 blur-3xl" />
                  <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-sky-500/15 dark:bg-accent/25 blur-3xl" />
                  <div className="fixed inset-0 flex items-center justify-center">
                    <img
                      src={logoWatermark}
                      alt=""
                      width={1209}
                      height={639}
                      className="w-[min(92vw,64rem)] max-w-none object-contain opacity-[0.80] dark:opacity-[0.90]"
                    />
                  </div>
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
    </ThemeProvider>
  );
};

export default App;
