'use client';

import { useEffect } from 'react';

const SUPABASE_URL = 'https://nerflcrkjfhcjuperajn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_10ukPlxdkhwMdTTDOE4r3Q_h-bxwUbT';

const EVENT_URL = `${SUPABASE_URL}/rest/v1/ooviq_events`;

function getSessionId() {
  const key = 'ooviq_session_id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = `${crypto.randomUUID()}-${Date.now()}`;
  window.localStorage.setItem(key, id);
  return id;
}

function clean(value: string | null | undefined, max = 160) {
  return value?.replace(/\s+/g, ' ').trim().slice(0, max) || null;
}

function currentTool() {
  const selected = document.querySelector('.card.selected strong');
  return clean(selected?.textContent, 80);
}

function sendEvent(event: string, tool?: string | null, label?: string | null) {
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      session_id: getSessionId(),
      event: clean(event, 80),
      tool: clean(tool, 80),
      label: clean(label, 160),
      referrer: clean(document.referrer, 500),
      utm_source: clean(params.get('utm_source'), 120),
      utm_medium: clean(params.get('utm_medium'), 120),
      utm_campaign: clean(params.get('utm_campaign'), 160),
    };

    void fetch(EVENT_URL, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics must never interfere with the product.
  }
}

export function OoviqAnalytics() {
  useEffect(() => {
    sendEvent('page_view');

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const control = target?.closest('button, a, .card') as HTMLElement | null;
      if (!control) return;

      const label = clean(control.textContent, 160);
      const tool = control.classList.contains('card')
        ? clean(control.querySelector('strong')?.textContent, 80)
        : currentTool();

      if (control.classList.contains('pro-cta')) {
        sendEvent('pro_interest', null, label);
        return;
      }

      if (control.classList.contains('card')) {
        sendEvent('tool_select', tool, label);
        return;
      }

      if (control.classList.contains('share')) {
        sendEvent('share', tool, label);
        return;
      }

      const normalized = (label || '').toLowerCase();
      if (normalized.includes('run again') || normalized.includes('again')) {
        sendEvent('repeat_run', tool, label);
      } else if (
        normalized.includes('run') ||
        normalized.includes('generate') ||
        normalized.includes('decide') ||
        normalized.includes('split') ||
        normalized.includes('find')
      ) {
        sendEvent('tool_run', tool, label);
      } else {
        sendEvent('interaction', tool, label);
      }
    };

    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
