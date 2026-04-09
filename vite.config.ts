import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');

  const serverKey = (env.VITE_MIDTRANS_SERVER_KEY || '').trim();
  // Gunakan variabel eksplisit, default ke sandbox jika di localhost
  const midtransEnv = (env.VITE_MIDTRANS_ENV || 'sandbox').toLowerCase();
  const isProd = midtransEnv === 'production';

  const snapTarget = isProd ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
  const apiTarget = isProd ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';

  const prodDomain = env.VITE_PRODUCTION_DOMAIN || 'https://jobhub-production-691e.up.railway.app';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/webapi/api/merchant/v2/inquiry': {
          target: 'https://sandbox.duitku.com',
          changeOrigin: true,
          secure: false,
        },
        '/webapi/api/merchant/v2/transactionStatus': {
          target: 'https://sandbox.duitku.com',
          changeOrigin: true,
          secure: false,
        },
        '/snap/v1/transactions': {
          target: isProd ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/snap\/v1\/transactions/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const auth = Buffer.from(serverKey + ":").toString('base64');
              proxyReq.setHeader('Authorization', `Basic ${auth}`);
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');

              if (isProd) {
                proxyReq.setHeader('Origin', prodDomain);
                proxyReq.setHeader('Referer', prodDomain + '/');
              }

            });
          }
        },
        '/v2/status': {
          target: isProd ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/v2\/status/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const auth = Buffer.from(serverKey + ":").toString('base64');
              proxyReq.setHeader('Authorization', `Basic ${auth}`);
              proxyReq.setHeader('Accept', 'application/json');
            });
          }
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
