## Sequence replacement: 2026-10-02

The newest 274-frame JPEG archive was extracted and preserved. Thirty evenly spaced frames spanning source frame 001 through 274 were enhanced to 1920 × 1079 and installed as the active scroll sequence. The active files total 9,496,876 bytes. Source, midpoint and final frames were visually inspected for consistent colour, architecture and order. Unit tests verify all 30 active files, mapping, reverse playback, cover geometry and edge cropping. Playwright passed at 1440 × 900 and 390 × 844, including forward/reverse playback, final frame 30, sticky release and rounded CTA rendering. The previous 220-frame sequence is retained under `src-assets/previous-hero-frames-220/` as a rollback copy. No public deployment was made.

## Sequence replacement: 2026-09-28

220 new frames at 1296 x 728, numerically ordered. Original PNGs retained; WebP copies total 17,046,180 bytes. Five unit tests and four Chrome browser tests passed, including desktop 1440 x 900 and mobile viewport 390 x 844. Verified forward/reverse playback, fade and negative translateZ, final frame 220, return to frame 1, sticky release, bounded decoding, reduced motion and missing-frame fallback. Inspected desktop opening/end and mobile middle screenshots. Lower sections unchanged. Mobile testing uses viewport emulation, not physical hardware. No new Lighthouse claim or public deployment.

# Verification

## Automatic sequence playback — 30 October 2026

- The landing hero remains a standard single-viewport frame until the first intentional downward wheel, touch, keyboard or scroll gesture.
- One gesture engages the sticky sequence and starts timed requestAnimationFrame playback through all 220 frames without requiring continued scrolling.
- Wheel, touch and keyboard input pause automatic movement for manual scrubbing; playback resumes after 700 ms of inactivity.
- The first 30 frames retain priority loading, with the remaining WebP frames loaded in paced background chunks.
- Desktop (1440 × 900) and mobile (390 × 844) browser tests verify auto-play, manual reverse scrub, idle resume, final-frame release and canvas centering.
- `npm test`: 18 passed. `npm run test:browser`: 15 passed. `npm run build`: passed.

## Logo and design refinement

- Added the supplied hotel crest to the header, footer and favicon. Monochrome CSS presentation preserves the source asset.
- Corrected LUXERY to LUXURY; refined page copy, spacing and self-hosted typography.
- Applied a consistent 9% left-edge crop with small outer-edge trims to all rendered sequence frames and the native poster, excluding the AI mark without repainting or modifying the JPEGs.
- Five unit/asset tests and four desktop/mobile browser tests passed; production build succeeded. Desktop and 390px phone layouts visually inspected.
- Latest local Lighthouse: Performance 65, Accessibility 100, Best Practices 100, SEO 100; LCP 4.6s, TBT 630ms, CLS 0. These supersede the earlier baseline below. Slow-mobile load performance remains below the earlier system-font build; do not advertise the previous 97 as the current score. Physical mobile hardware was not tested.
- Native first-image loading, font preloads and lightweight IntersectionObserver reveals are in place. The Lighthouse launcher still reports a Windows temporary-profile cleanup error after writing results.

## Earlier baseline (before refinement)

Completed 26 September 2026.

- `npm test`: four passing tests for reversible frame mapping, immediate opacity/Z fade, cover geometry and all 281 frame assets.
- `npx playwright test`: four passing tests, including 1440×900 desktop and 390×844 mobile playback, reverse scrolling, frame 281 release, hidden overlay, bounded bitmap cache, keyboard room tabs, reduced motion/dark mode and missing-frame behavior.
- `npm run build`: successful static production build. JavaScript approximately 48.7 KB gzip; CSS approximately 3 KB gzip.
- Manual browser review: desktop and phone hero layouts, forward/reverse playback, sticky framing, final-frame release, room controls and Skip tour. No console warnings or errors observed.
- Final Lighthouse simulated mobile production audit: Performance 97, Accessibility 100, Best Practices 100, SEO 100. LCP 1.4s; total blocking time 190ms; CLS 0. Initial network transfer approximately 435 KiB. Scores are local simulated lab measurements, not real-device or field guarantees.
- Lighthouse successfully wrote its report but its launcher exited with a Windows temporary-profile cleanup permission error. The audit JSON was read and verified; no manual temporary-directory deletion was performed.

