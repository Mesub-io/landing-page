import { pillars } from '@/lib/pillars'

/** One continuous thread, shaped around each part of the subscription lifecycle. */
function Art({ kind }: { kind: string }) {
  return (
    <div className="card-art" aria-hidden="true">
      <svg className="card-diagram" viewBox="0 0 360 190" fill="none">
        {kind === 'cycle' ? (
          <g>
            <path className="art-thread-soft" d="M28 105h304" />
            <path className="art-thread" d="M28 105h232" />
            <path className="art-thread-future" d="M260 105h72" />
            {[64, 130, 196].map((x) => (
              <g key={x}>
                <circle className="art-node" cx={x} cy="105" r="8" />
                <path className="art-node-check" d={`m${x - 3.5} 105 2.2 2.2 4.5-5`} />
              </g>
            ))}
            <circle className="art-node is-next" cx="260" cy="105" r="9" />
            <circle className="art-node is-future" cx="326" cy="105" r="6" />
            <path className="art-hairline" d="M64 75v15M130 75v15M196 75v15M260 75v15" />
            <text className="art-label" x="64" y="65" textAnchor="middle">SEP</text>
            <text className="art-label" x="130" y="65" textAnchor="middle">OCT</text>
            <text className="art-label" x="196" y="65" textAnchor="middle">NOV</text>
            <text className="art-label is-accent" x="260" y="65" textAnchor="middle">NEXT</text>
            <text className="art-caption" x="64" y="137" textAnchor="middle">settled</text>
            <text className="art-caption" x="130" y="137" textAnchor="middle">settled</text>
            <text className="art-caption" x="196" y="137" textAnchor="middle">settled</text>
            <text className="art-caption is-accent" x="260" y="137" textAnchor="middle">due</text>
          </g>
        ) : null}

        {kind === 'tokens' ? (
          <g>
            <circle className="art-sol-coin" cx="151" cy="95" r="40" />
            <image className="art-sol-token" href="/sol-token.png" x="117" y="61" width="68" height="68" />
            <circle className="art-usdc-mask" cx="214" cy="95" r="35" />
            <image className="art-usdc-token" href="/USDC-Nobg.png" x="173" y="54" width="82" height="82" />
          </g>
        ) : null}

        {kind === 'authority' ? (
          <g>
            <path className="art-authority-line" d="M67 95h54M149 88C188 88 211 50 270 50M149 95h121M149 102c39 0 62 38 121 38" />
            <circle className="art-account-node" cx="55" cy="95" r="12" />
            <circle className="art-account-core" cx="55" cy="95" r="3" />
            <circle className="art-authority-node" cx="135" cy="95" r="15" />
            <circle className="art-authority-core" cx="135" cy="95" r="5" />
            {[50, 95, 140].map((y) => (
              <g key={y}>
                <circle className="art-plan-node" cx="278" cy={y} r="8" />
                <circle className="art-plan-core" cx="278" cy={y} r="2.5" />
              </g>
            ))}
            <text className="art-topology-label" x="55" y="124" textAnchor="middle">TOKEN ACCOUNT</text>
            <text className="art-topology-label is-accent" x="135" y="124" textAnchor="middle">AUTHORITY</text>
            <text className="art-plan-label" x="296" y="53">PLAN 01</text>
            <text className="art-plan-label" x="296" y="98">PLAN 02</text>
            <text className="art-plan-label" x="296" y="143">PLAN 03</text>
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
