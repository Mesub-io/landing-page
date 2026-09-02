'use client'

import { useState } from 'react'

import type { DayRecord, Period } from '@/lib/dashboard/data'
import { NOW, PERIODS } from '@/lib/dashboard/data'
import { dayLabel, formatCount, formatMoney } from '@/lib/dashboard/format'
import { niceCeiling, smoothPath } from '@/lib/dashboard/geometry'

/**
 * Revenue and pulls over time.
 *
 * Three modes rather than six series on one axis. Money, counts of pulls and
 * counts of subscriptions are three different units, and stacking them on a
 * shared scale produces a chart that looks informative and answers nothing -
 * the reader cannot tell whether a line moved because revenue doubled or
 * because two people cancelled. Each mode owns one unit and says which.
 *
 * The curves are drawn in a normalised 0-100 box with
 * `preserveAspectRatio="none"`, so the shape stretches to whatever width the
 * card has without anything having to measure it. Strokes carry
 * `vector-effect="non-scaling-stroke"` so stretching does not thicken them, and
 * the dots, the tooltip and the grid are HTML positioned in percent rather than
 * SVG, which keeps them round and legible at any width.
 */

type Mode = 'revenue' | 'pulls' | 'growth'

const MODES: { id: Mode; label: string }[] = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'pulls', label: 'Pulls' },
  { id: 'growth', label: 'Growth' },
]

interface Band {
  /** The one that carries the filled area and the tooltip. */
  emphasis?: boolean
  key: keyof DayRecord
  label: string
  tone: 'accent' | 'ghost' | 'good' | 'bad'
}

const BANDS: Record<Mode, Band[]> = {
  revenue: [
    { key: 'attempted', label: 'Attempted', tone: 'ghost' },
    { key: 'collected', label: 'Collected', tone: 'accent', emphasis: true },
  ],
  pulls: [
    { key: 'pullsSettled', label: 'Settled', tone: 'good', emphasis: true },
    { key: 'pullsRetried', label: 'Retried', tone: 'accent' },
    { key: 'pullsFailed', label: 'Failed', tone: 'bad' },
  ],
  growth: [
    { key: 'newSubs', label: 'New', tone: 'good', emphasis: true },
    { key: 'canceled', label: 'Canceled', tone: 'bad' },
  ],
}

function total(days: DayRecord[], key: keyof DayRecord): number {
  return days.reduce((sum, day) => sum + (day[key] as number), 0)
}

