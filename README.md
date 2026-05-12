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
