import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase as _sb } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/staff";
import { Loader2, Smartphone, CheckCircle2 } from "lucide-react";

const supabase: any = _sb;

interface PayDialogProps {
  consultationId: string;
  amount: number;
  defaultPhone?: string;
  onPaid?: () => void;
}

/** Customer-facing M-Pesa STK Push payment dialog (WIGA TECH). */
const PayDialog = ({ consultationId, amount, defaultPhone = "", onPaid }: PayDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [state, setState] = useState<"idle" | "sending" | "waiting" | "paid">("idle");
  const [receipt, setReceipt] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => () => { if (pollRef.current) window.clearInterval(pollRef.current); }, []);

  const pollPayment = (paymentId: string) => {
    let ticks = 0;
    pollRef.current = window.setInterval(async () => {
      ticks += 1;
      const { data } = await supabase.from("payments").select("status, mpesa_receipt, result_desc").eq("id", paymentId).maybeSingle();

      if (data?.status === "paid") {
        window.clearInterval(pollRef.current!);
        setState("paid");
        setReceipt(data.mpesa_receipt || null);
        toast({ title: "Payment received", description: `Receipt ${data.mpesa_receipt || ""}` });
        onPaid?.();
      } else if (data?.status === "failed" || data?.status === "cancelled") {
        window.clearInterval(pollRef.current!);
        setState("idle");
        toast({ title: "Payment not completed", description: data.result_desc || "The prompt was cancelled.", variant: "destructive" });
      } else if (ticks > 40) {
        window.clearInterval(pollRef.current!);
        setState("idle");
        toast({ title: "Still pending", description: "We did not get a confirmation. Check your phone and try again." });
      }
    }, 3000);
  };

  const startPayment = async () => {
    setState("sending");
    const { data, error } = await supabase.functions.invoke("mpesa-stkpush", {
      body: { consultationId, amount, phone },
    });

    if (error || data?.error) {
      setState("idle");
      toast({ title: "Could not start payment", description: data?.error || error?.message, variant: "destructive" });
      return;
    }

    setState("waiting");
    toast({ title: "Check your phone", description: "Enter your M-Pesa PIN to approve the payment." });
    pollPayment(data.paymentId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" className="flex-1 min-w-[150px]">
          <Smartphone size={16} className="mr-2" /> Pay {formatKES(amount)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay with M-Pesa</DialogTitle>
          <DialogDescription>
            We will send an STK prompt to your phone for {formatKES(amount)}.
          </DialogDescription>
        </DialogHeader>

        {state === "paid" ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-accent" />
            <p className="font-medium">Payment confirmed</p>
            {receipt && <p className="text-sm text-muted-foreground">Receipt {receipt}</p>}
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <Label htmlFor="mpesa-phone">M-Pesa phone number</Label>
            <Input
              id="mpesa-phone"
              inputMode="tel"
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={state !== "idle"}
            />
            {state === "waiting" && (
              <p className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
                <Loader2 size={14} className="animate-spin" /> Waiting for confirmation…
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {state === "paid" ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <Button variant="accent" onClick={startPayment} disabled={state !== "idle" || phone.replace(/\D/g, "").length < 9}>
              {state === "sending" ? "Sending…" : state === "waiting" ? "Awaiting PIN…" : "Send prompt"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayDialog;
