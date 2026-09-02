/** Small marks shared by the header and the contact menu. */

export function MailIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2.6 4.6h12.8v8.8H2.6zM2.7 5l6.3 4.5L15.3 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The X mark, drawn rather than fetched so it inherits the text colour. */
export function XIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M10.6 7.7 15.5 2h-1.2l-4.3 4.9L6.6 2H2.5l5.2 7.4-5.2 5.9h1.2l4.5-5.2 3.6 5.2h4.1l-5.3-7.6Zm-1.6 1.8-.5-.8-4.2-5.8h1.8l3.4 4.7.5.8 4.4 6.1h-1.8L9 9.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CopyIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6.4 6.4h7.2v7.2H6.4zM4.4 11.6V4.4h7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3.6 9.4 7 12.8l7.4-7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
