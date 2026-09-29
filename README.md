# Optic Air — Vercel Deployment

Static site. No build step required.

## Deploy

**Option 1 — Vercel CLI**
```bash
cd deploy
npx vercel
```

**Option 2 — Drag & drop**
1. Go to https://vercel.com/new
2. Drag the `deploy` folder into the upload area
3. Click Deploy

**Option 3 — GitHub**
1. Push the contents of `deploy/` to a GitHub repo
2. Import the repo at https://vercel.com/new
3. Framework preset: **Other**
4. Build command: (leave empty)
5. Output directory: `./`

## Files
- `index.html` — main page
- `styles.css` — site styles
- `app.jsx`, `components.jsx`, `tweaks-panel.jsx` — app code
- `pages/` — page components
- `assets/` — logo and photos
- `vercel.json` — serves `.jsx` files with the correct MIME type


## Deployment

This site deploys automatically to Vercel from the `main` branch. Push to `main` to publish.

## Marketing attribution

`lib/attribution.js` (plain script, no dependencies) records where visitors came from and sends that with every lead form submission.

- **Captured:** only `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`, the landing path and the external referrer's hostname. No form data or other query params.
- **Stored:** first-party `localStorage` key `pp_attribution` with two touches.
  - **First touch** is never overwritten.
  - **Last touch** is the latest tagged or referral visit. Direct visits don't replace it.
  - The window runs 90 days from the last tagged/referral visit.
- **Sent:** `submitLead()` in `components.jsx` adds `attribution` to the request body. `api/create-lead.js` re-validates it and does two things:
  - Sets the Housecall Pro `lead_source` from the last touch, always one of the fixed names below.
  - Appends first/last-touch details and any Google click IDs to the lead note.
- **Google Ads conversion:** unchanged. It still fires once, only after the API responds successfully.

### Housecall Pro lead sources

HCP rejects lead-source names that don't already exist (HTTP 400), so every visit maps onto this fixed list. The names must match the account's lead sources exactly.

| Last touch | HCP lead source |
|---|---|
| `gclid` / `gbraid` / `wbraid`, or paid Google UTMs (`utm_source=google` + `cpc`, `ppc`, `display`…) | `Google Ads` |
| Search-engine referrer, or `utm_medium=organic` | `Organic Search` |
| `utm_medium=qr`, or print/offline UTMs (`utm_source=offline`, `utm_medium=print`, `flyer`, `direct_mail`…) | `QR / Printed Marketing` |
| Social networks, organic or paid | `Social` |
| `utm_medium=email`, or webmail referrers | `Email` |
| Other websites' links, or `utm_medium=referral` | `Referral` |
| `utm_source=gbp` / `gmb` | `Google Business Profile` |
| Direct, no attribution, anything else (e.g. Microsoft Ads, unrecognised UTMs) | `Website` |

If HCP still answers 400/422, the lead is resent once with `Website`. Placement details such as `utm_content=lawn_sign` appear only in the note.

### QR / printed-material URLs

Give each printed placement its own `utm_content`. Every QR lead gets the HCP source `QR / Printed Marketing`, and the note records which placement it came from.

```
https://opticair.ca/contact?utm_source=offline&utm_medium=qr&utm_campaign=printed_materials&utm_content=lawn_sign
```

### Configuration

| Where | Setting | Purpose |
|---|---|---|
| Vercel env | `HCP_LEAD_SOURCE_MAP` (optional, not needed while names match) | JSON that renames one of the lead sources above to another existing HCP lead source, e.g. `{"QR / Printed Marketing":"QR Codes"}` |
| `components.jsx` | `GA4_MEASUREMENT_ID` | Empty = off. Set it to the `G-…` ID once a GA4 tag is added to `index.html` to also send a GA4 `generate_lead` event (GA4 only, never to Google Ads). |

### Tests

```bash
node --test "tests/*.test.js"
```

### Deploying

The live front-end is served from GoDaddy (opticair.ca, behind Sucuri). Vercel serves the `/api/*` functions from `main`.

1. **Check live hasn't drifted.** The live site is sometimes edited directly. Before uploading anything, diff each file you'll replace against `https://opticair.ca/<file>`.
2. **Vercel:** push `main`. The lead API needs `api/create-lead.js` and `lib/attribution.js`.
3. **GoDaddy:** upload in this order, keeping line endings as LF, like live:
   1. `lib/attribution.js`
   2. `components.jsx`
   3. `index.html`
4. **Clear the Sucuri cache.** Sucuri caches `index.html`.
5. **Bump `?v=`** in `index.html` for any `.jsx` file whose content changes. The `.jsx` files have no `Cache-Control` header, so browsers cache them heuristically.

## Style notes

- Service-card price labels render as orange pill badges with white text, via a `<style>` block in `index.html` (selector `.svc-card .card-foot .price`).
