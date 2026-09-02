/**
 * The drawing maths behind the dashboard's two charts.
 *
 * Kept out of the components because the hero on the landing page renders the
 * same shapes at a fraction of the size. Duplicating a Fritsch-Carlson
 * implementation so a marketing page can show a curve is how two versions of a
 * chart quietly start disagreeing with each other.
 */

/**
 * A round ceiling for a value axis, so the top gridline is a number a person
 * would say out loud: 4,000 rather than 3,716.
 */
export function niceCeiling(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]) {
    if (value <= step * magnitude) return step * magnitude
  }
  return 10 * magnitude
}

/**
 * A smooth curve through every point that never overshoots them.
 *
 * Monotone cubic interpolation (Fritsch-Carlson), not Catmull-Rom. The
 * difference matters rather than being a matter of taste: a plain spline
 * through a spike swings past its neighbours, and on a revenue chart that means
 * the curve dips below zero the day after a busy one. A chart that draws
 * negative revenue is wrong, however good it looks.
 */
export function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  const n = points.length
  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(points[i + 1].x - points[i].x)
    slope.push((points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x))
  }

  /* Tangent at each point: the average of the neighbouring slopes, forced to
     zero wherever the data turns, which is what keeps the curve inside its own
     points. */
  const tangent: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i += 1) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2)
  }
  tangent.push(slope[n - 2])

  /* Fritsch-Carlson: shrink any tangent that would let a segment bulge past the
     two points it joins. */
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0
      tangent[i + 1] = 0
      continue
    }
    const a = tangent[i] / slope[i]
    const b = tangent[i + 1] / slope[i]
    const h = Math.hypot(a, b)
    if (h > 3) {
      tangent[i] = ((3 * a) / h) * slope[i]
      tangent[i + 1] = ((3 * b) / h) * slope[i]
    }
  }

  const parts = [`M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`]
  for (let i = 0; i < n - 1; i += 1) {
    const third = dx[i] / 3
    const c1x = points[i].x + third
    const c1y = points[i].y + tangent[i] * third
    const c2x = points[i + 1].x - third
    const c2y = points[i + 1].y - tangent[i + 1] * third
    parts.push(
      `C ${c1x.toFixed(3)} ${c1y.toFixed(3)}, ${c2x.toFixed(3)} ${c2y.toFixed(3)}, ` +
        `${points[i + 1].x.toFixed(3)} ${points[i + 1].y.toFixed(3)}`,
    )
  }
  return parts.join(' ')
}

/**
 * A point on a circle, in degrees clockwise from the top.
 *
 * Rounded to two decimals, and that is not cosmetic. Left raw, these
 * coordinates reach the DOM as attributes whose last digit differs between the
 * server's serialisation and the browser's -  222.6374430336732 against
 * 222.63744303367324 -  and React reports a hydration mismatch on every tick.
 * Two decimals is finer than any viewBox here can show, and both sides then
 * write the same string.
 */
export function polar(centre: number, radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180
  return {
    x: Math.round((centre + radius * Math.cos(radians)) * 100) / 100,
    y: Math.round((centre + radius * Math.sin(radians)) * 100) / 100,
  }
}

export function arcPath(centre: number, radius: number, from: number, to: number): string {
  const start = polar(centre, radius, from)
  const end = polar(centre, radius, to)
  const large = to - from > 180 ? 1 : 0
  return (
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} ` +
    `A ${radius} ${radius} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
  )
}
