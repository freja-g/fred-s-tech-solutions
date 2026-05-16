import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import projectCloud from "@/assets/project-cloud.jpg";
import projectAutomation from "@/assets/project-automation.jpg";
import projectNetwork from "@/assets/project-network.jpg";
import projectItsupport from "@/assets/project-itsupport.jpg";
import projectConsulting from "@/assets/project-consulting.jpg";

const trends = [
  { tag: "Coming Soon", title: "AI-Powered Helpdesk", desc: "24/7 automated triage that routes urgent tickets to a human in under 2 minutes.", image: projectAutomation },
  { tag: "Trending", title: "Zero-Trust Networking", desc: "Modern security for small business — verify every device, every time.", image: projectNetwork },
  { tag: "New", title: "Cloud-First Migrations", desc: "Move from on-premise servers to scalable cloud in under 30 days.", image: projectCloud },
  { tag: "Feature", title: "Remote IT Support", desc: "Fix most issues without anyone visiting your office. Fast and affordable.", image: projectItsupport },
  { tag: "Trending", title: "Process Automation", desc: "Replace repetitive admin work with smart workflows that pay for themselves.", image: projectConsulting },
];

const TrendsCarousel = () => (
  <section className="section-padding bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-8 gap-4"
      >
        <div>
          <p className="text-accent font-medium mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
            <TrendingUp size={14} /> What's Next
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold">Upcoming Trends & Features</h2>
        </div>
      </motion.div>

      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {trends.map((t, i) => (
            <CarouselItem key={i} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col">
                <img src={t.image} alt={t.title} loading="lazy" className="w-full h-44 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <span className="self-start inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent px-2 py-1 rounded-full mb-3">
                    <Sparkles size={10} /> {t.tag}
                  </span>
                  <h3 className="font-semibold text-lg mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{t.desc}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  </section>
);

export default TrendsCarousel;
