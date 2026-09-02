import { DashboardShell } from './dashboard/shell'
import { HeroPhoneCard } from './hero-dashboard'

/**
 * The hero scene: a desktop window with a phone in front of it.
 *
 * The window holds the actual dashboard component, not a reduced copy of it.
 * The first attempt here was a hand-written miniature, and it was wrong within
 * an hour: no calendar, no outlook, no event table, and a layout that had
 * quietly stopped matching the real screen. A product shot that drifts from the
 * product is worse than no product shot.
 *
 * `inert` is doing real work. The dashboard is full of buttons and selects, and
 * without it the hero would put thirty tab stops between the headline and the
 * call to action, and hide the whole thing from nobody. Inert takes the subtree
 * out of the tab order, out of pointer events and out of the accessibility
 * tree in one attribute.
 *
 * The stage is a container: every dimension is in `em` or `cqw`, so the scene
 * scales cleanly instead of being transform-scaled and going soft.
 */
export function DeviceMocks() {
  return (
    <div className="stage">
      <div className="mock mock-desktop" aria-hidden="true">
        <div className="mock-bar">
          <span className="dot" data-action="close" />
          <span className="dot" data-action="minimise" />
          <span className="dot" data-action="zoom" />
        </div>
        <div className="mock-screen hero-dash-frame" inert>
          <DashboardShell />
        </div>
      </div>

      <div className="mock mock-phone" aria-hidden="true">
        <div className="phone-screen">
          <div className="phone-island" />
          <HeroPhoneCard />
        </div>
      </div>
    </div>
  )
}
