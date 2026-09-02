'use client'

import { useState } from 'react'

import { HISTORY_DAYS, NOW, series } from '@/lib/dashboard/data'
import { dayLabel, formatCount, formatMoney } from '@/lib/dashboard/format'

/**
 * Collection activity as a calendar, in the shape everyone already knows from
 * a contribution graph: weekdays down, weeks across, one square per day.
 *
 * It answers a different question from the bar chart above it. The chart shows
 * how much; this shows *rhythm* -  that collection clusters on the first of the
 * month, that weekends are quiet, and, more usefully, that a square is empty on
 * a day the scheduler should have run.
 *
 * The colour is pulls, not revenue. A day with one $299 plan is not a busy
 * day for the processor, and this block is about the processor.
 */

/** Four steps, like the graph it borrows from: enough to read, few enough to
 *  keep the map honest about how coarse it is. */
const STEPS = 4

export function ActivityCalendar() {
  const [hover, setHover] = useState<number | null>(null)

  /* Fixed at a year, deliberately out of step with the period selector above.
     This map answers a different question from every other block: not "how much
     this month" but "what is the rhythm" -  which weekdays are quiet, when the
     cycle turns, whether a day is missing entirely. Thirty days of that is five
     columns, which is a patch rather than a pattern. The card header says which
     window it is showing so the difference is stated, not hidden. */
  const window = series
  const days = HISTORY_DAYS
  const totals = window.map((day) => day.pullsSettled + day.pullsFailed)

  /* Quantile thresholds, not a linear scale against the peak.
     The cycle turn collects three times the median day, so dividing by the
     peak would drop four days out of five into the same shade and turn the
     year into static. Splitting the busy days into equal quarters is what makes
     the map show a rhythm. */
  const busyDays = totals.filter((value) => value > 0).sort((a, b) => a - b)
  const cut = (fraction: number) => busyDays[Math.floor(busyDays.length * fraction)] ?? 0
  const thresholds = [cut(0.25), cut(0.5), cut(0.75)]

  /* The grid starts on the Sunday at or before the oldest day held, so every
     column is a real week and the weekday rows line up. */
  const firstDate = new Date(NOW)
  firstDate.setUTCDate(firstDate.getUTCDate() - (days - 1))
  const lead = firstDate.getUTCDay()

  const cells: ({ index: number } | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...window.map((_, index) => ({ index })),
  ]

  const weeks: ({ index: number } | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const active = hover === null ? null : window[hover]
  const activeTotal = hover === null ? 0 : totals[hover]

  return (
    <div className="dash-cal">
      <p className="dash-readout-day">
        {active ? (
          <>
            {dayLabel(days - 1 - active.index, NOW)} ·{' '}
            <strong>{formatCount(activeTotal)}</strong> pulls ·{' '}
            <strong>{formatMoney(active.collected)}</strong> collected
          </>
        ) : (
          <>
            <strong>{formatCount(totals.reduce((sum, value) => sum + value, 0))}</strong> pulls
            over the last 12 months
          </>
        )}
      </p>

      {/* Month labels, so a busy stretch can be named rather than just seen. */}
      <div className="dash-cal-months" aria-hidden="true">
        {weeks.map((week, weekIndex) => {
          const first = week.find(Boolean)
          if (!first) return <span className="dash-cal-month" key={weekIndex} />
          const date = new Date(NOW)
          date.setUTCDate(date.getUTCDate() - (days - 1 - first.index))
          /* Print the name once per month, on the first week that reaches it. */
          const previous = weeks[weekIndex - 1]?.find(Boolean)
          let show = weekIndex === 0
          if (previous) {
            const prevDate = new Date(NOW)
            prevDate.setUTCDate(prevDate.getUTCDate() - (days - 1 - previous.index))
            show = prevDate.getUTCMonth() !== date.getUTCMonth()
          }
          return (
            <span className="dash-cal-month" key={weekIndex}>
              {show ? date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) : ''}
            </span>
          )
        })}
      </div>

      <div className="dash-cal-grid" onMouseLeave={() => setHover(null)}>
        {weeks.map((week, weekIndex) => (
          <div className="dash-cal-week" key={weekIndex}>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const cell = week[dayIndex]
              if (!cell) return <span className="dash-cal-cell" data-level="void" key={dayIndex} />

              const value = totals[cell.index]
              /* Zero keeps its own level so a day the processor never ran is
                 visibly different from a quiet one. */
              const level =
                value === 0
                  ? 0
                  : value <= thresholds[0]
                    ? 1
                    : value <= thresholds[1]
                      ? 2
                      : value <= thresholds[2]
                        ? 3
                        : 4

              return (
                <span
                  className="dash-cal-cell"
                  data-level={level}
                  key={dayIndex}
                  onMouseEnter={() => setHover(cell.index)}
                  title={`${dayLabel(days - 1 - cell.index, NOW)} - ${value} pulls`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="dash-cal-legend">
        <span className="dash-muted">Less</span>
        {Array.from({ length: STEPS + 1 }, (_, level) => (
          <span className="dash-cal-cell" data-level={level} key={level} />
        ))}
        <span className="dash-muted">More</span>
      </div>
    </div>
  )
}
