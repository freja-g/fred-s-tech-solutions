import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Camera, X, Video, Home, Truck, Store, Monitor, CheckCircle2 } from "lucide-react";
import { uploadMedia } from "@/lib/storage";
import { useConsultationBooking } from "@/hooks/useConsultationBooking";

type Delivery = "doorstep" | "pick_up" | "drop_off" | "remote";
const DELIVERY_OPTIONS: { value: Delivery; label: string; hint: string; Icon: typeof Home }[] = [
  { value: "doorstep", label: "Doorstep", hint: "We come to you", Icon: Home },
  { value: "pick_up", label: "Pick-up", hint: "We collect your device", Icon: Truck },
  { value: "drop_off", label: "Drop-off", hint: "You bring it to us", Icon: Store },
  { value: "remote", label: "Remote", hint: "We fix it online", Icon: Monitor },
];

const BookingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookConsultation, busy } = useConsultationBooking();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>("doorstep");

  const [bookedDetails, setBookedDetails] = useState<{ subject: string; delivery: string } | null>(null);

  useEffect(() => {
    const s = searchParams.get("service");
    const id = searchParams.get("service_id");
    const d = searchParams.get("details");
    if (s) setSubject(s);
    if (id && id.length === 36) setServiceId(id);
    if (d) setDescription(d);
  }, [searchParams]);

  const handleUploadMedia = async (type: 'image' | 'video') => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to upload photos or videos." });
      return;
    }
    const url = await uploadMedia("attachments", `consultations/${user.id}`, type);
    if (url) setMedia([...media, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) {
      toast({ title: "Choose a delivery option", description: "Tell us how you'd like your service delivered.", variant: "destructive" });
      return;
    }
    const success = await bookConsultation({
      subject,
      description,
      service_id: serviceId,
      attachment_urls: media,
      delivery_method: delivery,
    });

    if (success) {
      const deliveryLabel = DELIVERY_OPTIONS.find(o => o.value === delivery)?.label || delivery;
      setBookedDetails({
        subject: subject || "Technical Consultation",
        delivery: deliveryLabel,
      });
    }
  };

  // Render Confirmation Screen matching Page 8 of PDF
  if (bookedDetails) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="md:pt-20 pt-6 container max-w-xl text-center space-y-6">
          <div className="inline-flex p-3 rounded-full bg-accent/15 text-accent mb-2">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-bold">Consultation booked</h1>
          <p className="text-sm font-semibold text-muted-foreground">
            {bookedDetails.subject} · {bookedDetails.delivery}
          </p>

          <div className="bg-card border border-border rounded-xl p-5 text-left space-y-4 shadow-sm">
            <h2 className="font-bold text-base text-foreground border-b border-border pb-2">
              What happens next
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">We review your request</h3>
                  <p className="text-xs text-muted-foreground">A GiCOFix technician picks it up.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">We message you in Chat</h3>
                  <p className="text-xs text-muted-foreground">Replies appear in the Chat tab.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Track it in Consultations</h3>
                  <p className="text-xs text-muted-foreground">Pay with M-Pesa once the job is complete.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="accent"
              className="w-full"
              onClick={() => navigate("/consultations")}
            >
              View my consultations
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 container max-w-2xl py-6">
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Services
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book a Consultation</h1>

        {/* Stepper matching PDF */}
        <div className="flex items-center justify-between gap-1 text-xs font-semibold text-muted-foreground mb-6 bg-card border border-border p-3 rounded-lg flex-wrap min-w-0">
          <span className="text-accent font-bold truncate">1 Describe</span>
          <span className="shrink-0">→</span>
          <span className="text-accent font-bold truncate">2 Delivery</span>
          <span className="shrink-0">→</span>
          <span className="text-accent font-bold truncate">3 Submit</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-bold">Subject</Label>
            <Input id="subject" placeholder="e.g. Broken Laptop Screen" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="font-bold">Problem Description</Label>
            <Textarea id="desc" placeholder="Please provide details about what's happening…" rows={5} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div className="space-y-3">
            <Label className="font-bold">How would you like your service delivered?</Label>
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_OPTIONS.map(({ value, label, hint, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDelivery(value)}
                  aria-pressed={delivery === value}
                  className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all ${delivery === value ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}
                >
                  <Icon size={20} className="text-accent" />
                  <span className="text-sm font-bold">{label}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-bold">Attachments (optional, up to 50MB)</Label>
            <div className="flex flex-wrap gap-3">
              {media.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg border overflow-hidden bg-secondary">
                  {url.includes('.mp4') ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  )}
                  <Button type="button" size="icon" variant="destructive" onClick={() => setMedia(media.filter((_, idx) => i !== idx))} className="absolute top-0 right-0 h-7 w-7 rounded-bl rounded-tr-none">
                    <X size={12} />
                  </Button>
                  {url.includes('.mp4') && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Video size={18} className="text-white drop-shadow-md" /></div>}
                </div>
              ))}
              <div className="flex gap-2">
                 <Button
                  type="button"
                  onClick={() => handleUploadMedia('image')}
                  variant="outline"
                  className="w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Camera size={20} />
                  <span className="text-[10px] font-medium mt-1">Add Photo</span>
                 </Button>
                 <Button
                  type="button"
                  onClick={() => handleUploadMedia('video')}
                  variant="outline"
                  className="w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Video size={20} />
                  <span className="text-[10px] font-medium mt-1">Add Video</span>
                 </Button>
              </div>
            </div>
          </div>

          <Button type="submit" variant="accent" className="w-full text-base font-bold py-3" disabled={busy}>
            {busy ? "Booking..." : "Book Consultation"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default BookingPage;
