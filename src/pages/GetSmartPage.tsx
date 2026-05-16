import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import tipRestart from "@/assets/tip-restart.jpg";
import tipWifi from "@/assets/tip-wifi.jpg";
import tipPrinter from "@/assets/tip-printer.jpg";
import tipSlow from "@/assets/tip-slow.jpg";

const guides = [
  {
    image: tipRestart,
    title: "Computer not responding? Restart the smart way",
    summary: "Most freezes vanish after a proper restart. Here's how to do it without losing your work.",
    steps: [
      "Save anything open (Ctrl + S on Windows, Cmd + S on Mac).",
      "Close apps one by one — start with the heaviest (browsers, video).",
      "Click Start → Power → Restart (don't just Shut Down).",
      "If frozen completely: hold the power button for 10 seconds, wait 30 seconds, power back on.",
    ],
  },
  {
    image: tipWifi,
    title: "WiFi is slow or keeps dropping",
    summary: "Before calling your provider, try this 2-minute reset. It works 8 times out of 10.",
    steps: [
      "Unplug your router from the wall socket.",
      "Wait a full 60 seconds (this clears the memory).",
      "Plug it back in and wait 2–3 minutes for all lights to settle.",
      "Reconnect your device. Still slow? Move closer to the router or restart your device.",
    ],
  },
  {
    image: tipPrinter,
    title: "Printer not printing? Quick fixes",
    summary: "Paper in, ink fine, but nothing comes out? Walk through these checks.",
    steps: [
      "Confirm the printer is on and shows no error lights.",
      "Open print queue (Settings → Printers) and clear any stuck jobs.",
      "Turn the printer off, unplug for 30 seconds, plug back in.",
      "Try printing a test page. If it fails, re-add the printer in Settings.",
    ],
  },
  {
    image: tipSlow,
    title: "Computer is painfully slow — free it up",
    summary: "Slowness is usually clutter, not a broken machine. Clean these 4 things first.",
    steps: [
      "Close browser tabs you don't need — each one uses memory.",
      "Restart the computer (it's been a while, right?).",
      "Empty the Recycle Bin / Trash.",
      "Check storage: Settings → Storage. If you're above 90% full, delete or move old files.",
    ],
  },
];

const GetSmartPage = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-20 pt-6">
        <section className="section-padding bg-secondary/40">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium mb-3">
                <Lightbulb size={14} /> No tech skills required
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-3">Get Smart</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Simple, step-by-step fixes for the everyday tech problems we see most often.
                Try these first — they solve issues in minutes, no technician needed.
              </p>
            </motion.div>

            <div className="space-y-4">
              {guides.map((g, i) => {
                const isOpen = open === i;
                return (
                  <motion.article
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full text-left flex flex-col md:flex-row gap-4 md:items-stretch"
                      aria-expanded={isOpen}
                    >
                      <img
                        src={g.image}
                        alt={g.title}
                        loading="lazy"
                        width={768}
                        height={512}
                        className="w-full md:w-48 md:h-auto h-44 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 p-4 md:p-5 flex items-center gap-3">
                        <div className="flex-1">
                          <h2 className="font-semibold text-lg leading-snug mb-1">{g.title}</h2>
                          <p className="text-sm text-muted-foreground">{g.summary}</p>
                        </div>
                        <ChevronDown
                          size={20}
                          className={cn("text-muted-foreground transition-transform flex-shrink-0", isOpen && "rotate-180")}
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-4 md:px-5 pb-5 border-t border-border"
                      >
                        <ol className="space-y-3 pt-4">
                          {g.steps.map((s, idx) => (
                            <li key={idx} className="flex gap-3 text-sm">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent font-semibold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{s}</span>
                            </li>
                          ))}
                        </ol>
                      </motion.div>
                    )}
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-10 text-center text-sm text-muted-foreground">
              Tried these and still stuck? <a href="/messages" className="text-accent font-medium">Chat with our team</a>.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GetSmartPage;
