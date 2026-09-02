'use client'

import { useEffect, useState } from 'react'

import { contact } from '@/lib/nav'
import { site } from '@/lib/site'
import type { ReferralSource } from '@/lib/waitlist/sources'
import { LIMITS, normaliseHandle, validate } from '@/lib/waitlist/validate'

import { XIcon } from './icons'

type Errors = ReturnType<typeof validate>['errors']

export function WaitlistForm() {
  const [sources, setSources] = useState<ReferralSource[]>([])
  const [sourcesFailed, setSourcesFailed] = useState(false)
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  // The options come from the server: the form never invents its own.
  useEffect(() => {
    let live = true
    fetch('/api/waitlist/sources')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { sources: ReferralSource[] }) => {
        if (live) setSources(data.sources)
      })
      .catch(() => {
        if (live) setSourcesFailed(true)
      })
    return () => {
      live = false
    }
  }, [])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return

    // Same checks as the server, run here only for an immediate answer.
    const local = validate({ email, handle, note, source })
    if (!local.ok) {
      setErrors(local.errors)
      return
    }

    setErrors({})
    setSending(true)

    try {
      const response = await fetch('/api/waitlist', {
        body: JSON.stringify({ company: '', email, handle, note, source }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })

      if (response.status === 422) {
        const data: { errors: Errors } = await response.json()
        setErrors(data.errors)
        return
      }
      if (!response.ok) {
        setErrors({ form: 'Something went wrong on our side. Try again in a moment.' })
        return
      }
      setDone(true)
    } catch {
      setErrors({ form: 'We could not reach the server. Check your connection and try again.' })
    } finally {
      setSending(false)
    }
  }

  if (done) {
    const reach = email.trim().toLowerCase() || `@${normaliseHandle(handle)}`

    return (
      <div className="wl-done" role="status">
        <span className="wl-done-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <p className="wl-done-title">You are on the list.</p>
        <p className="wl-done-body">We will reach out when there is something worth your time. No newsletter.</p>

        <p className="wl-done-reach">
          <span>We will use</span>
          <code>{reach}</code>
        </p>

        <div className="wl-done-follow">
          <p></p>
          <a className="wl-follow" href={contact.x.href} rel="noreferrer" target="_blank">
            <XIcon />
            Follow {contact.x.handle}
          </a>
        </div>

        <a className="wl-done-back" href={site.home}>
          Back to the site
        </a>
      </div>
    )
  }

  return (
    <form className="wl-form" noValidate onSubmit={submit}>
      <div className="wl-field">
        <label htmlFor="wl-email">Email</label>
        <input
          aria-describedby={errors.email ? 'wl-email-error' : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          id="wl-email"
          inputMode="email"
          maxLength={LIMITS.email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          type="email"
          value={email}
        />
        {errors.email ? (
          <p className="wl-error" id="wl-email-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="wl-field">
        <label htmlFor="wl-handle">X handle</label>
        <div className="wl-prefixed">
          <span aria-hidden="true">@</span>
          <input
            aria-describedby={errors.handle ? 'wl-handle-error' : undefined}
            aria-invalid={Boolean(errors.handle)}
            autoCapitalize="none"
            autoCorrect="off"
            id="wl-handle"
            maxLength={LIMITS.handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="mesub_io"
            spellCheck={false}
            value={handle}
          />
        </div>
        {errors.handle ? (
          <p className="wl-error" id="wl-handle-error">
            {errors.handle}
          </p>
        ) : null}
      </div>

      <p className="wl-hint">One of the two is enough -  whichever you actually read.</p>

      <div className="wl-field">
        <label htmlFor="wl-source">How did you hear about us?</label>
        <select
          aria-describedby={errors.source ? 'wl-source-error' : undefined}
          aria-invalid={Boolean(errors.source)}
          disabled={sources.length === 0}
          id="wl-source"
          onChange={(event) => setSource(event.target.value)}
          value={source}
        >
          <option value="">{sourcesFailed ? 'Options unavailable' : sources.length ? 'Select one' : 'Loading…'}</option>
          {sources.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.source ? (
          <p className="wl-error" id="wl-source-error">
            {errors.source}
          </p>
        ) : null}
      </div>

      <div className="wl-field">
        <label htmlFor="wl-note">
          What are you building? <span>Optional</span>
        </label>
        <textarea
          aria-describedby={errors.note ? 'wl-note-error' : undefined}
          aria-invalid={Boolean(errors.note)}
          id="wl-note"
          maxLength={LIMITS.note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="A membership app, an API with paid tiers, a private community…"
          rows={3}
          value={note}
        />
        {errors.note ? (
          <p className="wl-error" id="wl-note-error">
            {errors.note}
          </p>
        ) : null}
      </div>

      {/* Not shown, not focusable, not announced: only a bot fills it. */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="wl-trap"
        name="company"
        tabIndex={-1}
        onChange={() => undefined}
      />

      {errors.form ? (
        <p className="wl-error wl-error-form" role="alert">
          {errors.form}
        </p>
      ) : null}

      <button className="cta wl-submit" disabled={sending} type="submit">
        {sending ? 'Sending…' : 'Join the waitlist'}
      </button>
    </form>
  )
}
