// Global state
let currentLink = null;

/**
 * Shorten URL
 */
async function shortenURL() {
    const url = document.getElementById('urlInput').value.trim();
    const customCode = document.getElementById('customCode').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate
    if (!url) {
        showError('Please enter a URL');
        return;
    }

    if (!isValidURL(url)) {
        showError('Please enter a valid URL (must start with http:// or https://)');
        return;
    }

    // Show loading
    showLoading();
    hideError();
    hideResult();
    hideAnalytics();

    try {
        const response = await fetch('/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                customCode: customCode || undefined,
                password: password || undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create short link');
        }

        // Save current link
        currentLink = data.data;

        // Display result
        displayResult(data.data);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Display result
 */
function displayResult(data) {
    document.getElementById('shortUrl').value = data.shortUrl;
    document.getElementById('originalUrl').href = data.originalUrl;
    document.getElementById('originalUrl').textContent = truncate(data.originalUrl, 50);
    document.getElementById('linkCode').textContent = data.code;
    document.getElementById('createdAt').textContent = new Date(data.createdAt).toLocaleString();

    // Load QR code
    const qrCode = document.getElementById('qrCode');
    qrCode.src = `/api/qr?code=${data.code}&size=300`;

    showResult();
}

/**
 * Copy to clipboard
 */
async function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl').value;
    
    try {
        await navigator.clipboard.writeText(shortUrl);
        
        // Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.style.background = '#38ef7d';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
        
    } catch (error) {
        // Fallback
        const input = document.getElementById('shortUrl');
        input.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
    }
}

/**
 * Download QR code
 */
async function downloadQR() {
    if (!currentLink) return;

    const qrImg = document.getElementById('qrCode');
    const link = document.createElement('a');
    link.href = qrImg.src;
    link.download = `qr-${currentLink.code}.png`;
    link.click();
}

/**
 * Show analytics
 */
async function showAnalytics() {
    if (!currentLink) return;

    hideResult();
    showLoading();

    try {
        const response = await fetch(`/api/analytics?code=${currentLink.code}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to load analytics');
        }

        displayAnalytics(data.data);

    } catch (error) {
        showError(error.message);
        showResult();
    } finally {
        hideLoading();
    }
}

/**
 * Display analytics
 */
function displayAnalytics(data) {
    // Stats
    renderStats(data);

    // Charts
    renderChart('dateChart', data.analytics.byDate);
    renderChart('countryChart', data.analytics.byCountry);
    renderChart('referrerChart', data.analytics.byReferrer);
    renderChart('browserChart', data.analytics.byBrowser);
    renderChart('deviceChart', data.analytics.byDevice);

    // Recent clicks
    renderRecentClicks(data.recentClicks);

    document.getElementById('analytics').style.display = 'block';
    document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render stats
 */
function renderStats(data) {
    const stats = [
        { label: 'Total Clicks', value: data.totalClicks, icon: '👆' },
        { label: 'Unique Countries', value: Object.keys(data.analytics.byCountry).length, icon: '🌍' },
        { label: 'Browsers', value: Object.keys(data.analytics.byBrowser).length, icon: '💻' },
        { label: 'Devices', value: Object.keys(data.analytics.byDevice).length, icon: '📱' }
    ];

    const html = stats.map(stat => `
        <div class="stat-box">
            <div class="stat-value">${stat.icon} ${stat.value.toLocaleString()}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    document.getElementById('statsGrid').innerHTML = html;
}

/**
 * Render chart
 */
function renderChart(elementId, data) {
    const entries = Object.entries(data);
    
    if (entries.length === 0) {
        document.getElementById(elementId).innerHTML = '<p style="text-align: center; color: #999;">No data yet</p>';
        return;
    }

    const max = Math.max(...entries.map(([, value]) => value));
    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    const html = entries.slice(0, 5).map(([key, value]) => {
        const percentage = ((value / max) * 100).toFixed(0);
        const share = ((value / total) * 100).toFixed(1);
        
        return `
            <div class="chart-item">
                <span class="chart-label">${truncate(key, 20)}</span>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${percentage}%">
                        ${share}%
                    </div>
                </div>
                <span class="chart-value">${value}</span>
            </div>
        `;
    }).join('');

    document.getElementById(elementId).innerHTML = html;
}

/**
 * Render recent clicks
 */
function renderRecentClicks(clicks) {
    if (!clicks || clicks.length === 0) {
        document.getElementById('recentClicks').innerHTML = '<p style="text-align: center; color: #999;">No clicks yet</p>';
        return;
    }

    const html = clicks.map(click => {
        const date = new Date(click.timestamp);
        const timeAgo = getTimeAgo(date);

        return `
            <div class="click-item">
                <div class="click-info">
                    <span class="click-detail">🌍 ${click.country || 'Unknown'}</span>
                    <span class="click-detail">🔗 ${truncate(click.referrer === 'direct' ? 'Direct' : click.referrer, 30)}</span>
                    <span class="click-detail">🕒 ${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('recentClicks').innerHTML = html;
}

/**
 * Hide analytics
 */
function hideAnalytics() {
    document.getElementById('analytics').style.display = 'none';
    showResult();
}

/**
 * Reset form
 */
function resetForm() {
    document.getElementById('urlInput').value = '';
    document.getElementById('customCode').value = '';
    document.getElementById('password').value = '';
    currentLink = null;
    hideResult();
    hideAnalytics();
    hideError();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus input
    document.getElementById('urlInput').focus();
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
 * Truncate text
 */
function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Get time ago
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Show/hide elements
 */
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function showResult() {
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

function hideResult() {
    document.getElementById('result').style.display = 'none';
}

/**
 * Handle URL parameters
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for errors
    const error = params.get('error');
    if (error === 'notfound') {
        showError('Link not found or expired');
    } else if (error === 'servererror') {
        showError('Server error occurred');
    }
    
    // Check for password required
    const code = params.get('code');
    const passwordRequired = params.get('password');
    
    if (code && passwordRequired === 'required') {
        const password = prompt('This link is password protected. Enter password:');
        if (password) {
            window.location.href = `/s/${code}?password=${encodeURIComponent(password)}`;
        }
    }
    
    // Focus input
    document.getElementById('urlInput').focus();
});

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to shorten
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        shortenURL();
    }
    
    // Escape to reset
    if (e.key === 'Escape') {
        if (document.getElementById('analytics').style.display === 'block') {
            hideAnalytics();
        } else if (document.getElementById('result').style.display === 'block') {
            resetForm();
        }
    }
});
