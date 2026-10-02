import { createResponsesCall } from "../_shared/responses.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const { problem, services } = await req.json();
    if (typeof problem !== "string" || problem.trim().length < 10 || problem.length > 2000)
      return json({ error: "Please describe your problem in 10 to 2000 characters." }, 400);
    const list = (Array.isArray(services) ? services : [])
      .slice(0, 30)
      .map((s: any) => ({ id: String(s.id), title: String(s.title).slice(0, 100), description: String(s.description ?? "").slice(0, 300) }));
    if (!list.length) return json({ error: "No services available." }, 400);

    const system = `You are a friendly support assistant for GiCOFix Solutions, a technology support company in Kenya. Use plain language, no jargon.
Pick the single best service for the customer's problem from this list (use the exact id):
${list.map((s) => `- id: ${s.id} | ${s.title}: ${s.description}`).join("\n")}
Reply ONLY with JSON: {"service_id": string, "reason": string (max 2 sentences), "checklist": string[] (3 to 5 short items the customer should prepare before the visit, e.g. device model, error messages, passwords ready, backups)}`;

    const call = createResponsesCall(
      req,
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
      [{ role: "system", content: system }, { role: "user", content: problem.trim() }],
    );
    const text = await call.result.text;
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : null;
    const service = list.find((s) => s.id === parsed?.service_id) ?? null;
    if (!parsed || !service) return json({ error: "We couldn't find a match. Please try describing it differently or book directly." }, 502);
    return json({
      service,
      reason: String(parsed.reason ?? ""),
      checklist: (Array.isArray(parsed.checklist) ? parsed.checklist : []).slice(0, 5).map(String),
    });
  } catch (e: any) {
    const status = e?.statusCode ?? e?.status;
    if (status === 429) return json({ error: "Too many requests right now. Please try again in a minute." }, 429);
    if (status === 402) return json({ error: "AI credits are used up. Please add credits in workspace billing." }, 402);
    if (status === 403) return json({ error: "AI access is blocked for this workspace." }, 403);
    console.error(e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
