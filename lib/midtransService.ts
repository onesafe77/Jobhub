/**
 * Midtrans Service (Sandbox Mode)
 * Note: In a production environment, Server Key should NEVER be exposed on the frontend.
 * This implementation uses the Vite proxy to call Midtrans APIs.
 */

const CLIENT_KEY = (import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXXX').trim();
const SERVER_KEY = (import.meta.env.VITE_MIDTRANS_SERVER_KEY || '').trim();
const MIDTRANS_ENV = (import.meta.env.VITE_MIDTRANS_ENV || 'sandbox').toLowerCase();
const IS_PRODUCTION = MIDTRANS_ENV === 'production';

const MIDTRANS_SNAP_URL = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

const BASE_URL = '/snap/v1/transactions';

export interface MidtransTransactionRequest {
    orderId: string;
    grossAmount: number;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
}

export interface MidtransSnapResponse {
    token: string;
    redirect_url: string;
}

export const midtransService = {
    /**
     * Generate Snap Token for checkout
     */
    async createSnapToken(request: MidtransTransactionRequest): Promise<MidtransSnapResponse> {
        const payload = {
            transaction_details: {
                order_id: request.orderId,
                gross_amount: request.grossAmount
            },
            customer_details: {
                first_name: request.firstName,
                last_name: request.lastName || '',
                email: request.email,
                phone: request.phone || ''
            },
            credit_card: {
                secure: true
            }
        };

        console.log('[Midtrans] Creating Snap Token...', payload);

        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Midtrans API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('[Midtrans] Snap Response:', data);
            return data as MidtransSnapResponse;
        } catch (error) {
            console.error('[Midtrans Service] Error:', error);
            throw error;
        }
    },

    /**
     * Load Snap.js script dynamically
     */
    async loadSnapScript(): Promise<void> {
        return new Promise((resolve) => {
            if (document.getElementById('midtrans-snap-script')) {
                const existingScript = document.getElementById('midtrans-snap-script') as HTMLScriptElement;
                if (existingScript.src === MIDTRANS_SNAP_URL) {
                    resolve();
                    return;
                }
                existingScript.remove();
            }
            const script = document.createElement('script');
            script.id = 'midtrans-snap-script';
            script.src = MIDTRANS_SNAP_URL;
            script.setAttribute('data-client-key', CLIENT_KEY);
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    },

    /**
     * Check transaction status
     */
    async checkStatus(orderId: string): Promise<any> {
        const statusUrl = `/v2/status/${orderId}/status`;

        try {
            const response = await fetch(statusUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Midtrans Status API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('[Midtrans] Status Data:', data);
            return data;
        } catch (error) {
            console.error('[Midtrans Service] Check Status Error:', error);
            throw error;
        }
    }
};
