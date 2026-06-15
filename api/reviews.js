// Optic Air — live Google reviews proxy (Vercel serverless).
// Reads GOOGLE_PLACES_API_KEY (and optional GOOGLE_PLACE_ID) from env.
// Returns { ok, rating:{avg,total}, url, reviews:[{body,name,initials,rating,when,color}] }
const PLACE_QUERY = 'Optic Air Ottawa HVAC Contractor, 3 Lundys Lane, Richmond ON';
const COLORS = ['#E15A4A', '#2A6FDB', '#1F8A5B', '#7C3AED', '#D97706', '#0EA5B7', '#BE185D', '#475569'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache at the edge so we don't hit the Places API on every visit.
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return res.status(200).json({ ok: false, reason: 'no-key', reviews: [] });

  try {
    let placeId = process.env.GOOGLE_PLACE_ID;
    if (!placeId) {
      const fpUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
        + '?input=' + encodeURIComponent(PLACE_QUERY)
        + '&inputtype=textquery&fields=place_id&key=' + key;
      const fp = await fetch(fpUrl);
      const fpj = await fp.json();
      placeId = fpj && fpj.candidates && fpj.candidates[0] && fpj.candidates[0].place_id;
    }
    if (!placeId) return res.status(200).json({ ok: false, reason: 'no-place', reviews: [] });

    const dUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
      + '?place_id=' + encodeURIComponent(placeId)
      + '&fields=rating,user_ratings_total,reviews,url,name&language=en&key=' + key;
    const d = await fetch(dUrl);
    const dj = await d.json();
    const r = (dj && dj.result) || {};

    const reviews = (r.reviews || [])
      .filter(function (rv) { return rv && rv.rating >= 4 && rv.text && rv.text.trim().length > 0; })
      .map(function (rv, i) {
        const nm = (rv.author_name || 'Google user').trim();
        return {
          body: rv.text.trim(),
          name: nm,
          initials: nm.charAt(0).toUpperCase(),
          rating: rv.rating,
          when: rv.relative_time_description || '',
          color: COLORS[i % COLORS.length],
        };
      });

    return res.status(200).json({
      ok: true,
      rating: { avg: r.rating || null, total: r.user_ratings_total || null },
      url: r.url || ('https://www.google.com/maps/place/?q=place_id:' + placeId),
      reviews: reviews,
    });
  } catch (e) {
    return res.status(200).json({ ok: false, reason: 'error', reviews: [] });
  }
};
