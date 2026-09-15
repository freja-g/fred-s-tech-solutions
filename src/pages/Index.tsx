import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";

import Skills from "@/components/sections/Skills";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <Hero />
        <About />
        <Services />
        <Skills />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
