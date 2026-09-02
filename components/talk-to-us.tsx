'use client'

import { useEffect, useRef, useState } from 'react'

import { closing } from '@/lib/closing'

import { CheckIcon, CopyIcon, MailIcon, XIcon } from './icons'

export function TalkToUs() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
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

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard access can be refused; the address stays visible either way.
    }
  }

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
            <div className="talk-row" key={option.label}>
              <a
                className="talk-option"
                href={option.href}
                onClick={() => {
                  if ('copy' in option && option.copy) {
                    copy(option.copy)
                    return
                  }
                  setOpen(false)
                }}
                role="menuitem"
                {...(option.href.startsWith('http') ? { rel: 'noreferrer', target: '_blank' } : {})}
              >
                <span className="talk-icon">{option.icon === 'mail' ? <MailIcon /> : <XIcon />}</span>
                <span>
                  <span className="talk-label">{option.label}</span>
                  <span className="talk-detail">{option.detail}</span>
                </span>
              </a>

              {/* A mail client is not guaranteed to exist, so the address is
                  copied on the same tap — no second target to miss. */}
              {'copy' in option && option.copy ? (
                <span className="talk-copied" data-shown={copied}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
