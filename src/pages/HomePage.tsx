import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import TrendsCarousel from "@/components/sections/TrendsCarousel";
import ReviewsCarousel from "@/components/sections/ReviewsCarousel";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TrendsCarousel />
        <About />
        <ReviewsCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
