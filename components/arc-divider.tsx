/**
 * A lit arc between two sections: the ground of the next one rises through the
 * previous one, its rim glowing in the accent. Pure CSS — a wide dome clipped
 * by its container.
 */
export function ArcDivider() {
  return (
    <div className="arc" aria-hidden="true">
      <span className="arc-dome" />
    </div>
  )
}
