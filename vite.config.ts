import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
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
          target: 'https://app.sandbox.midtrans.com',
          changeOrigin: true,
          secure: false,
        },
        '/v2/status': {
          target: 'https://api.sandbox.midtrans.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/v2\/status/, '/v2')
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
