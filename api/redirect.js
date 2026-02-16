/**
 * Redirect API
 * GET /api/redirect?code=xxx
 */

import { getLink, incrementClicks } from '../lib/storage.js';

export default async function handler(req, res) {
  try {
    const { code, password } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Get link data
    const linkData = await getLink(code);

    if (!linkData) {
      // Redirect to 404 page
      return res.redirect(302, '/?error=notfound');
    }

    // Check password if required
    if (linkData.password) {
      if (!password || password !== linkData.password) {
        // Redirect to password page
        return res.redirect(302, `/?code=${code}&password=required`);
      }
    }

    // Collect analytics
    const analyticsData = {
      timestamp: new Date().toISOString(),
      referrer: req.headers.referer || req.headers.referrer || 'direct',
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      country: req.headers['x-vercel-ip-country'] || 'unknown',
      city: req.headers['x-vercel-ip-city'] || 'unknown'
    };

    // Increment clicks (async, don't wait)
    incrementClicks(code, analyticsData).catch(err => 
      console.error('Analytics error:', err)
    );

    // Redirect to original URL
    return res.redirect(302, linkData.url);

  } catch (error) {
    console.error('Redirect error:', error);
    return res.redirect(302, '/?error=servererror');
  }
}
