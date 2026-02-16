/**
 * QR Code API
 * GET /api/qr?code=xxx&size=300
 */

export default async function handler(req, res) {
  try {
    const { code, size = 300 } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Build short URL
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const shortUrl = `${protocol}://${host}/s/${code}`;

    // Generate QR code using external API (no library needed!)
    const qrSize = Math.min(Math.max(parseInt(size), 100), 1000);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(shortUrl)}`;

    // Fetch QR code
    const response = await fetch(qrUrl);
    
    if (!response.ok) {
      throw new Error('QR generation failed');
    }

    // Get image buffer
    const buffer = await response.arrayBuffer();

    // Set headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Send image
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('QR code error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
