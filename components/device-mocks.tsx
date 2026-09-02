/**
 * Placeholder devices for the hero: a desktop window with a phone in front.
 * Everything is drawn in CSS — no screenshots yet — so the composition can be
 * swapped for the real product UI without touching the layout.
 *
 * The stage is a container: every dimension below is in `em`, and the stage's
 * font-size is a fraction of its own width, so the whole scene scales cleanly
 * instead of being transform-scaled.
 */

function Bar({ w, tone }: { w: number; tone?: 'strong' | 'accent' }) {
  return <span className="sk" data-tone={tone} style={{ width: `${w}%` }} />
}

function DesktopMock() {
  return (
    <div className="mock mock-desktop" aria-hidden="true">
      <div className="mock-bar">
        <span className="dot" data-action="close" />
        <span className="dot" data-action="minimise" />
        <span className="dot" data-action="zoom" />
      </div>
      <div className="mock-body">
        <aside className="mock-side">
          <Bar w={70} tone="strong" />
          <Bar w={90} />
          <Bar w={60} />
          <Bar w={80} />
          <Bar w={50} />
        </aside>
        <div className="mock-main">
          <div className="mock-stats">
            <div className="mock-tile">
              <Bar w={55} />
              <Bar w={80} tone="strong" />
            </div>
            <div className="mock-tile">
              <Bar w={45} />
              <Bar w={70} tone="strong" />
            </div>
            <div className="mock-tile">
              <Bar w={60} />
              <Bar w={75} tone="strong" />
            </div>
          </div>
          <div className="mock-chart">
            <svg viewBox="0 0 300 90" preserveAspectRatio="none">
              <path
                d="M0 72 C 26 62 34 40 56 44 S 96 74 120 62 S 158 24 186 34 S 232 66 258 48 S 288 22 300 26"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0 72 C 26 62 34 40 56 44 S 96 74 120 62 S 158 24 186 34 S 232 66 258 48 S 288 22 300 26 L300 90 L0 90Z"
                fill="var(--accent-soft)"
              />
            </svg>
          </div>
          <div className="mock-rows">
            {[68, 54, 72, 48].map((w, i) => (
              <div className="mock-row" key={i}>
                <Bar w={w} />
                <Bar w={30} />
                <Bar w={22} tone={i === 1 ? 'accent' : undefined} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMock() {
  return (
    <div className="mock mock-phone" aria-hidden="true">
      <div className="phone-screen">
        <div className="phone-island" />
        <div className="phone-body">
          <Bar w={40} />
          <Bar w={72} tone="strong" />
          <div className="phone-card">
            <Bar w={50} />
            <Bar w={85} tone="strong" />
            <Bar w={35} tone="accent" />
          </div>
          <div className="phone-card">
            <Bar w={60} />
            <Bar w={40} />
          </div>
          <span className="phone-cta" />
        </div>
      </div>
    </div>
  )
}

export function DeviceMocks() {
  return (
    <div className="stage">
      <DesktopMock />
      <PhoneMock />
    </div>
  )
}
