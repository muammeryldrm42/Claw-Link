/**
 * Delete Link API
 * DELETE /api/delete?code=xxx
 */

import { getLink, deleteLink, removeFromList } from '../lib/storage.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Check if link exists
    const linkData = await getLink(code);

    if (!linkData) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Delete link
    await deleteLink(code);
    await removeFromList(code);

    return res.status(200).json({
      success: true,
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('Delete link error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
