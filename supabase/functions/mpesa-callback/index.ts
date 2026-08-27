// M-Pesa Daraja callback — Safaricom posts the payment result here.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json();
    const stk = body?.Body?.stkCallback;
    if (!stk?.CheckoutRequestID) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items: any[] = stk.CallbackMetadata?.Item || [];
    const pick = (name: string) => items.find((i) => i.Name === name)?.Value;
    const success = stk.ResultCode === 0;

    await admin.from("payments").update({
      status: success ? "paid" : stk.ResultCode === 1032 ? "cancelled" : "failed",
      result_code: stk.ResultCode,
      result_desc: stk.ResultDesc,
      mpesa_receipt: success ? String(pick("MpesaReceiptNumber") || "") : null,
      paid_at: success ? new Date().toISOString() : null,
      raw_callback: body,
    }).eq("checkout_request_id", stk.CheckoutRequestID);

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("callback error", e);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
