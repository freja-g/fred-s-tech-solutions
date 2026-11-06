# Project architecture rules

- Customer-facing service lists read staff-managed records from `public.services` and keep local defaults for unavailable backend data, so GiCOFix remains usable during connectivity issues.
- Service photos and videos use the shared `attachments` storage bucket and persist their accessible URL in `services.media_url`, so web and Android clients render the same media.
- Customer pages share a compact mobile app shell modeled from the approved customer redesign, while staff pages retain their operational layouts so the two products stay distinct.
- The app connects to the user's own Supabase project (the URL hardcoded in the auto-generated `src/integrations/supabase/client.ts`, project `jyjuifmmruytnsvjyghl`), not the URL in `.env`, which still names the older Lovable Cloud instance; treat `client.ts` as authoritative when checking schema or data, and never probe or migrate the stale `.env` project.
- Supabase client calls for tables missing from the generated `types.ts` use `as any` casts (project convention) rather than editing auto-generated type files.
- Cross-app in-app notifications are handled by the shared client notification hook and header inbox; phone push delivery requires a separately connected push provider.
