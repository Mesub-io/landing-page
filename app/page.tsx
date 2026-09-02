import { Builders } from '@/components/builders'
import { Hero } from '@/components/hero'
import { Pillars } from '@/components/pillars'
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
      </main>
    </>
  )
}
