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
      const sanitized = result.data;
      const payload: Record<string, any> = {
        customer_id: user.id,
        subject: sanitized.subject,
        description: sanitized.description,
        service_id: sanitized.service_id,
        attachment_urls: sanitized.attachment_urls,
        delivery_method: sanitized.delivery_method,
        status: "pending",
      };

      let { error } = await (supabase as any).from("consultations").insert(payload);

      // Gracefully handle database instances where 'delivery_method' column is missing or schema cache is outdated
      if (error && (error.message?.toLowerCase().includes("delivery_method") || error.message?.toLowerCase().includes("schema cache") || error.code === "PGRST204")) {
        console.warn("delivery_method column issue encountered, appending to description as fallback");
        const deliveryText = sanitized.delivery_method ? `\n\n[Delivery Method: ${sanitized.delivery_method.replace("_", " ")}]` : "";
        delete payload.delivery_method;
        payload.description = `${sanitized.description}${deliveryText}`;
        const retry = await (supabase as any).from("consultations").insert(payload);
        error = retry.error;
      }

      if (error) {
        toast({ title: "Booking failed", description: error.message, variant: "destructive" });
        return false;
      }

      toast({ title: "Success!", description: "Consultation booked. A technician will review it shortly." });
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
