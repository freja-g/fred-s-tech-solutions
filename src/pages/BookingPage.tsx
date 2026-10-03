
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Camera, X, Video, Home, Truck, Store, Monitor } from "lucide-react";
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
  const { user, isAdmin, isTechnician } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { bookConsultation, busy } = useConsultationBooking();

  const isStaff = isAdmin || isTechnician;

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    const s = searchParams.get("service");
    const id = searchParams.get("service_id");
    const d = searchParams.get("details");
    if (s) setSubject(s);
    if (id && id.length === 36) setServiceId(id); // Simple UUID check
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
    await bookConsultation({
      subject,
      description,
      service_id: serviceId,
      attachment_urls: media,
      delivery_method: delivery,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-4 pb-24 md:pb-12 container max-w-2xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/services")}
          className="mb-4 -ml-3 gap-2"
          aria-label="Back to services"
        >
          <ArrowLeft size={18} />
          Back to Services
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book a Consultation</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Tell us about your technical issue or project needs. Photos or videos (max 50MB) help us understand better.</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g. Broken Laptop Screen, Network Setup" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Problem Description</Label>
            <Textarea id="desc" placeholder="Please provide details about what's happening..." rows={6} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div className="space-y-3">
            <Label>How would you like your service delivered?</Label>
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_OPTIONS.map(({ value, label, hint, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDelivery(value)}
                  aria-pressed={delivery === value}
                  className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors ${delivery === value ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
                >
                  <Icon size={20} className="text-accent" />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Attachments (Optional - Photos/Videos max 50MB)</Label>
            <div className="flex flex-wrap gap-3">
              {media.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded border overflow-hidden bg-secondary">
                  {url.includes('.mp4') ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  )}
                  <Button type="button" size="icon" variant="destructive" onClick={() => setMedia(media.filter((_, idx) => i !== idx))} className="absolute top-0 right-0 h-8 w-8 rounded-bl rounded-tr-none">
                    <X size={14} />
                  </Button>
                  {url.includes('.mp4') && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Video size={20} className="text-white drop-shadow-md" /></div>}
                </div>
              ))}
              <div className="flex gap-2">
                 <Button
                  type="button"
                  onClick={() => handleUploadMedia('image')}
                   variant="outline"
                   className="w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground"
                >
                  <Camera size={24} />
                  <span className="text-[10px] mt-1">Add Photo</span>
                 </Button>
                 <Button
                  type="button"
                  onClick={() => handleUploadMedia('video')}
                   variant="outline"
                   className="w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground"
                >
                  <Video size={24} />
                  <span className="text-[10px] mt-1">Add Video</span>
                 </Button>
              </div>
            </div>
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={busy}>
            {busy ? "Booking..." : "Book Consultation"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default BookingPage;
