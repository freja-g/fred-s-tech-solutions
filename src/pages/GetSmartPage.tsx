import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

import { motion } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import tipRestart from "@/assets/tip-restart.jpg";
import tipWifi from "@/assets/tip-wifi.jpg";
import tipSlow from "@/assets/tip-slow.jpg";
import tipPrinter from "@/assets/tip-printer.jpg";

const isVideo = (url?: string | null) => url ? /\.(mp4|webm|mov|m4v)(?:\?|#|$)/i.test(url) : false;

const STATIC_GUIDES = [
  {
    image: tipRestart,
    title: "Computer not responding? Restart the smart way",
    summary: "Most freezes vanish after a proper restart.",
    body: "1. Save anything open (Ctrl + S on Windows, Cmd + S on Mac).\n2. Close apps one by one, starting with the heaviest.\n3. Click Start, Power, Restart (not just Shut Down).\n4. If frozen completely: hold the power button for 10 seconds, wait 30 seconds, power back on.",
  },
  {
    image: tipWifi,
    title: "WiFi is slow or keeps dropping",
    summary: "A 2-minute reset to try before calling your provider.",
    body: "1. Unplug your router from the wall socket.\n2. Wait a full 60 seconds (this clears router memory).\n3. Plug it back in and wait 2–3 minutes for all lights to settle.\n4. Reconnect your device. Still slow? Move closer to the router or restart your device.",
  },
  {
    image: tipPrinter,
    title: "Printer non-responsive or stuck in queue",
    summary: "Quick steps to clear print queues and reconnect.",
    body: "1. Check physical cable or WiFi connection to printer.\n2. Open Settings > Devices > Printers & Scanners.\n3. Clear stuck print jobs in the queue.\n4. Power cycle the printer or restart your computer.",
  },
];

const GetSmartPage = () => {
  const [open, setOpen] = useState<number | null>(0);
  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("get_smart_content").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        const dynamic = (data || []).map(d => ({
          image: d.image_url || tipSlow,
          title: d.title,
          summary: d.body.substring(0, 100) + "...",
          body: d.body
        }));
        setGuides([...STATIC_GUIDES, ...dynamic]);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32">
        {/* Sub-header Tabs matching PDF */}
        <div className="border-b border-border bg-card">
          <div className="container px-4 flex items-center gap-6">
            <Link
              to="/services"
              className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              to="/get-smart"
              className="py-3 text-sm font-bold text-accent border-b-2 border-accent"
            >
              Get Smart
            </Link>
          </div>
        </div>

        <section className="section-padding py-6">
          <div className="container max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                WHAT'S NEXT
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Tips and technology trends from the GiCOFix team.
              </h1>
            </motion.div>

            <div className="pt-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Simple fixes, no tech skills needed
              </h2>

              <div className="space-y-3">
                {guides.map((g, i) => {
                  const isOpen = open === i;
                  return (
                    <motion.article
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {g.image && (
                            <div className="w-16 h-12 rounded-md overflow-hidden bg-secondary shrink-0">
                              {isVideo(g.image) ? (
                                <video src={g.image} muted className="w-full h-full object-cover" />
                              ) : (
                                <img src={g.image} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base leading-snug">{g.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{g.summary}</p>
                          </div>
                        </div>
                        <ChevronDown
                          size={18}
                          className={cn("text-muted-foreground transition-transform flex-shrink-0", isOpen && "rotate-180")}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-border text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-3">
                          {g.image && (
                            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-secondary my-2">
                              {isVideo(g.image) ? (
                                <video src={g.image} controls autoPlay muted loop playsInline className="w-full h-full object-cover" />
                              ) : (
                                <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{g.body}</div>
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GetSmartPage;
