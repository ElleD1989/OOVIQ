# OOVIQ Pro payments

OOVIQ Pro is priced at R49/month and uses Payfast recurring billing.

## Production setup

Add these environment variables to the Vercel project:

- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `PAYFAST_URL=https://www.payfast.co.za/eng/process`
- `SUPABASE_URL=https://nerflcrkjfhcjuperajn.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the Payfast merchant key, passphrase, or Supabase service-role key in client-side code.

## Payfast configuration

Set the Payfast merchant credentials and recurring-billing passphrase in the Payfast dashboard. The app sends the Payfast ITN to `/api/payfast/notify` and verifies the merchant ID, signature and expected R49.00 amount before recording an active subscription.

For sandbox testing, use Payfast's sandbox credentials and set `PAYFAST_URL=https://sandbox.payfast.co.za/eng/process`.

## Launch checklist

1. Create/activate the Payfast merchant account.
2. Enable recurring billing.
3. Add the six environment variables in Vercel.
4. Deploy and complete a sandbox subscription test.
5. Confirm the subscription appears in Supabase.
6. Switch credentials and `PAYFAST_URL` to production.
7. Complete one small live transaction before public launch.
