/**
 * Navigation content. Every label and destination on the bar lives here.
 * Links marked PLACEHOLDER have no destination yet.
 */

import { site } from '@/lib/site'

export const PLACEHOLDER = '#'

export const brand = {
  name: 'Mesub',
  tagline: 'Recurring payments on Solana, connected to product access.',
}

export interface NavLink {
  href: string
  label: string
}

/* The sections live on the landing page, so the hrefs are absolute: a bare
   fragment would do nothing on /waitlist or any other route. */
export const links: NavLink[] = [
  { label: 'Product', href: `${site.home}#product` },
  { label: 'Developers', href: `${site.home}#developers` },
  { label: 'FAQ', href: `${site.home}#faq` },
]

export const cta = { label: 'Join waitlist', href: '/waitlist' }

export const contact = {
  email: { address: 'contact@mesub.io', href: 'mailto:contact@mesub.io', label: 'Email us' },
  x: { handle: '@mesub_io', href: 'https://x.com/mesub_io', label: 'Mesub on X' },
}