function axisLabel(value: number, money: boolean): string {
  if (!money) return formatCount(value)
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${formatCount(value)}`
}

export function SeriesChart({
  days,
  onPickDay,
  period,
  onPeriodChange,
  showPeriod = false,
  tall = false,
}: {
  days: DayRecord[]
  onPickDay: (day: DayRecord) => void
  period: Period
  onPeriodChange: (period: Period) => void
  /** The period lives in the top bar, where it scopes the whole screen. The
   *  chart only carries its own copy when it is used outside that shell. */
  showPeriod?: boolean
  tall?: boolean
}) {
  const [mode, setMode] = useState<Mode>('revenue')
  const [hover, setHover] = useState<number | null>(null)

  const bands = BANDS[mode]
  const money = mode === 'revenue'
  const lastIndex = days.length - 1

  const peak = Math.max(1, ...bands.flatMap((band) => days.map((day) => day[band.key] as number)))
  const ceiling = niceCeiling(peak)

  /* Five gridlines, listed top down so the labels read like the axis. */
  const ticks = [4, 3, 2, 1, 0].map((step) => (ceiling / 4) * step)

  const xFor = (index: number) => (lastIndex === 0 ? 50 : (index / lastIndex) * 100)
  const yFor = (value: number) => 100 - (value / ceiling) * 100

  const active = hover === null ? null : days[hover]
  const emphasis = bands.find((band) => band.emphasis) ?? bands[bands.length - 1]

  return (
    <div className="dash-chart">
      <div className="dash-chart-controls">
        {/* Tabs, not a segmented switch: these are three views of the panel
            below, and the underline says which one is on screen. */}
        <div className="dash-tabs" role="tablist" aria-label="Chart series">
          {MODES.map((entry) => (
            <button
              aria-selected={mode === entry.id}
              className="dash-tab"
              key={entry.id}
              onClick={() => setMode(entry.id)}
              role="tab"
              type="button"
            >
              {entry.label}
            </button>
          ))}
        </div>

        {showPeriod && (
          <div className="dash-seg" role="group" aria-label="Period">
            {PERIODS.map((value) => (
              <button
                aria-pressed={period === value}
                className="dash-seg-item"
                key={value}
                onClick={() => onPeriodChange(value)}
                type="button"
              >
                {value}d
              </button>
            ))}
          </div>
        )}
      </div>

      {/* The readout stands in for a floating legend: it holds the period totals
          until a day is hovered, then that day's numbers. Nothing moves, and
          nothing sits behind the cursor. */}
      <div className="dash-readout">
        <span className="dash-readout-day">
          {active ? dayLabel(lastIndex - hover!, NOW) : `Last ${days.length} days`}
        </span>
        {bands.map((band) => {
          const value = active ? (active[band.key] as number) : total(days, band.key)
          return (
            <span className="dash-readout-item" data-tone={band.tone} key={band.key as string}>
              <span className="dash-rule" aria-hidden="true" />
              {band.label}
              <strong>{money ? formatMoney(value) : formatCount(value)}</strong>
            </span>
          )
        })}
      </div>

      <div className="dash-graph" data-tall={tall || undefined}>
        <div className="dash-axis-y" aria-hidden="true">
          {ticks.map((tick, index) => (
            <span key={tick} style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}>
              {axisLabel(tick, money)}
            </span>
          ))}
        </div>

        <div className="dash-canvas" onMouseLeave={() => setHover(null)}>
          <div className="dash-gridlines" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} />
            ))}
          </div>

          <svg
            aria-label={`${emphasis.label} over the last ${days.length} days`}
            className="dash-curves"
            preserveAspectRatio="none"
            role="img"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="dash-area-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {bands.map((band) => {
              const line = smoothPath(
                days.map((day, index) => ({
                  x: xFor(index),
                  y: yFor(day[band.key] as number),
                })),
              )
              return (
                <g key={band.key as string}>
                  {band.emphasis && money && (
                    <path className="dash-area" d={`${line} L 100 100 L 0 100 Z`} />
                  )}
                  <path
                    className="dash-line"
                    d={line}
                    data-tone={band.tone}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )
            })}
          </svg>

          {/* One hit area per day, so hovering stays precise next to a spike and
              the chart can be walked with a keyboard. */}
          <div className="dash-hits">
            {days.map((day, index) => (
              <button
                aria-label={`${dayLabel(lastIndex - index, NOW)}, ${
                  money
                    ? formatMoney(day[emphasis.key] as number)
                    : formatCount(day[emphasis.key] as number)
                }`}
                className="dash-hit"
                key={day.index}
                onClick={() => onPickDay(day)}
                onFocus={() => setHover(index)}
                onMouseEnter={() => setHover(index)}
                type="button"
              />
            ))}
          </div>

          {active && hover !== null && (
            <div
              className="dash-marker"
              data-edge={xFor(hover) < 12 ? 'start' : xFor(hover) > 88 ? 'end' : undefined}
              style={{ left: `${xFor(hover)}%` }}
            >
              <span className="dash-marker-line" />
              {bands.map((band) => (
                <span
                  className="dash-dot"
                  data-tone={band.tone}
                  key={band.key as string}
                  style={{ top: `${yFor(active[band.key] as number)}%` }}
                />
              ))}
              <span className="dash-tip" style={{ top: `${yFor(active[emphasis.key] as number)}%` }}>
                {money
                  ? formatMoney(active[emphasis.key] as number)
                  : formatCount(active[emphasis.key] as number)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="dash-axis" aria-hidden="true">
        <span>{dayLabel(lastIndex, NOW)}</span>
        <span className="dash-axis-peak">
          peak {money ? formatMoney(peak) : `${formatCount(peak)} pulls`}
        </span>
        <span>Today</span>
      </div>
    </div>
  )
}
