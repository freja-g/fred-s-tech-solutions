import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  MessageSquareText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    shortTitle: "Book Consultation",
    title: "Book a consultation",
    description: "Submit your service request online in seconds. Choose doorstep, pick-up, drop-off, or remote assistance.",
    actionText: "Book a Service",
    actionLink: "/book",
    icon: CalendarCheck,
  },
  {
    step: "02",
    shortTitle: "Discuss Details",
    title: "Discuss technical details with a technician",
    description: "Connect directly with our expert team to review diagnostics, agree on scope, and confirm turnaround time.",
    actionText: "Chat with Support",
    actionLink: "/messages",
    icon: MessageSquareText,
  },
  {
    step: "03",
    shortTitle: "Receive Resolution",
    title: "Receive the resolution",
    description: "Your system or device is expertly repaired, thoroughly tested, and delivered back with complete peace of mind.",
    actionText: "Explore Services",
    actionLink: "/services",
    icon: CheckCircle2,
  },
];

const AUTO_ROTATE_INTERVAL = 3800;

const HowWeWork = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentStep(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Auto-play continuous loop animation
  useEffect(() => {
    if (!api || isPaused) return;
    const timer = setInterval(() => {
      api.scrollNext();
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [api, isPaused]);

  return (
    <section className="py-8 sm:py-12 bg-background relative overflow-hidden" aria-labelledby="how-we-work-heading">
      <div className="container max-w-4xl px-4">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-lg mx-auto mb-6 sm:mb-8 space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Easy 3-Step Process
          </div>
          <h2 id="how-we-work-heading" className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            How We Work
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Clear, transparent technical service from start to finish.
          </p>
        </motion.div>

        {/* Step Indicator Tabs Bar */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 flex-wrap">
          {STEPS.map((s, index) => {
            const isActive = currentStep === index;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md shadow-accent/20 scale-105"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-accent/40"
                )}
              >
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold", isActive ? "bg-accent-foreground/20 text-accent-foreground" : "bg-secondary text-muted-foreground")}>
                  {s.step}
                </span>
                <span className="hidden sm:inline">{s.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Carousel */}
        <div
          className="relative max-w-2xl mx-auto px-4 sm:px-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <Carousel setApi={setApi} opts={{ align: "center", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 sm:-ml-4">
              {STEPS.map((s, index) => {
                const Icon = s.icon;
                const isActive = currentStep === index;

                return (
                  <CarouselItem key={s.step} className="pl-2 sm:pl-4 basis-full">
                    <motion.div
                      initial={{ opacity: 0.8, scale: 0.98 }}
                      animate={{
                        opacity: isActive ? 1 : 0.8,
                        scale: isActive ? 1 : 0.98,
                      }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        "relative bg-card border rounded-2xl p-5 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[220px]",
                        isActive ? "border-accent/80 shadow-md shadow-accent/10" : "border-border/80"
                      )}
                    >
                      {/* Top Bar: Icon & Step Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-3 rounded-xl transition-all duration-300", isActive ? "bg-accent text-accent-foreground shadow-sm shadow-accent/20" : "bg-secondary text-muted-foreground")}>
                            <Icon size={24} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
                              Step {s.step} of 03
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                              {s.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                        {s.description}
                      </p>

                      {/* Footer: Progress Bar & Call to Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/60 gap-3">
                        {/* Step Progress Dots */}
                        <div className="flex items-center gap-1.5">
                          {STEPS.map((_, dotIdx) => (
                            <div
                              key={dotIdx}
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                currentStep === dotIdx ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>

                        <Link
                          to={s.actionLink}
                          className={cn(buttonVariants({ variant: "accent", size: "sm" }), "text-xs font-bold gap-1")}
                        >
                          {s.actionText}
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious className="hidden sm:flex -left-4 sm:-left-6 border-border hover:border-accent hover:text-accent" />
            <CarouselNext className="hidden sm:flex -right-4 sm:-right-6 border-border hover:border-accent hover:text-accent" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
