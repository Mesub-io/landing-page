'use client'

import { useEffect, useRef, useState } from 'react'

import { closing } from '@/lib/closing'

const ICONS: Record<string, React.ReactNode> = {
  mail: (
    <path
      d="M2.4 4.8h13.2v8.4H2.4zM2.4 5.2l6.6 4.6 6.6-4.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  // The X mark, drawn rather than fetched so it inherits the text colour.
  x: (
    <path
      d="M10.6 7.7 15.5 2h-1.2l-4.3 4.9L6.6 2H2.5l5.2 7.4-5.2 5.9h1.2l4.5-5.2 3.6 5.2h4.1l-5.3-7.6Zm-1.6 1.8-.5-.8-4.2-5.8h1.8l3.4 4.7.5.8 4.4 6.1h-1.8L9 9.5Z"
      fill="currentColor"
    />
  ),
}

export function TalkToUs() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="talk" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="pill talk-trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {closing.secondary.label}
        <svg className="talk-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="talk-menu" role="menu">
          {closing.secondary.options.map((option) => (
            <a
              className="talk-option"
              href={option.href}
              key={option.label}
              onClick={() => setOpen(false)}
              role="menuitem"
              {...(option.href.startsWith('http') ? { rel: 'noreferrer', target: '_blank' } : {})}
            >
              <span className="talk-icon">
                <svg viewBox="0 0 18 18" aria-hidden="true">{ICONS[option.icon]}</svg>
              </span>
              <span>
                <span className="talk-label">{option.label}</span>
                <span className="talk-detail">{option.detail}</span>
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
