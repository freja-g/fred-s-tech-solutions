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
    body: "GiCOFix Solutions is a technology support and solutions company.",
    bullets: [
      { icon: CheckCircle2, text: "Helping individuals and businesses solve technology challenges." },
      { icon: CheckCircle2, text: "Making technology support simple, accessible and reliable." },
      { icon: CheckCircle2, text: "Connecting customers with the right solutions and support." },
      { icon: CheckCircle2, text: "Building trust through clear communication and quality service." },
      { icon: CheckCircle2, text: "Creating a better and more convenient technology experience." },
    ],
  },
  {
    icon: Target,
    tag: "Mission",
    title: "Our Mission",
    bullets: [
      { icon: CheckCircle2, text: "Making technology support easy to access." },
      { icon: CheckCircle2, text: "Providing reliable and practical solutions." },
      { icon: CheckCircle2, text: "Connecting customers with the right support." },
      { icon: CheckCircle2, text: "Keeping customers informed throughout the process." },
      { icon: CheckCircle2, text: "Delivering quality service with honesty and professionalism." },
      { icon: CheckCircle2, text: "Helping people and businesses use technology with confidence." },
    ],
  },
  {
    icon: Eye,
    tag: "Vision",
    title: "Our Vision",
    bullets: [
      { icon: CheckCircle2, text: "To become the most trusted technology support and solutions company." },
      { icon: CheckCircle2, text: "To be a reliable partner for individuals and businesses." },
      { icon: CheckCircle2, text: "To make technology support simple and accessible." },
      { icon: CheckCircle2, text: "To create the best experience for everyone seeking technology solutions." },
    ],
  },
  {
    icon: Heart,
    tag: "Core Values",
    title: "Our Core Values",
    values: [
      { icon: Handshake, name: "Trust", items: ["Commitment", "Honesty", "Long-lasting relationships"] },
      { icon: Users, name: "Customer First", items: ["Understanding customer needs", "Putting customers first", "Creating a positive experience"] },
      { icon: Wrench, name: "Reliability", items: ["Dependable service", "Consistency", "Keeping our promises"] },
      { icon: MessageSquare, name: "Transparency", items: ["Clear communication", "Openness", "Keeping customers informed"] },
      { icon: Sparkles, name: "Quality & Innovation", items: ["High standards", "Continuous improvement", "Better and smarter solutions"] },
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
          <p className="text-sm md:text-base text-muted-foreground">
            A technology support and solutions company built on trust, reliability, and clear communication.
          </p>
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
                    className="h-full"
                  >
                    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card h-full flex flex-col items-center text-center min-h-[300px]">
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
                              <ul className="space-y-1 pl-10">
                                {v.items.map((item, ii) => (
                                  <li key={ii} className="text-xs text-muted-foreground leading-snug">{item}</li>
                                ))}
                              </ul>
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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "10+", label: "Years of Experience" },
            { value: "50+", label: "Clients Helped" },
            { value: "100%", label: "Practical Focus" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-secondary rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-3xl font-semibold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
