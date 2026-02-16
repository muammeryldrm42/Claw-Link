# 🔗 Link Shortener + Analytics

Modern, fast, and feature-rich URL shortener with analytics, QR codes, custom slugs, and password protection.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/link-shortener)

![No API Key](https://img.shields.io/badge/API%20Key-Not%20Required-success)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![Analytics](https://img.shields.io/badge/Analytics-Built--in-blue)

## ✨ Features

### Core Features
- ⚡ **Instant Shortening** - Create short links in milliseconds
- 📊 **Detailed Analytics** - Track clicks, locations, referrers, browsers
- 📱 **QR Code Generation** - Automatic QR codes for every link
- 🔐 **Password Protection** - Secure your links with passwords
- 🎯 **Custom Short Codes** - Use your own custom slugs
- 💾 **No Database Required** - Uses Vercel KV or in-memory storage
- 🌐 **No API Keys Needed** - Works out of the box

### Analytics Features
- 📅 **Clicks by Date** - Daily click trends
- 🌍 **Geographic Data** - Country-based analytics
- 🔗 **Referrer Tracking** - See where clicks come from
- 💻 **Browser Stats** - Browser distribution
- 📱 **Device Types** - Mobile vs Desktop vs Tablet
- 🕒 **Real-time Updates** - Live click tracking

### UI/UX Features
- 🎨 **Modern Design** - Clean, gradient-based UI
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Fast Loading** - Optimized performance
- 🎯 **Easy to Use** - One-click copy, download QR
- ⌨️ **Keyboard Shortcuts** - Ctrl+Enter to shorten, Esc to reset

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/link-shortener)

1. Click the button above
2. Connect your GitHub account
3. Deploy! 🎉

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/link-shortener.git
cd link-shortener

# Install dependencies (optional for Vercel KV)
npm install

# Run local server
npx http-server public -p 3000

# Or with Vercel CLI
npm install -g vercel
vercel dev
```

Visit: http://localhost:3000

## 📦 What's Included?

```
link-shortener/
├── api/
│   ├── create.js       # Create short links
│   ├── redirect.js     # Redirect to original URL
│   ├── analytics.js    # Get analytics data
│   ├── qr.js           # Generate QR codes
│   └── delete.js       # Delete links
├── lib/
│   └── storage.js      # Storage abstraction (KV/Memory)
├── public/
│   ├── index.html      # Main page
│   ├── css/
│   │   └── style.css   # Styles
│   └── js/
│       └── app.js      # Frontend logic
├── vercel.json         # Vercel config
└── package.json
```

## 🎯 How to Use

### Create a Short Link

1. **Enter URL:** Paste your long URL
2. **Optional Settings:**
   - Custom code (e.g., `my-link`)
   - Password protection
3. **Click "Shorten URL"**
4. **Done!** Copy, share, or download QR code

### View Analytics

1. Click "View Analytics" button
2. See detailed stats:
   - Total clicks
   - Geographic distribution
   - Referrer sources
   - Browser/device breakdown
   - Recent clicks timeline

### URL Formats

```
# Auto-generated
https://your-app.vercel.app/s/aBcD12

# Custom slug
https://your-app.vercel.app/s/my-custom-link

# Password protected
https://your-app.vercel.app/s/secret123 (requires password)
```

## 📊 Analytics Dashboard

### Available Metrics

- **Total Clicks** - Overall click count
- **Clicks by Date** - Daily trends
- **Countries** - Geographic distribution
- **Referrers** - Traffic sources
- **Browsers** - Chrome, Safari, Firefox, etc.
- **Devices** - Mobile, Desktop, Tablet
- **Recent Activity** - Last 10 clicks with details

### Data Collected

Each click records:
- Timestamp
- Country & city (from IP)
- Referrer URL
- User agent (browser/device)
- IP address (hashed for privacy)

## 🔐 Password Protection

### How It Works

1. Enter password when creating link
2. Visitors must enter password to access
3. Password is stored securely
4. No password = no access

### Use Cases

- Confidential documents
- Private event links
- Team-only resources
- Beta testing pages

## 📱 QR Code Features

### Auto-Generated

Every short link gets a QR code automatically:
- High quality (300x300px)
- PNG format
- Downloadable
- Scannable from any device

### QR Code API

```bash
# Get QR code for a short link
GET /api/qr?code=abc123&size=500

# Parameters:
# - code: Short code (required)
# - size: Image size (100-1000, default: 300)
```

## 🛠️ Storage Options

### Option 1: Vercel KV (Recommended)

**Persistent storage with Vercel KV:**

1. Create Vercel KV store in dashboard
2. Connect to your project
3. Environment variables auto-configured
4. Done! Links persist forever

### Option 2: In-Memory (Default)

**Works immediately, no setup:**

- No configuration needed
- Perfect for testing
- Data resets on restart
- Free forever

## ⚙️ Configuration

### Environment Variables (Optional)

```env
# Vercel KV (optional, for persistent storage)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

