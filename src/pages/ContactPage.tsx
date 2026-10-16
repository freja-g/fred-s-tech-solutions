import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Send, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContact } from "@/hooks/useContact";

const ContactPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handleExternalSubmit } = useContact();
  const [method, setMethod] = useState<"whatsapp" | "email">("whatsapp");
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "your@email.com",
    message: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Fields required", description: "Please enter your name, email, and message.", variant: "destructive" });
      return;
    }
    handleExternalSubmit({
      name: formData.name,
      email: formData.email,
      phone: "",
      service: "General Inquiry",
      details: formData.message,
    }, method);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 container max-w-xl py-6 space-y-6">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Account
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Contact us</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Reach out via WhatsApp or email directly</p>
        </div>

        {/* WhatsApp | Email Toggle Tabs matching Page 12 PDF */}
        <div className="grid grid-cols-2 gap-2 bg-card border border-border p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setMethod("whatsapp")}
            className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${method === "whatsapp" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${method === "email" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Mail size={16} /> Email
          </button>
        </div>

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-bold text-xs">Your name</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-bold text-xs">Email address</Label>
            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="font-bold text-xs">Message</Label>
            <Textarea id="message" placeholder="How can we help?" rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required />
          </div>

          <Button type="submit" variant="accent" className="w-full font-bold">
            Send message
          </Button>
        </form>

        {/* Footer Helper Callout matching Page 12 PDF */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-3 text-xs sm:text-sm">
          <p className="text-muted-foreground">
            Need a repair or advice? Go to <Link to="/services" className="font-bold text-accent hover:underline">Services</Link> to book a consultation.
          </p>
          <Link to="/services" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 font-bold text-xs")}>
            Services <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
