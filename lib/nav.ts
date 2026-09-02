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

export const contact = {
  email: { address: 'contact@mesub.io', href: 'mailto:contact@mesub.io', label: 'Email us' },
  x: { handle: '@mesub_io', href: 'https://x.com/mesub_io', label: 'Mesub on X' },
}
