# Project architecture rules

- Customer-facing service lists read staff-managed records from `public.services` and keep local defaults for unavailable backend data, so GiCOFix remains usable during connectivity issues.
- Service photos and videos use the shared `attachments` storage bucket and persist their accessible URL in `services.media_url`, so web and Android clients render the same media.
- Customer pages share a compact mobile app shell modeled from the approved customer redesign, while staff pages retain their operational layouts so the two products stay distinct.