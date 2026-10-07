import { Link, useSearchParams } from "react-router-dom";
import { Check, MessageCircle, ClipboardList } from "lucide-react";
import Header from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  { icon: Check, title: "We review your request", text: "A GiCOFix technician picks it up." },
  { icon: MessageCircle, title: "We message you in Chat", text: "Replies appear in the Chat tab." },
  { icon: ClipboardList, title: "Track it in Consultations", text: "Pay with M-Pesa once the job is complete." },
];

const BookingSuccessPage = () => {
  const [params] = useSearchParams();
  const subject = params.get("subject") || "Your consultation";
  const delivery = (params.get("delivery") || "").replace("_", "-");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-xl py-8 md:pt-28">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check size={24} /></div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">GiCOFix</p>
          <h1 className="mb-2 text-2xl font-bold">Consultation booked</h1>
          <p className="text-sm text-muted-foreground">{subject}{delivery ? ` · ${delivery}` : ""}</p>

          <h2 className="mb-4 mt-8 font-semibold">What happens next</h2>
          <div className="space-y-5">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-accent"><Icon size={16} /></span>
                <div><p className="text-sm font-semibold">{index + 1}. {title}</p><p className="text-sm text-muted-foreground">{text}</p></div>
              </div>
            ))}
          </div>
          <Link to="/consultations" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-8 w-full")}>View my consultations</Link>
          <Link to="/" className="mt-4 block text-center text-sm font-medium text-accent hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
};

export default BookingSuccessPage;