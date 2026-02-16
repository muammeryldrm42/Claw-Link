/**
 * Analytics API
 * GET /api/analytics?code=xxx
 */

import { getLink, getAnalytics } from '../lib/storage.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Get link data
    const linkData = await getLink(code);

    if (!linkData) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get analytics
    const analytics = await getAnalytics(code);

    // Process analytics
    const processed = processAnalytics(analytics);

    return res.status(200).json({
      success: true,
      data: {
        code,
        url: linkData.url,
        createdAt: linkData.createdAt,
        totalClicks: analytics.length,
        analytics: processed,
        recentClicks: analytics.slice(-10).reverse()
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Process analytics data
 */
function processAnalytics(analytics) {
  if (!analytics || analytics.length === 0) {
    return {
      byDate: {},
      byCountry: {},
      byReferrer: {},
      byBrowser: {},
      byDevice: {}
    };
  }

  const byDate = {};
  const byCountry = {};
  const byReferrer = {};
  const byBrowser = {};
  const byDevice = {};

  analytics.forEach(click => {
    // By date
    const date = click.timestamp.split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;

    // By country
    const country = click.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;

    // By referrer
    const referrer = extractDomain(click.referrer);
    byReferrer[referrer] = (byReferrer[referrer] || 0) + 1;

    // By browser
    const browser = detectBrowser(click.userAgent);
    byBrowser[browser] = (byBrowser[browser] || 0) + 1;

    // By device
    const device = detectDevice(click.userAgent);
    byDevice[device] = (byDevice[device] || 0) + 1;
  });

  return {
    byDate: sortObject(byDate),
    byCountry: sortObject(byCountry),
    byReferrer: sortObject(byReferrer),
    byBrowser: sortObject(byBrowser),
    byDevice: sortObject(byDevice)
  };
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  if (!url || url === 'direct') return 'Direct';
  
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Direct';
  }
}

/**
 * Detect browser from user agent
 */
function detectBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  
  return 'Other';
}

/**
 * Detect device from user agent
 */
function detectDevice(userAgent) {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile')) return 'Mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
  
  return 'Desktop';
}

/**
 * Sort object by value (descending)
 */
function sortObject(obj) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}
