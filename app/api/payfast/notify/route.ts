import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';

function encode(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, '+');
}

function buildSignature(data: Record<string, string>) {
  const pairs = Object.entries(data)
    .filter(([key, value]) => key !== 'signature' && value !== '')
    .map(([key, value]) => `${key}=${encode(value)}`);
  const payload = PASSPHRASE ? `${pairs.join('&')}&passphrase=${encode(PASSPHRASE)}` : pairs.join('&');
  return createHash('md5').update(payload).digest('hex');
}

async function notifySupabase(payload: Record<string, string>) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      provider: 'payfast',
      provider_subscription_id: payload.token || null,
      status: payload.payment_status === 'COMPLETE' ? 'active' : payload.payment_status?.toLowerCase() || 'pending',
      plan_code: 'pro_monthly',
      customer_email: payload.email_address || null,
      current_period_end: payload.billing_date || null,
    }),
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const payload: Record<string, string> = {};
  form.forEach((value, key) => { payload[key] = String(value); });

  if (!MERCHANT_ID || !PASSPHRASE) return new Response('Not configured', { status: 503 });
  if (payload.merchant_id !== MERCHANT_ID) return new Response('Invalid merchant', { status: 400 });
  if (!payload.signature || buildSignature(payload) !== payload.signature) return new Response('Invalid signature', { status: 400 });
  if (payload.payment_status !== 'COMPLETE') return new Response('OK', { status: 200 });

  const expectedAmount = '49.00';
  if (Number(payload.amount_gross || 0).toFixed(2) !== expectedAmount) return new Response('Invalid amount', { status: 400 });

  try {
    await notifySupabase(payload);
  } catch {
    return new Response('Temporary processing error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
