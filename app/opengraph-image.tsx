import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { site } from '@/lib/site'

export const alt = 'Mesub — Billing layer for Solana subscriptions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** The share card, generated at build time — no design file to keep in sync. */
export default async function OpengraphImage() {
  // The mark is inlined: a generated image cannot fetch from a site that is
  // not serving yet, and CSS masks do not exist in this renderer.
  const mark = await readFile(join(process.cwd(), 'public/mesub-mark-paper.png'))
  const markSrc = `data:image/png;base64,${mark.toString('base64')}`

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
              borderRadius: 20,
              display: 'flex',
              height: 76,
              justifyContent: 'center',
              width: 76,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={markSrc} width={44} height={29} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>{site.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.05, maxWidth: 940 }}>
            Recurring revenue on Solana, without building the billing.
          </div>
          <div style={{ color: '#4a4f5a', fontSize: 28, lineHeight: 1.4, maxWidth: 900 }}>
            Scheduled collections, failed-payment retries, and access control in one subscription layer.
          </div>
        </div>

        <div style={{ color: '#767c88', display: 'flex', fontSize: 24, gap: 28 }}>
          <span>mesub.io</span>
          <span>·</span>
          <span>Built on the open-source-audited Solana Subscriptions program</span>
        </div>
      </div>
    ),
    size,
  )
}
