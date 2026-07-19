export default async function handler(req, res) {
  // Vercel securely injects your environment variables here
  const supaUrl = process.env.VITE_SUPABASE_URL;
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // Fetch directly from the Supabase REST API
    const response = await fetch(`${supaUrl}/rest/v1/seo_settings?select=og_image_url&limit=1`, {
      headers: {
        'apikey': supaKey,
        'Authorization': `Bearer ${supaKey}`
      }
    });
    
    const data = await response.json();
    const imageUrl = data[0]?.og_image_url || 'https://bolt.new/static/og_default.png';

    // Issue a 302 Redirect to send the Telegram bot straight to your uploaded image
    res.redirect(302, imageUrl);
  } catch (error) {
    // Fallback in case of database downtime
    res.redirect(302, 'https://bolt.new/static/og_default.png');
  }
}