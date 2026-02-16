/**
 * Create Short Link API
 * Endpoint: POST /api/shorten
 */

import { saveLink, findByUrl } from '../lib/storage.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, customCode, metadata } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL already exists
    const existing = await findByUrl(url);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'URL already shortened',
        data: {
          shortUrl: `${getBaseUrl(req)}/s/${existing.code}`,
          code: existing.code,
          originalUrl: existing.url,
          qrCode: `${getBaseUrl(req)}/api/qr?code=${existing.code}`,
          clicks: existing.clicks || 0,
          createdAt: existing.createdAt
        }
      });
    }

    // Generate or validate custom code
    let code = customCode;
    if (code) {
      // Validate custom code
      if (!isValidCode(code)) {
        return res.status(400).json({ 
          error: 'Invalid custom code. Use 3-20 alphanumeric characters.' 
        });
      }

      // Check if code is taken
      const existingCode = await import('../lib/storage.js').then(m => m.getLink(code));
      if (existingCode) {
        return res.status(409).json({ error: 'Custom code already taken' });
      }
    } else {
      // Generate random code
      code = generateCode();
    }

    // Save link
    const linkData = await saveLink(code, url, metadata);

    // Return response
    return res.status(201).json({
      success: true,
      message: 'Link shortened successfully',
      data: {
        shortUrl: `${getBaseUrl(req)}/s/${code}`,
        code: code,
        originalUrl: url,
        qrCode: `${getBaseUrl(req)}/api/qr?code=${code}`,
        clicks: 0,
        createdAt: linkData.createdAt
      }
    });

  } catch (error) {
    console.error('Shorten error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * Validate URL
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate custom code
 */
function isValidCode(code) {
  return /^[a-zA-Z0-9]{3,20}$/.test(code);
}

/**
 * Generate random code
 */
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get base URL
 */
function getBaseUrl(req) {
  const host = req.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
