/**
 * Validation shared by the API route and the form.
 *
 * The server is the authority: the client runs the same checks only to give
 * immediate feedback. Nothing here trusts input that arrived over the wire.
 */

import { referralSourceIds } from './sources'

export const LIMITS = {
  email: 254,
  handle: 15,
  note: 280,
}

/**
 * Pragmatic address check: one @, something either side, a dotted domain, no
 * whitespace. Deliberately not RFC 5322 — that regex accepts more than any
 * mail server does and rejects nothing useful.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/** X handles are 1-15 characters, letters, digits and underscore only. */
const HANDLE = /^[A-Za-z0-9_]{1,15}$/

export interface WaitlistSubmission {
  email?: string
  handle?: string
  note?: string
  source?: string
}

export interface ValidationResult {
  errors: Partial<Record<'email' | 'form' | 'handle' | 'note' | 'source', string>>
  ok: boolean
  value: { email: string | null; handle: string | null; note: string | null; source: string }
}

/** Strips a leading @ and any surrounding whitespace, so `@Mesub_io ` works. */
export function normaliseHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '')
}

export function validate(input: WaitlistSubmission): ValidationResult {
  const errors: ValidationResult['errors'] = {}

  const email = (input.email ?? '').trim()
  const handle = normaliseHandle(input.handle ?? '')
  const note = (input.note ?? '').trim()
  const source = (input.source ?? '').trim()

  if (email && email.length > LIMITS.email) {
    errors.email = 'That address is too long.'
  } else if (email && !EMAIL.test(email)) {
    errors.email = 'That does not look like an email address.'
  }

  if (handle && !HANDLE.test(handle)) {
    errors.handle =
      handle.length > LIMITS.handle
        ? 'An X handle is at most 15 characters.'
        : 'An X handle can only contain letters, numbers and underscores.'
  }

  // One way to reach you is the point of the list.
  if (!email && !handle) {
    errors.form = 'Give us an email address or an X handle so we can reach you.'
  }

  if (!source) {
    errors.source = 'Tell us how you found us.'
  } else if (!referralSourceIds.has(source)) {
    // The client sent something that is not on the server's list.
    errors.source = 'Pick one of the listed options.'
  }

  if (note.length > LIMITS.note) {
    errors.note = `Keep it under ${LIMITS.note} characters.`
  }

  return {
    errors,
    ok: Object.keys(errors).length === 0,
    value: {
      email: email ? email.toLowerCase() : null,
      handle: handle || null,
      note: note || null,
      source,
    },
  }
}
