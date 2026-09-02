import { closing } from '@/lib/closing'

import { Logo } from './logo'

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Closing() {
  const { audits, address, diff, licence, program } = closing.foundations

  return (
    <section className="closing">
      <div className="closing-inner">
        <Logo className="closing-mark" />

        <h2>{closing.title}</h2>
        <p className="closing-sub">{closing.subhead}</p>

        <div className="closing-actions">
          <a className="cta" href={closing.primary.href}>
            {closing.primary.label}
            <Arrow className="cta-arrow" />
          </a>
          <a className="pill" href={closing.secondary.href}>
            {closing.secondary.label}
          </a>
        </div>

        {/* The ground it stands on, said plainly. */}
        <p className="foundations">
          Built on the open-source{' '}
          <a href={program.href} rel="noreferrer" target="_blank">
            {program.label}
          </a>
          , published by the Solana Foundation under the{' '}
          <a href={licence.href} rel="noreferrer" target="_blank">
            {licence.label}
          </a>{' '}
          and{' '}
          <a href={audits.href} rel="noreferrer" target="_blank">
            {audits.label}
          </a>
          . Non-custodial by construction: subscribers authorize a pull capped per period, and revoke it whenever they
          want.
        </p>

        <p className="foundations-address">
          <code>{address}</code>
          <a href={diff.href} rel="noreferrer" target="_blank">
            {diff.label}
          </a>
        </p>
      </div>
    </section>
  )
}
