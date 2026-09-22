# NWT Dev Website

Static site (home page, six service landing pages under `services/`, one case study) for NWT Dev — a digital solutions company based in Zimbabwe.

Deployed via Cloudflare Workers static assets.

## Cloudflare Workers Builds settings
- Framework preset: None
- Root directory: `/`
- Build command: `npx wrangler versions upload --assets=. --name=nwt-dev-website --compatibility-date=2026-09-22`
- Deploy command: `npx wrangler versions upload --assets=. --name=nwt-dev-website --compatibility-date=2026-09-22`

## Conversion tracking
`assets/track.js` pushes events to `dataLayer` (`generate_lead`, `click_whatsapp`, `click_phone`, `click_email`, `cta_click`).
Add the GA4 ID, Google Ads ID and lead conversion label at the top of that file to switch on Google tags.

## Notes
- Shared styles live in `assets/site.css` (a copy of the CSS block inlined in `index.html`); keep them in sync when editing.
- Service pages are plain HTML in `services/` — served at `/services/<name>`.
- Canonical URLs and `sitemap.xml` use `https://nwt-dev-website.ngaatendwew.workers.dev`; change them if a custom domain is added.
