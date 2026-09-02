/* Scoped entirely under `.dash`, so loading it here cannot touch the rest of
   the page -  the hero renders the real dashboard rather than a picture of it. */
import '../dashboard/dashboard.css'

import { Builders } from '@/components/builders'
import { Closing } from '@/components/closing'
import { Faq } from '@/components/faq'
import { Hero } from '@/components/hero'
import { Integrate } from '@/components/integrate'
import { Pillars } from '@/components/pillars'
import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <Pillars />
        <Builders />
        <Integrate />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  )
}
