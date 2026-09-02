/**
 * A lit arc between two sections: the ground of the next one rises through the
 * previous one, its rim glowing in the accent.
 *
 * The halo is a second dome, filled with the accent and blurred, sitting behind
 * the solid one — a box-shadow washes out on a light ground, a blurred shape
 * does not.
 */
export function ArcDivider() {
  return (
    <div className="arc" aria-hidden="true">
      <span className="arc-halo arc-halo-wide" />
      <span className="arc-halo" />
      <span className="arc-dome" />
    </div>
  )
}
