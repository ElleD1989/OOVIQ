'use client';

import { useState } from 'react';

const checkoutUrl = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL;

export function OoviqMonetization() {
  const [open, setOpen] = useState(false);

  function handleCta() {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <aside className="pro-bar" aria-label="OOVIQ Pro offer">
        <div>
          <strong>OOVIQ Pro</strong>
          <span>Unlimited use + saved history + premium tools</span>
        </div>
        <button type="button" className="pro-cta" onClick={handleCta}>
          Founding price: R49/mo →
        </button>
      </aside>

      {open && (
        <div className="pro-overlay" role="dialog" aria-modal="true" aria-labelledby="pro-title">
          <div className="pro-modal">
            <button type="button" className="pro-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <p className="eyebrow">FOUNDING OFFER</p>
            <h2 id="pro-title">Make OOVIQ your everyday shortcut.</h2>
            <p>We are testing the first paid OOVIQ plan at <strong>R49/month</strong>.</p>
            <ul>
              <li>Unlimited use of the core tools</li>
              <li>Saved history across devices</li>
              <li>Premium tools as they launch</li>
              <li>Founding-member pricing</li>
            </ul>
            <button type="button" className="pro-cta pro-modal-cta" onClick={() => setOpen(false)}>
              I want the founding plan
            </button>
            <small>Checkout is being connected next. This button currently measures genuine interest so we do not waste money building features nobody wants.</small>
          </div>
        </div>
      )}
    </>
  );
}
