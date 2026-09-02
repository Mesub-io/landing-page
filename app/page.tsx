import { ArcDivider } from '@/components/arc-divider'
import { Builders } from '@/components/builders'
import { Closing } from '@/components/closing'
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
        <ArcDivider />
        <Builders />
        <Integrate />
        <Closing />
      </main>
      <SiteFooter />
    </>
  )
}
