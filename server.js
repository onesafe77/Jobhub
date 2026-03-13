const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Proxy requests to Midtrans Snap API
app.use('/snap/v1/transactions', createProxyMiddleware({
    target: 'https://app.sandbox.midtrans.com',
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Requesting Midtrans Snap:', req.url);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('[Proxy] Midtrans Response status:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
        console.error('[Proxy] Error:', err);
    }
}));

// Proxy requests to Midtrans Status API
app.use('/v2/status', createProxyMiddleware({
    target: 'https://api.sandbox.midtrans.com',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/v2/status': '/v2'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Requesting Midtrans Status:', req.url);
    }
}));

// Proxy requests to Duitku (Forward compatibility if needed)
app.use('/webapi/api/merchant/v2', createProxyMiddleware({
    target: 'https://sandbox.duitku.com',
    changeOrigin: true,
    secure: false
}));

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: Send all other requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Proxying /snap/v1/transactions to Midtrans`);
});
