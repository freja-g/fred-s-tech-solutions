# Customer home services showcase

## Build
- Add a mobile-first services section to the GiCOFix customer home page.
- Load services managed by staff, with reliable built-in services as a fallback.
- Show each service in a compact visual card with its photo or a muted looping video.
- Link every card to booking with that service already selected.
- Extend staff content management so an administrator or technician can attach a photo or video when adding a service.

## Technical details
- Store service media in the existing attachments storage area and save its public URL on the service record.
- Add the required service media database field and access rules through a migration.
- Keep the section hidden from the GiCOFix Staff dashboard.
- Verify the customer home and staff service form on phone-sized screens.
