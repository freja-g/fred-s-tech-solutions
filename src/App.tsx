import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import MessagesPage from "./pages/MessagesPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import ReviewsPage from "./pages/ReviewsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import GetSmartPage from "./pages/GetSmartPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/layout/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="pb-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/admin/messages" element={<AdminMessagesPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/get-smart" element={<GetSmartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <BottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
