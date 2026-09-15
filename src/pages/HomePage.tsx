import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import TrendsCarousel from "@/components/sections/TrendsCarousel";
import ReviewsCarousel from "@/components/sections/ReviewsCarousel";
import StaffDashboard from "@/components/admin/StaffDashboard";
import { useAuth } from "@/hooks/useAuth";

const HomePage = () => {
  const { isAdmin, isTechnician, loading } = useAuth();
  const isStaff = isAdmin || isTechnician;

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 md:pt-20 pt-16">
        {isStaff ? (
          <div className="px-4 py-6">
            <StaffDashboard />
          </div>
        ) : (
          <>
            <Hero />
            <TrendsCarousel />
            <About />
            <ReviewsCarousel />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
