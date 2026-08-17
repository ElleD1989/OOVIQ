import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';

const PAYFAST_URL = process.env.PAYFAST_URL || 'https://www.payfast.co.za/eng/process';
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PRICE = process.env.OOVIQ_PRO_PRICE || '49.00';

function encode(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, '+');
}

function signature(data: Record<string, string>) {
  const pairs = Object.entries(data)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key}=${encode(value)}`);
  const payload = `${pairs.join('&')}&passphrase=${encode(PASSPHRASE)}`;
  return createHash('md5').update(payload).digest('hex');
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

function validPrice(value: string) {
  return /^\d+\.\d{2}$/.test(value) && Number(value) >= 5;
}

export async function GET(request: NextRequest) {
  if (!MERCHANT_ID || !MERCHANT_KEY || !PASSPHRASE) {
    return new Response('OOVIQ Pro payments are being connected. Please try again shortly.', { status: 503 });
  }

  if (!validPrice(PRICE)) {
    return new Response('OOVIQ Pro payment configuration is invalid.', { status: 500 });
  }

  const email = (request.nextUrl.searchParams.get('email') || '').trim();
  if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('A valid email address is required.', { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const paymentId = `ooviq-pro-${crypto.randomUUID()}`;
  const data: Record<string, string> = {
    merchant_id: MERCHANT_ID,
    merchant_key: MERCHANT_KEY,
    return_url: `${origin}/?payment=success`,
    cancel_url: `${origin}/?payment=cancelled`,
    notify_url: `${origin}/api/payfast/notify`,
    email_address: email,
    m_payment_id: paymentId,
    amount: PRICE,
    item_name: 'OOVIQ Pro',
    item_description: 'OOVIQ Pro monthly membership',
    subscription_type: '1',
    recurring_amount: PRICE,
    frequency: '3',
    cycles: '0',
    subscription_notify_email: 'true',
    subscription_notify_webhook: 'true',
    subscription_notify_buyer: 'true',
  };

  const fields = Object.entries({ ...data, signature: signature(data) })
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Secure OOVIQ Pro Checkout</title></head><body><p>Taking you to secure checkout…</p><form id="payfast" method="post" action="${escapeHtml(PAYFAST_URL)}">${fields}</form><script>document.getElementById('payfast').submit()</script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
