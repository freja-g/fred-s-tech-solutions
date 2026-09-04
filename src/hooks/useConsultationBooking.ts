
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ConsultationFormValues, consultationSchema } from "@/types/consultation";

export const useConsultationBooking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const bookConsultation = async (values: ConsultationFormValues) => {
    if (!user) {
      nav(`/auth?redirect=/book${window.location.search}`);
      return false;
    }

    const result = consultationSchema.safeParse(values);
    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.issues[0].message,
        variant: "destructive"
      });
      return false;
    }

    setBusy(true);
    try {
      const { error } = await (supabase as unknown as {
        from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
      }).from("consultations").insert({
        customer_id: user.id,
        ...values,
        status: "pending",
      });

      if (error) {
        toast({ title: "Booking failed", description: error.message, variant: "destructive" });
        return false;
      }

      toast({ title: "Success!", description: "Consultation booked. A technician will review it shortly." });
      nav("/messages");
      return true;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { bookConsultation, busy };
};
