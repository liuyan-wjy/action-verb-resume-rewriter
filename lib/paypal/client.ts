const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

function getPayPalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client credentials are not configured.');
  }

  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getPayPalConfig();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token.');
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createOrder(params: {
  packageId: string;
  credits: number;
  price: number;
  userId: string;
}) {
  const accessToken = await getAccessToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.userId,
          description: `${params.credits} PowerVerb credits`,
          custom_id: JSON.stringify({
            packageId: params.packageId,
            userId: params.userId,
            credits: params.credits
          }),
          amount: {
            currency_code: 'USD',
            value: params.price.toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'PowerVerb',
        user_action: 'PAY_NOW',
        return_url: `${appUrl}/payment/success`,
        cancel_url: `${appUrl}/pricing`
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal order: ${error}`);
  }

  const data = (await response.json()) as {
    id: string;
    links: Array<{ rel: string; href: string }>;
  };

  return {
    orderId: data.id,
    approveUrl: data.links.find((link) => link.rel === 'approve')?.href
  };
}

export async function captureOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to capture PayPal order: ${error}`);
  }

  const data = (await response.json()) as {
    status: string;
    purchase_units?: Array<{
      custom_id?: string;
      payments?: { captures?: Array<{ id: string }> };
    }>;
  };

  return {
    status: data.status,
    captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    customId: data.purchase_units?.[0]?.custom_id
  };
}

export async function createSubscription(params: { userId: string; planId: string }) {
  const accessToken = await getAccessToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_id: params.planId,
      custom_id: params.userId,
      application_context: {
        brand_name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'PowerVerb',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${appUrl}/subscription/success`,
        cancel_url: `${appUrl}/pricing`
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subscription: ${error}`);
  }

  const data = (await response.json()) as {
    id: string;
    links: Array<{ rel: string; href: string }>;
  };

  return {
    subscriptionId: data.id,
    approveUrl: data.links.find((link) => link.rel === 'approve')?.href
  };
}

export async function verifyWebhookSignature(params: {
  headers: {
    authAlgo: string | null;
    certUrl: string | null;
    transmissionId: string | null;
    transmissionSig: string | null;
    transmissionTime: string | null;
  };
  body: unknown;
}) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error('PAYPAL_WEBHOOK_ID is not configured.');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth_algo: params.headers.authAlgo,
      cert_url: params.headers.certUrl,
      transmission_id: params.headers.transmissionId,
      transmission_sig: params.headers.transmissionSig,
      transmission_time: params.headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: params.body
    })
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === 'SUCCESS';
}
