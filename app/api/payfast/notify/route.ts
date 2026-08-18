import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MERCHANT_ID = IS_PREVIEW ? '10000100' : process.env.PAYFAST_MERCHANT_ID || '';
const PASSPHRASE = IS_PREVIEW ? 'jt7NOE43FZPn' : process.env.PAYFAST_PASSPHRASE || '';
const EXPECTED_AMOUNT = process.env.OOVIQ_PRO_PRICE || '49.00';

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

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '';
}

function ipv4ToNumber(ip: string) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return parts.reduce((result, part) => result * 256 + part, 0);
}

function ipInCidr(ip: string, cidr: string) {
  const [network, prefixText] = cidr.split('/');
  const ipNumber = ipv4ToNumber(ip);
  const networkNumber = ipv4ToNumber(network);
  const prefix = Number(prefixText);
  if (ipNumber === null || networkNumber === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  if (prefix === 0) return true;
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  return (ipNumber >>> 0 & mask) === (networkNumber >>> 0 & mask);
}

function isAllowedPayfastIp(ip: string) {
  if (IS_PREVIEW) return true;
  const configured = (process.env.PAYFAST_ALLOWED_IPS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured.length === 0) return false;
  return configured.some((range) => ipInCidr(ip, range));
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
  if (!isAllowedPayfastIp(getClientIp(request))) return new Response('Invalid source', { status: 403 });
  if (payload.merchant_id !== MERCHANT_ID) return new Response('Invalid merchant', { status: 400 });
  if (!payload.signature || buildSignature(payload) !== payload.signature) return new Response('Invalid signature', { status: 400 });
  if (!payload.m_payment_id || !payload.email_address) return new Response('Invalid payment data', { status: 400 });
  if (payload.payment_status !== 'COMPLETE') return new Response('OK', { status: 200 });

  if (!/^\d+\.\d{2}$/.test(EXPECTED_AMOUNT)) return new Response('Invalid configuration', { status: 500 });
  if (Number(payload.amount_gross || 0).toFixed(2) !== EXPECTED_AMOUNT) return new Response('Invalid amount', { status: 400 });

  try {
    await notifySupabase(payload);
  } catch {
    return new Response('Temporary processing error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
