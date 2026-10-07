# GiCOFix Customer App PDF Redesign

## Build
- Match the uploaded eight-screen mobile design across the customer experience: Home, Services, Booking, Consultations, Get Smart, Chat, Account, and booking confirmation.
- Replace the current large marketing layouts with compact app-style cards, segmented tabs, concise page headers, and the PDF’s navy, teal, white, and pale aqua visual hierarchy.
- Keep the GiCOFix logo in the header and use a subtle oversized logo watermark behind customer page content, with sufficient contrast for text.
- Preserve all existing booking, chat, consultation, payment, service-media, review, account, and AI recommendation behavior.
- Keep GiCOFix Staff screens functionally and visually separate from these customer-only changes.

## Technical details
- Add shared customer-page shell styles and reusable visual patterns rather than duplicating layout code.
- Update customer routing where needed for the PDF’s Services/Get Smart switch and booking-success state.
- Rework existing components in place, using current design tokens and Button controls.
- Verify the main customer flows at phone and desktop sizes, check horizontal overflow, and confirm the latest build is clean.
