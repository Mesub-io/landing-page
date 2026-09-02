/**
 * The Mesub mark, from `public/mesub-mark.png`.
 *
 * It is painted as a CSS mask rather than an <img>, so the artwork takes
 * `currentColor` and sits on any surface without carrying a white box.
 */
export function Logo({ className }: { className?: string }) {
  return <span aria-hidden="true" className={['mark', className].filter(Boolean).join(' ')} />
}
