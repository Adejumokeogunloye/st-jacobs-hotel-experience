# St. Jacobs Hotel — deployment-ready package

This source package is ready for Vercel. It contains the complete active website, all production images and hero frames, Vite configuration, Vercel routing, the Supabase booking integration, database migrations and verification tests.

## Deploy with Vercel

1. Extract the ZIP.
2. Add the extracted files to a GitHub repository, keeping `package.json` and `vercel.json` at the repository root.
3. In Vercel, select **Add New → Project**, import the repository and select **Deploy**.

Vercel will automatically run `npm run build` and publish the `dist` folder. No framework or routing changes are required.

The frontend is already connected to the dedicated St. Jacobs Hotel Supabase project through the public configuration in `public/supabase-config.js`. The publishable key is intentionally safe for browser use; private tables remain protected by database permissions and limited functions.

## Before accepting guests

- Replace the temporary inventory of one room per category using `ROOM-INVENTORY-CONFIRMATION.md`.
- Transfer the Supabase project or organization ownership to the hotel during commercial handover.
- Payment and automatic email or WhatsApp notifications remain separate optional integrations.

## Verified

- Production build succeeds.
- Automated tests pass.
- Local Nigerian and international phone numbers are normalized correctly.
- Guests can create, retrieve and cancel pending reservation requests.
- The database prevents staff from confirming more overlapping stays than configured inventory.
