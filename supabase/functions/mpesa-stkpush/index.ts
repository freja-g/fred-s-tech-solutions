// M-Pesa Daraja STK Push — initiates a payment prompt on the customer's phone.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DARAJA_BASE =
  (Deno.env.get("MPESA_ENV") || "sandbox") === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const normalizePhone = (raw: string) => {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
};

const timestamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { consultationId, amount, phone } = await req.json();
    const msisdn = normalizePhone(phone);
    const amt = Math.round(Number(amount));

    if (!msisdn || msisdn.length !== 12 || !amt || amt < 1) {
      return new Response(JSON.stringify({ error: "Invalid phone number or amount" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("MPESA_CONSUMER_KEY")!;
    const secret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
    const shortcode = Deno.env.get("MPESA_SHORTCODE")!;
    const passkey = Deno.env.get("MPESA_PASSKEY")!;
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL") || `${supabaseUrl}/functions/v1/mpesa-callback`;

    // 1. OAuth token
    const tokenRes = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: "Basic " + btoa(`${key}:${secret}`) },
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) throw new Error("Daraja auth failed: " + JSON.stringify(tokenJson));

    // 2. Create the pending payment row (service role — bypasses RLS safely)
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: payment, error: insertErr } = await admin
      .from("payments")
      .insert({
        consultation_id: consultationId || null,
        customer_id: user.id,
        amount: amt,
        phone: msisdn,
        status: "processing",
        provider: "mpesa",
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    // 3. STK push
    const ts = timestamp();
    const password = btoa(`${shortcode}${passkey}${ts}`);
    const stkRes = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: amt,
        PartyA: msisdn,
        PartyB: shortcode,
        PhoneNumber: msisdn,
        CallBackURL: callbackUrl,
        AccountReference: (consultationId || payment.id).slice(0, 12),
        TransactionDesc: "Wiga Tech service payment",
      }),
    });
    const stk = await stkRes.json();

    if (stk.ResponseCode !== "0") {
      await admin.from("payments").update({
        status: "failed",
        result_desc: stk.errorMessage || stk.ResponseDescription || "STK push rejected",
        raw_callback: stk,
      }).eq("id", payment.id);

      return new Response(JSON.stringify({ error: stk.errorMessage || "Could not start payment" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("payments").update({
      merchant_request_id: stk.MerchantRequestID,
      checkout_request_id: stk.CheckoutRequestID,
    }).eq("id", payment.id);

    return new Response(
      JSON.stringify({ paymentId: payment.id, checkoutRequestId: stk.CheckoutRequestID, message: stk.CustomerMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("stkpush error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
