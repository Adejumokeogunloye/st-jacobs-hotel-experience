# Publish on Vercel

This package is configured as a Vite multi-page site. Hotel reservation requests are stored in Supabase through secured database functions; the contact form remains a separate development-only endpoint.

## Dashboard upload

1. Extract the ZIP.
2. Put the extracted folder in a GitHub repository.
3. In Vercel, choose **Add New → Project**, import that repository and select **Deploy**.
4. Vercel reads `vercel.json`, runs `npm run build`, publishes `dist`, and provisions the contact-enquiry file in `api/` as a function.

No build-setting changes are required. If Vercel asks, use:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Required reservation variables

Create the Supabase project and run the migration described in `SUPABASE-SETUP.md`, then add:

- `VITE_SUPABASE_URL`: the project's public URL
- `VITE_SUPABASE_ANON_KEY`: the project's public anonymous key

These are public browser credentials protected by Supabase permissions. Never add the service-role key to Vercel or frontend code.

## Optional environment variable

- `SITE_URL`: final public origin, for example `https://saintjacobshotel.com`. The existing hotel domain is used when this is omitted.
## Important production boundary

The booking page creates real reservation requests and checks the confirmed inventory configured in Supabase. Requests remain pending until hotel staff confirm them. It does not collect payment or automatically send email/WhatsApp messages. The contact screen remains a development experience until a delivery service is connected.

## Local verification

```powershell
npm install
npm test
npm run build
```

Use `npm run dev` for frontend work. Use `vercel dev` when testing the Vercel Functions locally.
