/**
 * Storage Utility
 * Uses Vercel KV if available, otherwise in-memory storage
 */

// In-memory storage (fallback)
const memoryStore = new Map();
const memoryAnalytics = new Map();

/**
 * Check if Vercel KV is available
 */
function hasKV() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Get KV client (if available)
 */
async function getKV() {
  if (!hasKV()) return null;
  
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch (error) {
    console.warn('KV not available, using in-memory storage');
    return null;
  }
}

/**
 * Set link data
 */
export async function setLink(code, data) {
  const kvClient = await getKV();
  
  if (kvClient) {
    await kvClient.set(`link:${code}`, JSON.stringify(data));
    return true;
  }
  
  // Fallback to memory
  memoryStore.set(`link:${code}`, data);
  return true;
}

/**
 * Get link data
 */
export async function getLink(code) {
  const kvClient = await getKV();
  
  if (kvClient) {
    const data = await kvClient.get(`link:${code}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  }
  
  // Fallback to memory
  return memoryStore.get(`link:${code}`) || null;
}

/**
 * Delete link
 */
export async function deleteLink(code) {
  const kvClient = await getKV();
  
  if (kvClient) {
    await kvClient.del(`link:${code}`);
    return true;
  }
  
  // Fallback to memory
  memoryStore.delete(`link:${code}`);
  return true;
}

/**
 * Increment click count
 */
export async function incrementClicks(code, analyticsData) {
  const kvClient = await getKV();
  
  if (kvClient) {
    // Get current analytics
    const current = await kvClient.get(`analytics:${code}`) || [];
    const analytics = typeof current === 'string' ? JSON.parse(current) : current;
    
    // Add new click
    analytics.push(analyticsData);
    
    // Keep only last 1000 clicks
    if (analytics.length > 1000) {
      analytics.shift();
    }
    
    await kvClient.set(`analytics:${code}`, JSON.stringify(analytics));
    return true;
  }
  
  // Fallback to memory
  const current = memoryAnalytics.get(`analytics:${code}`) || [];
  current.push(analyticsData);
  
  if (current.length > 1000) {
    current.shift();
  }
  
  memoryAnalytics.set(`analytics:${code}`, current);
  return true;
}

/**
 * Get analytics
 */
export async function getAnalytics(code) {
  const kvClient = await getKV();
  
  if (kvClient) {
    const data = await kvClient.get(`analytics:${code}`) || [];
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
  
  // Fallback to memory
  return memoryAnalytics.get(`analytics:${code}`) || [];
}

/**
 * List all links (limited)
 */
export async function listLinks() {
  const kvClient = await getKV();
  
  if (kvClient) {
    // KV doesn't have list by default, so we store a list
    const list = await kvClient.get('links:list') || [];
    return typeof list === 'string' ? JSON.parse(list) : list;
  }
  
  // Fallback to memory
  const links = [];
  for (const [key, value] of memoryStore.entries()) {
    if (key.startsWith('link:')) {
      const code = key.replace('link:', '');
      links.push({ code, ...value });
    }
  }
  return links;
}

/**
 * Add to links list
 */
export async function addToList(code) {
  const kvClient = await getKV();
  
  if (kvClient) {
    const list = await kvClient.get('links:list') || [];
    const links = typeof list === 'string' ? JSON.parse(list) : list;
    
    if (!links.includes(code)) {
      links.push(code);
      await kvClient.set('links:list', JSON.stringify(links));
    }
  }
  
  // Memory doesn't need this
}

/**
 * Remove from links list
 */
export async function removeFromList(code) {
  const kvClient = await getKV();
  
  if (kvClient) {
    const list = await kvClient.get('links:list') || [];
    const links = typeof list === 'string' ? JSON.parse(list) : list;
    const filtered = links.filter(c => c !== code);
    await kvClient.set('links:list', JSON.stringify(filtered));
  }
  
  // Memory doesn't need this
}