### Custom Domain (Optional)

1. Add domain in Vercel dashboard
2. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
3. SSL auto-configured by Vercel

## 📡 API Reference

### Create Short Link

```bash
POST /api/create
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "customCode": "my-link",      # Optional
  "password": "secret123"       # Optional
}

# Response:
{
  "success": true,
  "data": {
    "code": "my-link",
    "shortUrl": "https://your-app.vercel.app/s/my-link",
    "originalUrl": "https://example.com/very/long/url",
    "createdAt": "2026-02-16T10:00:00.000Z",
    "hasPassword": true
  }
}
```

### Get Analytics

```bash
GET /api/analytics?code=abc123

# Response:
{
  "success": true,
  "data": {
    "code": "abc123",
    "url": "https://example.com",
    "totalClicks": 42,
    "analytics": {
      "byDate": { "2026-02-16": 10, ... },
      "byCountry": { "US": 20, "UK": 15, ... },
      "byReferrer": { "twitter.com": 25, ... },
      "byBrowser": { "Chrome": 30, ... },
      "byDevice": { "Mobile": 25, "Desktop": 17 }
    },
    "recentClicks": [...]
  }
}
```

### Generate QR Code

```bash
GET /api/qr?code=abc123&size=500

# Returns PNG image
```

### Delete Link

```bash
DELETE /api/delete?code=abc123

# Response:
{
  "success": true,
  "message": "Link deleted successfully"
}
```

## 🎨 Customization

### Colors & Theme

Edit `public/css/style.css`:

```css
/* Change gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Green theme example */
background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
```

### Short Code Length

Edit `api/create.js`:

```javascript
// Change default length (line ~97)
function generateCode(length = 6) {
  // Change 6 to your preferred length
}
```

### Link Expiration (Optional)

Add TTL to Vercel KV:

```javascript
// In storage.js
await kv.set(`link:${code}`, data, {
  ex: 86400 * 30  // 30 days in seconds
});
```

## 📈 Performance

- **First Load:** ~300ms
- **API Response:** ~50-100ms
- **QR Generation:** ~200ms
- **Analytics Query:** ~100ms

### Optimization Tips

- Use Vercel Edge Functions (Pro)
- Enable caching headers
- Compress images
- Minify CSS/JS

## 🔒 Security Features

- ✅ CORS configured
- ✅ Input validation
- ✅ Password hashing
- ✅ Rate limiting (via Vercel)
- ✅ XSS protection
- ✅ No SQL injection (NoSQL)

## 🐛 Troubleshooting

### Link Not Working

**Problem:** 404 error when clicking short link

**Solutions:**
- Check if link was created successfully
- Verify storage is working (KV or memory)
- Check Vercel deployment logs

### Analytics Not Loading

**Problem:** Analytics show "No data"

**Solutions:**
- Wait for first click to register
- Check browser console for errors
- Verify analytics API endpoint

### QR Code Not Generating

**Problem:** QR code image broken

**Solutions:**
- Check internet connection (uses external API)
- Verify short code is valid
- Try different size parameter

## 📚 Examples

### Basic Link

```javascript
// Create
POST /api/create
{ "url": "https://github.com/user/repo" }

// Use
https://your-app.vercel.app/s/aBcD12
```

### Custom Slug

```javascript
// Create
POST /api/create
{
  "url": "https://docs.example.com",
  "customCode": "docs"
}

// Use
https://your-app.vercel.app/s/docs
```

### Protected Link

```javascript
// Create
POST /api/create
{
  "url": "https://private.example.com",
  "customCode": "secret",
  "password": "mypassword"
}

// Use (password required)
https://your-app.vercel.app/s/secret
```

## 🚀 Advanced Features

### Webhook Integration

Add webhooks for click events:

```javascript
// In api/redirect.js
await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  body: JSON.stringify({ code, timestamp, ... })
});
```

### Custom Domains

Use your own domain:
```
your-domain.com/s/abc123
```

### API Authentication (Optional)

Add API keys for create endpoint:

```javascript
// In api/create.js
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Credits

- **QR Codes:** [QR Server API](https://goqr.me/api/)
- **Hosting:** [Vercel](https://vercel.com)
- **Icons:** Emoji

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📮 Support

- 🐛 **Bug Reports:** Open an issue
- 💡 **Feature Requests:** Open an issue
- ⭐ **Star the repo** if you like it!

---

**Made with ❤️ • No API Keys Required • Deploy in 30 seconds**

**Live Demo:** https://your-app.vercel.app
