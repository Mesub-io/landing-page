'use client'

import { useEffect, useState } from 'react'

import { contact } from '@/lib/nav'

/**
 * The address, not a label that may do nothing.
 *
 * `mailto:` only works when the device has a mail handler registered -  on a
 * desktop without one, clicking it is silent. So the click does both: it lets
 * the mail client open if there is one, and copies the address either way,
 * with visible feedback. Something always happens.
 */
export function EmailAction({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <a
      className={['email-action', className].filter(Boolean).join(' ')}
      href={contact.email.href}
      onClick={() => {
        navigator.clipboard?.writeText(contact.email.address).then(
          () => setCopied(true),
          () => undefined,
        )
      }}
    >
      <span className="email-address">{contact.email.address}</span>
      <span className="email-hint" data-copied={copied}>
        {copied ? 'Copied' : 'Copy'}
      </span>
    </a>
  )
}
