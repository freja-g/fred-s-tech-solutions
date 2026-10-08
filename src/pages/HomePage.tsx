import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import ReviewsCarousel from "@/components/sections/ReviewsCarousel";
import StaffDashboard from "@/components/admin/StaffDashboard";
import HomeServices from "@/components/sections/HomeServices";
import HowWeWork from "@/components/sections/HowWeWork";
import { LatestConsultationSection } from "@/components/sections/LatestConsultationSection";
import { useAuth } from "@/hooks/useAuth";

const HomePage = () => {
  const { isAdmin, isTechnician, loading } = useAuth();
  const isStaff = isAdmin || isTechnician;

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32">
        {isStaff ? (
          <div className="px-4 py-6">
            <StaffDashboard />
          </div>
        ) : (
          <>
            <Hero />
            <LatestConsultationSection />
            <HowWeWork />
            <HomeServices />
            <ReviewsCarousel />
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
