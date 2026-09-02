'use client'

import type { DayRecord } from '@/lib/dashboard/data'
import { formatCount, formatPercent } from '@/lib/dashboard/format'
import { arcPath as arc, polar } from '@/lib/dashboard/geometry'

/**
 * Collection, as a ring.
 *
 * The percentage and the three counts are read on the left; the ring on the
 * right is the shape of the same fact. Neither stands alone: a rate with no
 * counts hides how many pulls it is averaging over, and a ring with no numbers
 * cannot be quoted.
 *
 * The arithmetic matters more than the drawing. Three arcs laid end to end have
 * to divide a real whole, so the three here are the three ways a pull actually
 * ends: it settled, it failed and a retry is scheduled, or it failed with no
 * attempt left. Those add up to every pull made.
 *
 * The obvious version -  settled, failed, retries sent -  would not: a retry is
 * one of the failures being handled, so the ring would total more pulls than
 * were ever attempted. Splitting the failures is what lets the circle be a
 * circle.
 *
 * The arcs draw themselves in once on mount, in the order they are read. It
 * runs a little under a second and never again: a chart that replays itself is
 * a demo, and this is a screen someone opens twenty times a day.
 */

const SIZE = 320
const CENTRE = SIZE / 2
const RING = 118
const TICK_COUNT = 120

export function PullGauge({ days }: { days: DayRecord[] }) {
  const settled = days.reduce((sum, day) => sum + day.pullsSettled, 0)
  const failedTotal = days.reduce((sum, day) => sum + day.pullsFailed, 0)
  const retried = days.reduce((sum, day) => sum + day.pullsRetried, 0)

  /* The failures split in two: the ones still being chased, and the ones that
     have run out of attempts. */
  const retrying = Math.min(retried, failedTotal)
  const lost = failedTotal - retrying

  const pulls = Math.max(1, settled + retrying + lost)
  const rate = (settled / pulls) * 100

  const segments = [
    { id: 'settled', label: 'Settled', tone: 'settled', value: settled },
    { id: 'retrying', label: 'Retry scheduled', tone: 'retry', value: retrying },
    { id: 'lost', label: 'No attempt left', tone: 'lost', value: lost },
  ].filter((segment) => segment.value > 0)

  /* A real notch between the arcs rather than a hairline, so the stages are
     separated by the ring's own background and not just by a change of hue. */
  const GAP = 4
  let cursor = 0
  const arcs = segments.map((segment) => {
    const span = (segment.value / pulls) * 360
    const from = cursor
    cursor += span
    return { ...segment, from: from + GAP / 2, to: from + span - GAP / 2 }
  })

  return (
    <div className="dash-gauge-block">
      <div className="dash-gauge-read">
        <span className="dash-gauge-rate dash-num">{formatPercent(rate, 1)}</span>
        <span className="dash-gauge-caption">settled</span>

        <ul className="dash-gauge-stats">
          {arcs.map((segment) => (
            <li className="dash-gauge-stat" key={segment.id}>
              <span className="dash-swatch" data-tone={segment.tone} aria-hidden="true" />
              <span className="dash-gauge-stat-value dash-num">{formatCount(segment.value)}</span>
              <span className="dash-gauge-stat-label">{segment.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <svg
        aria-label={`${formatPercent(rate, 1)} of pulls settled, out of ${formatCount(
          pulls,
        )}: ${arcs.map((s2) => `${formatCount(s2.value)} ${s2.label.toLowerCase()}`).join(', ')}`}
        className="dash-ring"
        role="img"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* The measured edge: every tenth tick is longer, the way a rule is
            marked. */}
        <g className="dash-ring-ticks">
          {Array.from({ length: TICK_COUNT }, (_, i) => {
            const angle = (i / TICK_COUNT) * 360
            const major = i % 10 === 0
            const outer = polar(CENTRE, RING + 30, angle)
            const inner = polar(CENTRE, RING + (major ? 20 : 24), angle)
            return (
              <line
                data-major={major || undefined}
                key={i}
                x1={inner.x}
                x2={outer.x}
                y1={inner.y}
                y2={outer.y}
              />
            )
          })}
        </g>

        <circle className="dash-ring-track" cx={CENTRE} cy={CENTRE} r={RING} />
        {arcs.map((segment, index) => (
          <path
            className="dash-ring-arc"
            d={arc(CENTRE, RING, segment.from, segment.to)}
            data-tone={segment.tone}
            key={segment.id}
            /* Normalising the length to 100 lets one CSS rule draw every arc,
               whatever its real geometry: the dash pattern is then in percent
               rather than in user units nobody would want to measure. */
            pathLength={100}
            style={{ animationDelay: `${index * 130}ms` }}
          />
        ))}
      </svg>
    </div>
  )
}
