'use client'

import { useEffect, useState } from 'react'

import { codeLines, integrate } from '@/lib/integrate'

import { ClaudeMark } from './claude-mark'
import { useReveal } from './use-reveal'

const ICONS: Record<string, React.ReactNode> = {
  braces: <path d="M7 2.6C5.2 2.6 5 3.8 5 5.2v1.5c0 1.2-.7 2.3-1.9 2.3 1.2 0 1.9 1.1 1.9 2.3v1.5c0 1.4.2 2.6 2 2.6M11 2.6c1.8 0 2 1.2 2 2.6v1.5c0 1.2.7 2.3 1.9 2.3-1.2 0-1.9 1.1-1.9 2.3v1.5c0 1.4-.2 2.6-2 2.6" />,
  layers: <path d="M9 2.4 2.6 5.6 9 8.8l6.4-3.2L9 2.4ZM2.6 9.6 9 12.8l6.4-3.2M2.6 13.2 9 16.4l6.4-3.2" />,
  lock: <path d="M4.6 8.2h8.8v6.4H4.6zM6.6 8.2V5.8a2.4 2.4 0 0 1 4.8 0v2.4" />,
  sync: <path d="M15 9a6 6 0 1 1-1.9-4.4M15.4 2.6v3.6h-3.6" />,
}

function Icon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  )
}

const CHAR_MS = 8
const TOTAL = codeLines.reduce((sum, line) => sum + line.reduce((n, t) => n + t.text.length, 0) + 1, 0)

/** Types the snippet out once, at a steady pace, when it comes into view. */
function useTypewriter(run: boolean) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!run) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(TOTAL)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const chars = Math.min(TOTAL, Math.floor((now - start) / CHAR_MS))
      setShown(chars)
      if (chars < TOTAL) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [run])

  return shown
}

/** Types a plain string out once, after a beat, when the section is in view. */
function useTypedText(text: string, run: boolean, startDelay: number, speed = 22) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!run) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text.length)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start - startDelay
      const chars = elapsed <= 0 ? 0 : Math.min(text.length, Math.floor(elapsed / speed))
      setShown(chars)
      if (chars < text.length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [run, startDelay, speed, text])

  return { done: shown >= text.length, text: text.slice(0, shown) }
}

export function Integrate() {
  const { ref, seen } = useReveal<HTMLElement>(0.2)
  const shown = useTypewriter(seen)
  const codeDone = shown >= TOTAL
  const said = useTypedText(integrate.mcp.line, codeDone, 260, 12)

  // Walk the lines, handing each one the characters it is still owed.
  let budget = shown
  const done = shown >= TOTAL

  return (
    <section className="integrate" data-seen={seen} id="developers" ref={ref}>
      <div className="integrate-inner">
        <div className="integrate-visual">
          <div className="code-stage">
            <div className="code-window">
              <div className="code-bar">
                <span className="dot" data-action="close" />
                <span className="dot" data-action="minimise" />
                <span className="dot" data-action="zoom" />
                <span className="code-file">{integrate.file}</span>
              </div>
              <pre className="code-body">
                <code>
                  {codeLines.map((line, li) => {
                    const length = line.reduce((n, t) => n + t.text.length, 0)
                    const available = Math.max(0, Math.min(budget, length))
                    const typing = budget > 0 && budget <= length && !done
                    budget -= length + 1

                    let used = 0
                    return (
                      <span className="code-line" key={li}>
                        {line.map((token, ti) => {
                          const room = Math.max(0, available - used)
                          const text = token.text.slice(0, room)
                          used += token.text.length
                          if (!text) return null
                          return (
                            <span className={token.kind ? `t-${token.kind}` : undefined} key={ti}>
                              {text}
                            </span>
                          )
                        })}
                        {typing || (done && li === codeLines.length - 1) ? <span className="caret" /> : null}
                        {'\n'}
                      </span>
                    )
                  })}
                </code>
              </pre>
            </div>

          </div>
        </div>

        <div className="integrate-copy">
          <h2>{integrate.title}</h2>
          <p className="integrate-body">{integrate.body}</p>

          <ul className="feature-list">
            {integrate.bullets.map((bullet) => (
              <li key={bullet.label}>
                <Icon kind={bullet.icon} />
                {bullet.label}
              </li>
            ))}
          </ul>

          <a className="text-link" href={integrate.link.href}>
            {integrate.link.label}
          </a>

          {/* Claude turns up only once the file has finished writing itself:
              an empty bubble waiting on the page says nothing. */}
          {codeDone ? (
            <div className="claude-say">
              <div className="bubble">
                <span className="bubble-speaker">{integrate.mcp.speaker}</span>
                <p className="bubble-line">
                  {said.text}
                  {said.done ? null : <span className="type-caret" />}
                </p>
                <a data-ready={said.done} href={integrate.mcp.href}>
                  {integrate.mcp.action}
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              <span className="claude-avatar">
                <ClaudeMark size={24} />
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
