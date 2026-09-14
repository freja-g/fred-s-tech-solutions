# 3D Background Across All Pages

## Build
- Add the new GiCOFix 3D technology artwork as one fixed, full-screen background shared by every route.
- Keep all page content, navigation, dialogs, and notifications above the artwork.
- Use restrained transparency so text and controls remain readable in both light and dark modes.
- Respect reduced-motion preferences and retain existing page layouts.

## Technical details
- Import the generated background once in the shared app shell rather than duplicating it on individual pages.
- Render it as a non-interactive decorative image with stable dimensions and full viewport coverage.
- Verify the preview and current build status after the change.
