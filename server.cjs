const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Helper to get Midtrans Environment and Auth
const getMidtransConfig = () => {
    const serverKey = (process.env.VITE_MIDTRANS_SERVER_KEY || '').trim();
    const midtransEnv = (process.env.VITE_MIDTRANS_ENV || 'sandbox').toLowerCase();
    const isProduction = midtransEnv === 'production';
    const auth = Buffer.from(serverKey + ":").toString('base64');

    return {
        isProduction,
        auth,
        snapTarget: isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
        apiTarget: isProduction ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2'
    };
};

// Proxy requests to Midtrans Snap API (Securely)
app.use('/snap/v1/transactions', (req, res, next) => {
    const config = getMidtransConfig();
    createProxyMiddleware({
        target: config.snapTarget,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
            '^/snap/v1/transactions': ''
        },
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('Authorization', `Basic ${config.auth}`);
            console.log(`[Proxy] Requesting Snap (${config.isProduction ? 'PROD' : 'SB'})`);
        }
    })(req, res, next);
});

// Proxy requests to Midtrans Status API (Securely)
app.use('/v2/status', (req, res, next) => {
    const config = getMidtransConfig();
    createProxyMiddleware({
        target: config.apiTarget,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
            '^/v2/status': ''
        },
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('Authorization', `Basic ${config.auth}`);
            console.log(`[Proxy] Requesting Status (${config.isProduction ? 'PROD' : 'SB'})`);
        }
    })(req, res, next);
});

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
