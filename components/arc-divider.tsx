/**
 * A lit arc between two sections: the ground of the next one rises through the
 * previous one, its rim glowing in the accent.
 *
 * The halo is three blurred copies of the same dome sitting behind the solid
 * one — a box-shadow washes out on a light ground, a blurred shape does not.
 * They live in their own masked layer so the light fades out instead of being
 * cut off by the edge of the section.
 */
export function ArcDivider() {
  return (
    <div className="arc" aria-hidden="true">
      <div className="arc-glows">
        <span className="arc-halo-wide" />
        <span className="arc-halo" />
        <span className="arc-halo-tight" />
      </div>
      <span className="arc-dome" />
    </div>
  )
}