The original eager preload produced a 65 performance score and approximately 17 MB on arrival. Target-first directional loading replaced it. Only three frames download before interaction; full tour data loads as visitors scroll.

## Live Supabase booking verification — 29 October 2026

- Created the dedicated `St Jacobs Hotel` Supabase project in West EU (Ireland).
- Installed the private booking schema, inventory trigger, RLS restrictions and public create/get/cancel functions successfully.
- Direct API verification created `SJH-20261029-7BA86E0B`, retrieved it as pending, cancelled it, and retrieved it again as cancelled.
- Browser verification created `SJH-20261029-D4F964FD` through the real booking page, opened it through the private management link, then cancelled the synthetic request.
- Anonymous direct access to `bookings` and `room_types` returned no exposed table route.
- A rollback-only production database audit confirmed one request successfully and verified that the next overlapping confirmation beyond inventory was rejected.
- A follow-up query confirmed the audit transaction left zero synthetic booking rows.
- Nigerian local numbers such as `0803 123 4567`, Nigerian international numbers and other international numbers are normalized to E.164 in both the browser and production database.
- `npm test`: 13 passed. Production Vite build succeeded.

Limitations: physical iOS/Android devices were not tested. Full sequence traversal can consume around 17.6 MB. The supplied AI footage includes a visible mark, rounded dark corners and reconstructed details. Actual sellable inventory counts for all eight room categories are still required; the safe temporary value is one room per category. Payment and automatic guest/staff notifications are separate integrations.

## Vercel production deployment — 30 October 2026

- Deployed the production build to `https://site-ruddy-gamma-89.vercel.app` under the Vercel project `site`.
- Verified the live homepage after its loader dismissed: the cinematic hero, navigation, booking action and scroll sequence all rendered with no captured console errors.
- Verified that trailing-slash links redirect cleanly to canonical routes, including `/booking/` to `/booking`.
- Verified the public booking page contains all eight room categories, the corrected Nigerian/international phone-number guidance and the reservation request form.
- Verified live routes for `/rooms/`, `/rooms/diplomatic-suite/`, `/manage-booking/` and `/gallery/`; no route returned a 404.
- Latest local checks before deployment: 16 tests passed, the Vite production build succeeded, and the Vercel production build completed successfully.

Limitations: the live deployment uses a Vercel preview domain until a custom hotel domain is connected. Physical iOS/Android hardware was not tested. Payment and automatic guest/staff notifications remain separate integrations.

## Mobile sequence centering — 30 October 2026

- Aligned the mobile opening still's hotel-tower focal point with the geometric centre used by the canvas sequence, removing the sideways visual shift at the start of scrolling.
- Preserved all 220 frames, scroll mapping, reverse playback, loader timing and desktop framing.
- Visually inspected the 390 × 844 opening, middle entrance and final reception frames; the architectural subject remains centred throughout.
- Verification passed: 17 unit/configuration checks, 15 browser tests, the local production build and the Vercel production build.
- Published to `https://site-ruddy-gamma-89.vercel.app` as production deployment `dpl_8ghzjfAcWXmdX8eoFDAW7DCpSuyp` with no captured live console errors.

## Static-first scroll sequence — 30 October 2026

- The homepage now loads as a normal one-viewport hero. Its extended pinned sequence height is added only after a downward wheel, touch, keyboard or scroll gesture while the hero is visible.
- Preserved a single DPR-aware canvas and all 220 production frames. Thirty critical frames are requested first; the remaining frames load in paced twelve-frame idle chunks, with the current scroll neighbourhood prioritised on demand.
- Added requestAnimationFrame interpolation between the target and painted frame to smooth fast wheel and touch input.
- Added passive wheel/touch/scroll listeners, stable viewport-height handling and centred cover rendering for mobile and desktop.
- The “Scroll to discover” link intentionally bypasses sequence activation and remains a direct accessible route to page content.
- Verification passed: 18 unit/configuration checks, all 15 browser scenarios across desktop/mobile and reduced motion, the local production build, and Vercel production deployment `dpl_278pAmVNWbimzHerkJPi9xYnBemQ`.
- Live verification at 390 × 844 confirmed an initial 844px static hero, expansion to 3798px only after ArrowDown, frame advancement, and no captured console errors.
