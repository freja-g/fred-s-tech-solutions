import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { Target, Eye, Heart, Handshake, Users, Wrench, MessageSquare, Sparkles, Building2, TrendingUp } from "lucide-react";

const AUTO_SCROLL_INTERVAL = 6000;

type Value = { icon: React.ElementType; name: string; text: string };

type Slide = {
  icon: React.ElementType;
  tag: string;
  title: string;
  body?: string;
  points?: string[];
  values?: Value[];
};

const slides: Slide[] = [
  {
    icon: Building2,
    tag: "About Us",
    title: "Who We Are",
    body: "At GiCOFix Solutions, we bridge the gap between people and technology. We are a dedicated technology support and solutions company committed to making tech simple, accessible, and reliable for both individuals and businesses. By combining technical expertise with clear communication, we remove the complexity from technology so you can focus on what matters most.",
  },
  {
    icon: Target,
    tag: "Mission",
    title: "Our Mission",
    body: "To deliver accessible, practical, and honest technology support that empowers individuals and businesses to navigate the digital world with total confidence.",
  },
  {
    icon: Eye,
    tag: "Vision",
    title: "Our Vision",
    body: "To be the most trusted technology support and solutions partner—recognized for seamlessly connecting people with the right tools, reliable service, and an exceptional customer experience.",
  },
  {
    icon: Heart,
    tag: "Core Values · 1 of 2",
    title: "What Guides Us",
    values: [
      { icon: Handshake, name: "Trust", text: "Built on honesty, unwavering commitment, and long-lasting partnerships." },
      { icon: Users, name: "Customer-First", text: "Dedicated to understanding your unique needs and delivering positive, impactful outcomes." },
      { icon: Wrench, name: "Reliability", text: "Grounded in dependable service, consistency, and honoring our promises." },
    ],
  },
  {
    icon: Heart,
    tag: "Core Values · 2 of 2",
    title: "What Guides Us",
    values: [
      { icon: MessageSquare, name: "Transparency", text: "Driven by clear communication, openness, and keeping you informed every step of the way." },
      { icon: Sparkles, name: "Quality & Innovation", text: "Committed to high standards, continuous improvement, and delivering smarter solutions." },
    ],
  },
];

const About = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused) return;
    const interval = setInterval(() => api.scrollNext(), AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [api, paused]);

  return (
    <section id="about" className="section-padding">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-6 md:mb-8 gap-4"
        >
          <div>
            <p className="text-accent font-medium mb-2 text-xs md:text-sm uppercase tracking-wide flex items-center gap-2">
              <TrendingUp size={14} /> About
            </p>
            <h2 className="text-2xl md:text-4xl font-semibold">Who We Are</h2>
          </div>
        </motion.div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="max-w-3xl mx-auto"
        >
          <Carousel setApi={setApi} opts={{ align: "center", loop: true }} className="w-full">
            <CarouselContent className="-ml-4 items-stretch">
              {slides.map((s, i) => (
                <CarouselItem key={i} className="pl-4 basis-full h-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                  >
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col">
                      {/* Icon header — mirrors the image band of the What's Next cards */}
                      <div className="flex items-center justify-center h-28 bg-secondary/50 shrink-0">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/15 text-accent">
                          <s.icon size={30} />
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col items-center text-center">
                        <span className="self-center inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent px-2 py-1 rounded-full mb-3">
                          <Sparkles size={10} /> {s.tag}
                        </span>
                        <h3 className="font-semibold text-lg sm:text-xl mb-2">{s.title}</h3>

                        {s.body && (
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl flex-1 flex items-center">
                            {s.body}
                          </p>
                        )}

                        {s.values && (
                          <div className="mt-2 w-full flex-1 flex flex-col justify-center gap-3">
                            {s.values.map((v, vi) => (
                              <div key={vi} className="bg-secondary/60 rounded-lg p-4 flex items-start gap-3 text-left">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                                  <v.icon size={16} />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground mb-1">{v.name}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{v.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-accent" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
