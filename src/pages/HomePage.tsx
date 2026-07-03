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
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {isStaff ? (
          <StaffDashboard />
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
