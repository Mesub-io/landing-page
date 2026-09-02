'use client'

import { useEffect, useState } from 'react'

const DURATION = 1100

/** Eases out fast then settles, so the number lands rather than stops. */
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function CountUp({ value, prefix = '', run }: { prefix?: string; run: boolean; value: number }) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!run) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION)
      setShown(Math.round(value * easeOut(progress)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [run, value])

  return (
    <span>
      {prefix}
      {shown.toLocaleString('en-US')}
    </span>
  )
}
