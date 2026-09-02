'use client'

import { builders } from '@/lib/builders'

import { CountUp } from './count-up'
import { useReveal } from './use-reveal'

const ICONS: Record<string, React.ReactNode> = {
  shield: <path d="M9 1.8 15.2 4v4.6c0 3.6-2.5 6.3-6.2 7.6-3.7-1.3-6.2-4-6.2-7.6V4L9 1.8Z" />,
  webhook: <path d="M5.5 9.5 3.2 13.4M12.5 9.5l2.3 3.9M6.2 13.4h5.6M9 2.6a3.2 3.2 0 0 0-2.8 4.7M9 2.6a3.2 3.2 0 0 1 2.8 4.7" />,
  retry: <path d="M15 9a6 6 0 1 1-1.9-4.4M15.4 2.6v3.6h-3.6" />,
  history: <path d="M2.6 14.4h12.8M4.6 11.6v2.8M8 7.6v6.8M11.4 9.8v4.6M14.8 5.4v9" />,
}

function Icon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  )
}

export function Builders() {
  const { ref, seen } = useReveal<HTMLElement>(0.18)

  return (
    <section className="builders" data-seen={seen} ref={ref}>
      <div className="builders-inner">
        <div className="builders-copy">
          <h2>{builders.title}</h2>
          <p className="builders-body">{builders.body}</p>

          <ul className="feature-list">
            {builders.bullets.map((bullet) => (
              <li key={bullet.label}>
                <Icon kind={bullet.icon} />
                {bullet.label}
              </li>
            ))}
          </ul>

          <a className="text-link" href={builders.link.href}>
            {builders.link.label}
          </a>
        </div>

        <div className="builders-panel">
          <div className="builders-stage">
            <div className="stage-rings" aria-hidden="true" />
            <div className="mobile" aria-hidden="true">
              <span className="mobile-notch" />
              <span className="mobile-title">{builders.mobile.title}</span>
              <div className="mobile-card">
                <span className="mobile-plan">{builders.mobile.plan}</span>
                <span className="mobile-amount">{builders.mobile.amount}</span>
                <span className="state" data-state={builders.mobile.state}>
                  {builders.mobile.state}
                </span>
              </div>
              <div className="mobile-row">
                <span>{builders.mobile.nextLabel}</span>
                <span className="mobile-strong">{builders.mobile.nextValue}</span>
              </div>
              <div className="mobile-actions">
                <span className="mobile-action">{builders.mobile.action}</span>
              </div>
            </div>

            <div className="panel">
            <div className="panel-chrome" aria-hidden="true">
              <span className="dot" data-action="close" />
              <span className="dot" data-action="minimise" />
              <span className="dot" data-action="zoom" />
            </div>
            <div className="panel-head">
              <span className="panel-title">Subscriptions</span>
              <span className="panel-period">Last 30 days</span>
            </div>

            <div className="panel-stats">
              {builders.stats.map((stat, i) => (
                <div className="stat" key={stat.label} style={{ ['--i' as string]: i }}>
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">
                    <CountUp value={stat.value} prefix={stat.prefix ?? ''} run={seen} />
                    <span className="stat-delta">{stat.delta}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="panel-table">
              <div className="tr th">
                <span>Plan</span>
                <span>Amount</span>
                <span>State</span>
                <span>Next attempt</span>
              </div>
              {builders.rows.map((row, i) => (
                <div className="tr" key={i} style={{ ['--i' as string]: i }}>
                  <span>{row.plan}</span>
                  <span className="mono">{row.amount}</span>
                  <span>
                    <span className="state" data-state={row.state}>
                      {row.state}
                    </span>
                  </span>
                  <span className="muted">{row.next}</span>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
