const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Helper to get Midtrans Auth Header
const getMidtransAuth = () => {
    const serverKey = process.env.VITE_MIDTRANS_SERVER_KEY || '';
    return Buffer.from(serverKey.trim() + ":").toString('base64');
};

// Proxy requests to Midtrans Snap API (Securely)
app.use('/snap/v1/transactions', createProxyMiddleware({
    target: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/snap/v1/transactions': ''
    },
    onProxyReq: (proxyReq, req, res) => {
        const auth = getMidtransAuth();
        proxyReq.setHeader('Authorization', `Basic ${auth}`);
        console.log('[Proxy] Securely requesting Midtrans Snap');
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('[Proxy] Midtrans Response status:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
        console.error('[Proxy] Error:', err);
    }
}));

// Proxy requests to Midtrans Status API (Securely)
app.use('/v2/status', createProxyMiddleware({
    target: 'https://api.sandbox.midtrans.com/v2',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/v2/status': ''
    },
    onProxyReq: (proxyReq, req, res) => {
        const auth = getMidtransAuth();
        proxyReq.setHeader('Authorization', `Basic ${auth}`);
        console.log('[Proxy] Securely requesting Midtrans Status');
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
