import { NextResponse } from 'next/server';

export async function GET() {
  const preview = process.env.VERCEL_ENV === 'preview';
  const merchantConfigured = preview
    ? true
    : Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY && process.env.PAYFAST_PASSPHRASE);
  const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const price = process.env.OOVIQ_PRO_PRICE || '49.00';
  const priceValid = /^\d+\.\d{2}$/.test(price) && Number(price) >= 5;
  const ipProtectionConfigured = preview || Boolean(process.env.PAYFAST_ALLOWED_IPS);

  const checks = {
    merchantConfigured,
    priceValid,
    ipProtectionConfigured,
    supabaseConfigured,
  };

  const ready = Object.values(checks).every(Boolean);

  return NextResponse.json({
    status: ready ? 'ok' : 'not_ready',
    mode: preview ? 'sandbox-preview' : 'live-production',
    price,
    checks,
  }, { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
