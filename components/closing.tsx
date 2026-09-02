import { closing } from '@/lib/closing'

import { Logo } from './logo'
import { TalkToUs } from './talk-to-us'

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  code: <path d="M6.6 12.8 3.4 9l3.2-3.8M11.4 5.2 14.6 9l-3.2 3.8M9.8 3.6l-1.6 10.8" />,
  shield: <path d="M9 1.8 15.2 4v4.6c0 3.6-2.5 6.3-6.2 7.6-3.7-1.3-6.2-4-6.2-7.6V4L9 1.8ZM6.6 8.8l1.7 1.7 3.3-3.4" />,
}

/** The ticked corners that mark each panel. */
function Corners() {
  return (
    <>
      <span className="tick tick-tl" aria-hidden="true" />
      <span className="tick tick-tr" aria-hidden="true" />
      <span className="tick tick-bl" aria-hidden="true" />
      <span className="tick tick-br" aria-hidden="true" />
    </>
  )
}

function Heading({ icon, label, title }: { icon: string; label: string; title: string }) {
  return (
    <div className="panel-heading">
      <span className="panel-label">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[icon]}
        </svg>
        {label}
      </span>
      <p className="panel-title">{title}</p>
    </div>
  )
}

export function Closing() {
  const { audits, custody, program } = closing

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
          <TalkToUs />
        </div>
      </div>

      <div className="proof">
        <article className="proof-panel">
          <Corners />
          <Heading icon={program.icon} label={program.label} title={program.title} />

          <div className="proof-figure">
            <div className="proof-glow" aria-hidden="true" />
            <code className="proof-address">{program.address}</code>
            <dl className="proof-meta">
              {program.meta.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <a className="proof-link" href={program.link.href} rel="noreferrer" target="_blank">
            {program.link.label}
            <Arrow />
          </a>
        </article>

        <article className="proof-panel">
          <Corners />
          <Heading icon={audits.icon} label={audits.label} title={audits.title} />

          <div className="proof-figure">
            <div className="proof-glow" aria-hidden="true" />
            <ul className="proof-runs">
              {[1, 2, 3].map((run) => (
                <li key={run}>
                  <span className="proof-run-index">0{run}</span>
                  <span className="proof-run-bar" data-latest={run === 3} />
                </li>
              ))}
            </ul>
            <dl className="proof-meta">
              {audits.meta.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <a className="proof-link" href={audits.link.href} rel="noreferrer" target="_blank">
            {audits.link.label}
            <Arrow />
          </a>
        </article>

        <article className="proof-panel proof-wide">
          <Corners />
          <p className="proof-statement">{custody.statement}</p>

          <ul className="proof-states">
            {custody.states.map((state) => (
              <li key={state.label}>
                <span className="proof-dial">
                  <span className="proof-disc" data-pattern={state.pattern} />
                  <span className="proof-disc" data-pattern={state.pattern === 'solid' ? 'empty' : 'ring'} />
                </span>
                <span className="proof-state-label">{state.label}</span>
              </li>
            ))}
          </ul>

          <a className="proof-link proof-link-centred" href={custody.link.href} rel="noreferrer" target="_blank">
            {custody.link.label}
            <Arrow />
          </a>
        </article>
      </div>
    </section>
  )
}
