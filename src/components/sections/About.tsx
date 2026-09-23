import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { Target, Eye, Heart, Handshake, Users, Wrench, MessageSquare, Sparkles, CheckCircle2, Building2 } from "lucide-react";

const AUTO_SCROLL_INTERVAL = 6000;

type Slide = {
  icon: React.ElementType;
  tag: string;
  title: string;
  body?: string;
  bullets?: { icon: React.ElementType; text: string }[];
  values?: { icon: React.ElementType; name: string; items: string[] }[];
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
    tag: "Core Values",
    title: "Our Core Values",
    values: [
      { icon: Handshake, name: "Trust", items: ["Built on honesty, unwavering commitment, and long-lasting partnerships."] },
      { icon: Users, name: "Customer-First", items: ["Dedicated to understanding your unique needs and delivering positive, impactful outcomes."] },
      { icon: Wrench, name: "Reliability", items: ["Grounded in dependable service, consistency, and honoring our promises."] },
      { icon: MessageSquare, name: "Transparency", items: ["Driven by clear communication, openness, and keeping you informed every step of the way."] },
      { icon: Sparkles, name: "Quality & Innovation", items: ["Committed to high standards, continuous improvement, and delivering smarter solutions."] },
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
          className="text-center max-w-2xl mx-auto mb-8 md:mb-10"
        >
          <p className="text-accent font-medium mb-2 text-xs md:text-sm uppercase tracking-wide">About</p>
          <h2 className="text-2xl md:text-4xl font-semibold mb-3">Who We Are</h2>
        </motion.div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="max-w-3xl mx-auto"
        >
          <Carousel setApi={setApi} opts={{ align: "center", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {slides.map((s, i) => (
                <CarouselItem key={i} className="pl-4 basis-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className=""
                  >
                    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card flex flex-col items-center text-center">
                      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-accent/15 text-accent mb-4">
                        <s.icon size={26} />
                      </div>
                      <span className="inline-flex text-[11px] font-semibold uppercase tracking-wider bg-accent/15 text-accent px-3 py-1 rounded-full mb-3">
                        {s.tag}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3">{s.title}</h3>
                      {s.body && (
                        <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed max-w-xl mb-1">
                          {s.body}
                        </p>
                      )}
                      {s.bullets && (
                        <ul className="mt-4 space-y-3 w-full max-w-md text-left">
                          {s.bullets.map((b, bi) => (
                            <li key={bi} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-accent">
                                <b.icon size={16} />
                              </span>
                              <span className="text-sm text-muted-foreground leading-snug">{b.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.values && (
                        <div className="mt-4 w-full max-w-lg text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {s.values.map((v, vi) => (
                            <div key={vi} className="bg-secondary/60 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                                  <v.icon size={16} />
                                </span>
                                <span className="text-sm font-semibold text-foreground">{v.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-snug pl-10">
                                {v.items[0]}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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
