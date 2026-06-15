// Optic Air — live Google reviews proxy (Vercel serverless).
// Uses Places API (New). Reads GOOGLE_PLACES_API_KEY (and optional GOOGLE_PLACE_ID).
const PLACE_QUERY = 'Optic Air Ottawa HVAC Contractor, 3 Lundys Lane, Richmond ON';
const COLORS = ['#E15A4A', '#2A6FDB', '#1F8A5B', '#7C3AED', '#D97706', '#0EA5B7', '#BE185D', '#475569'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return res.status(200).json({ ok: false, reason: 'no-key', reviews: [] });

  try {
    let placeId = process.env.GOOGLE_PLACE_ID;
    if (!placeId) {
      const sr = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id',
        },
        body: JSON.stringify({ textQuery: PLACE_QUERY }),
      });
      const sj = await sr.json();
      placeId = sj && sj.places && sj.places[0] && sj.places[0].id;
    }
    if (!placeId) return res.status(200).json({ ok: false, reason: 'no-place', reviews: [] });

    const dr = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId) + '?languageCode=en', {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,googleMapsUri',
      },
    });
    const p = await dr.json();

    const reviews = ((p && p.reviews) || [])
      .filter(function (rv) {
        const t = rv && rv.text && rv.text.text;
        return rv && rv.rating >= 4 && t && t.trim().length > 0;
      })
      .map(function (rv, i) {
        let nm = (rv.authorAttribution && rv.authorAttribution.displayName) || 'Google user';
        nm = nm.trim();
        return {
          body: rv.text.text.trim(),
          name: nm,
          initials: nm.charAt(0).toUpperCase(),
          rating: rv.rating,
          when: rv.relativePublishTimeDescription || '',
          color: COLORS[i % COLORS.length],
        };
      });

    return res.status(200).json({
      ok: true,
      rating: { avg: (p && p.rating) || null, total: (p && p.userRatingCount) || null },
      url: (p && p.googleMapsUri) || ('https://www.google.com/maps/place/?q=place_id:' + placeId),
      reviews: reviews,
    });
  } catch (e) {
    return res.status(200).json({ ok: false, reason: 'error', reviews: [] });
  }
};
