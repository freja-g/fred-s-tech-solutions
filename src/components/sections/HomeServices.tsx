import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import consultingImage from "@/assets/project-consulting.jpg";
import supportImage from "@/assets/project-itsupport.jpg";
import networkImage from "@/assets/project-network.jpg";
import cloudImage from "@/assets/project-cloud.jpg";
import automationImage from "@/assets/project-automation.jpg";
import posImage from "@/assets/project-pos.jpg";

const supabase = supabaseClient as any;
const fallbackMedia = [consultingImage, supportImage, networkImage, cloudImage, automationImage, posImage];

const defaultServices = [
  { id: "default-1", title: "Technical Consulting", description: "Guidance on technology decisions" },
  { id: "default-2", title: "IT Support & Troubleshooting", description: "Diagnose and fix issues fast" },
  { id: "default-3", title: "Data & Software Support", description: "Keep your software running" },
  { id: "default-4", title: "Network Setup & Security", description: "Network design, audits, backup" },
  { id: "default-5", title: "Cloud Migration & Management", description: "Readiness, migration, cost strategy" },
  { id: "default-6", title: "Business Process Automation", description: "Workflow design and integrations" },
];

type Service = { id: string; title: string; description: string; media_url?: string | null };
const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)(?:\?|#|$)/i.test(url);

const HomeServices = () => {
  const [services, setServices] = useState<Service[]>(defaultServices);

  useEffect(() => {
    let active = true;
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, title, description, media_url")
          .order("created_at", { ascending: false });

        if (active && !error && data?.length) {
          const customTitles = new Set(data.map((s: any) => s.title.toLowerCase()));
          const filteredDefaults = defaultServices.filter(d => !customTitles.has(d.title.toLowerCase()));
          setServices([...data, ...filteredDefaults]);
        }
      } catch (e) {
        console.warn("Failed to load services from DB, using defaults", e);
      }
    };
    loadServices();
    return () => { active = false; };
  }, []);

  return (
    <section className="py-6 sm:py-10" aria-labelledby="home-services-title">
      <div className="container max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-5 flex items-center justify-between gap-4"
        >
          <div>
            <h2 id="home-services-title" className="text-xl sm:text-2xl font-bold text-foreground">
              Our Services
            </h2>
          </div>
          <Link to="/services" className="text-xs sm:text-sm font-semibold text-accent hover:underline flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {services.slice(0, 3).map((service, index) => {
            const media = service.media_url || fallbackMedia[index % fallbackMedia.length];
            return (
              <article
                key={service.id}
                className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md w-full min-w-0"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-secondary shrink-0">
                  {isVideo(media) ? (
                    <video src={media} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={media} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-3 min-w-0">
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-snug mb-1 truncate">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                  <Link
                    to={`/book?service=${encodeURIComponent(service.title)}&service_id=${service.id}`}
                    className={cn(buttonVariants({ variant: "accent" }), "w-full justify-between text-xs sm:text-sm font-semibold h-10")}
                  >
                    Start
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeServices;
