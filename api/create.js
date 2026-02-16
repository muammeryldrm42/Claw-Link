/**
 * Create Short Link API
 * POST /api/create
 */

import { setLink, getLink, addToList } from '../lib/storage.js';

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
    const { url, customCode, password } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidURL(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate or use custom code
    let code = customCode;
    
    if (customCode) {
      // Validate custom code
      if (!isValidCode(customCode)) {
        return res.status(400).json({ 
          error: 'Invalid custom code. Use only letters, numbers, dash, and underscore (3-20 chars)' 
        });
      }

      // Check if already exists
      const existing = await getLink(customCode);
      if (existing) {
        return res.status(409).json({ error: 'Custom code already exists' });
      }
    } else {
      // Generate random code
      code = generateCode();
      
      // Ensure uniqueness
      let attempts = 0;
      while (await getLink(code) && attempts < 10) {
        code = generateCode();
        attempts++;
      }
    }

    // Create link data
    const linkData = {
      url,
      code,
      createdAt: new Date().toISOString(),
      clicks: 0,
      password: password || null
    };

    // Save to storage
    await setLink(code, linkData);
    await addToList(code);

    // Get host for short URL
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const shortUrl = `${protocol}://${host}/s/${code}`;

    return res.status(201).json({
      success: true,
      data: {
        code,
        shortUrl,
        originalUrl: url,
        createdAt: linkData.createdAt,
        hasPassword: !!password
      }
    });

  } catch (error) {
    console.error('Create link error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Validate URL
 */
function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate custom code
 */
function isValidCode(code) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
}

/**
 * Generate random code
 */
function generateCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
