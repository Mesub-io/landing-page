/**
 * Navigation content. Every label and destination on the bar lives here.
 * Links marked PLACEHOLDER have no destination yet.
 */

export const PLACEHOLDER = '#'

export const brand = {
  name: 'Mesub',
  tagline: 'Recurring payments on Solana, connected to product access.',
}

export interface NavLink {
  href: string
  label: string
}

export const links: NavLink[] = [
  { label: 'Product', href: PLACEHOLDER },
  { label: 'Developers', href: PLACEHOLDER },
  { label: 'Resources', href: PLACEHOLDER },
]

export const cta = { label: 'Join waitlist', href: PLACEHOLDER }
