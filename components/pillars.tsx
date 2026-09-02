import { pillars } from '@/lib/pillars'

/**
 * Card illustrations. Line drawings on a faint grid, one per idea:
 * the billing cycle, the state that follows it, the recovery path.
 */
function Art({ kind }: { kind: string }) {
  return (
    <div className="card-art" aria-hidden="true">
      <div className="card-grid" />
      <svg viewBox="0 0 220 120" fill="none">
        {kind === 'cycle' ? (
          <g>
            <path d="M20 60h180" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="4 6" />
            {[20, 65, 110, 155, 200].map((x, i) => (
              <g key={x}>
                <circle
                  cx={x}
                  cy="60"
                  r={i === 4 ? 6.5 : 7}
                  fill={i === 4 ? 'transparent' : 'var(--accent)'}
                  fillOpacity={i === 4 ? 0 : 1 - i * 0.16}
                  stroke={i === 4 ? 'var(--line-strong)' : 'none'}
                  strokeWidth={i === 4 ? 1.5 : undefined}
                  strokeDasharray={i === 4 ? '3 3' : undefined}
                />
                <rect x={x - 11} y="78" width="22" height="4" rx="2" fill="var(--line)" />
              </g>
            ))}
          </g>
        ) : null}

        {kind === 'state' ? (
          <g>
            <rect x="26" y="30" width="76" height="60" rx="10" stroke="var(--line-strong)" strokeWidth="1.2" />
            <rect x="118" y="30" width="76" height="60" rx="10" stroke="var(--line-strong)" strokeWidth="1.2" />
            <path d="M102 60h16" stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="3 4" />
            <rect x="40" y="46" width="48" height="5" rx="2.5" fill="var(--line)" />
            <rect x="40" y="58" width="34" height="5" rx="2.5" fill="var(--line)" />
            <rect x="40" y="70" width="26" height="6" rx="3" fill="var(--accent)" />
            <rect x="132" y="46" width="48" height="5" rx="2.5" fill="var(--line)" />
            <rect x="132" y="58" width="40" height="5" rx="2.5" fill="var(--line)" />
            <circle cx="137" cy="73" r="4" fill="var(--accent)" />
            <rect x="146" y="70" width="30" height="6" rx="3" fill="var(--line)" />
          </g>
        ) : null}

        {kind === 'recovery' ? (
          <g>
            <path
              d="M24 84c22 0 26-46 52-46s30 46 56 46 28-46 54-46"
              stroke="var(--line-strong)"
              strokeWidth="1.2"
              strokeDasharray="4 5"
            />
            <circle cx="76" cy="38" r="6" fill="var(--accent)" fillOpacity="0.35" />
            <circle cx="132" cy="84" r="7" fill="none" stroke="var(--accent)" strokeWidth="1.8" />
            <path d="M128.5 84l2.6 2.6 4.6-5.2" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="186" cy="38" r="6" fill="var(--accent)" />
          </g>
        ) : null}
      </svg>
    </div>
  )
}

export function Pillars() {
  return (
    <section className="pillars">
      <div className="pillars-inner">
        <header className="pillars-head">
          <h2>{pillars.title}</h2>
          <p>{pillars.subhead}</p>
          <a className="pill" href={pillars.action.href}>
            {pillars.action.label}
          </a>
        </header>

        <div className="card-grid-3">
          {pillars.cards.map((card) => (
            <article className="card" key={card.title}>
              <Art kind={card.art} />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
