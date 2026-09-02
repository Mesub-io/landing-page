import type { Metadata } from 'next'

import { Logo } from '@/components/logo'
import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'
import { WaitlistForm } from '@/components/waitlist-form'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Join the waitlist',
  description: 'Get early access to Mesub, the billing layer for Solana subscriptions.',
  alternates: { canonical: '/waitlist' },
}

export default function WaitlistPage() {
  return (
    <>
      <SiteNav />
      <main className="wl" id="main">
        <div className="wl-inner">
          <div className="wl-copy">
            <Logo className="wl-mark" />
            <h1>Get early access.</h1>
            <p className="wl-sub">
              {site.name} is being built in the open, on top of the audited Solana Subscriptions program. Tell us how to
              reach you and we will let you know when you can wire it in.
            </p>
            <ul className="wl-points">
              <li>Early access to the SDK and the collection processor.</li>
              <li>A say in what ships first.</li>
              <li>No newsletter, no drip campaign.</li>
            </ul>
          </div>

          <div className="wl-panel">
            <WaitlistForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
