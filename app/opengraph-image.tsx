import { ImageResponse } from 'next/og'

import { site } from '@/lib/site'

export const alt = 'Mesub — Billing layer for Solana subscriptions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** The share card, generated at build time — no design file to keep in sync. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fbfaf7',
          color: '#14151a',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: '72px 80px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              alignItems: 'center',
              background: '#f46036',
              borderRadius: 18,
              color: '#fbfaf7',
              display: 'flex',
              fontSize: 44,
              fontWeight: 700,
              height: 76,
              justifyContent: 'center',
              width: 76,
            }}
          >
            m
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>{site.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.05, maxWidth: 940 }}>
            Recurring subscriptions for Solana products
          </div>
          <div style={{ color: '#4a4f5a', fontSize: 28, lineHeight: 1.4, maxWidth: 900 }}>
            Collect recurring payments and gate access without building billing infrastructure.
          </div>
        </div>

        <div style={{ color: '#767c88', display: 'flex', fontSize: 24, gap: 28 }}>
          <span>mesub.io</span>
          <span>·</span>
          <span>Built on the open-source Solana Subscriptions program</span>
        </div>
      </div>
    ),
    size,
  )
}
