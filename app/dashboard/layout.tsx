import type { Metadata } from 'next'

import './dashboard.css'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'The Mesub dashboard, running on a fixed mock dataset.',
  /* This is an application surface built on mock data, not a page anyone should
     land on from a search result. Flip this to `index: true` the day it shows
     something real. */
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
