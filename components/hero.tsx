import { DeviceMocks } from './device-mocks'

import { hero } from '@/lib/hero'

function Arrow() {
  return (
    <svg className="cta-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.headline}</h1>
          <p className="hero-sub">{hero.subhead}</p>
          <div className="hero-actions">
            <a className="cta" href={hero.primary.href}>
              {hero.primary.label}
              <Arrow />
            </a>
            <a className="text-link" href={hero.secondary.href}>
              {hero.secondary.label}
            </a>
          </div>
          <p className="hero-note">
            Built on the open-source{' '}
            <a href={hero.note.href} rel="noreferrer" target="_blank">
              {hero.note.linkLabel}
            </a>{' '}
            program.
          </p>
        </div>

        <div className="hero-visual">
          <DeviceMocks />
        </div>
      </div>
    </section>
  )
}
