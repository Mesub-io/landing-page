/**
 * A hand-drawn rule between two sections.
 *
 * Two passes of the same wandering path, offset and at different opacities,
 * the way a pencil doubles back over a line. It stretches to any width because
 * the viewBox is not preserved.
 */
export function SketchDivider() {
  return (
    <div className="sketch" aria-hidden="true">
      <svg viewBox="0 0 1200 26" preserveAspectRatio="none" fill="none">
        <path
          d="M0 15C64 8 118 19 186 13s108-9 176-3 122 12 188 6 116-13 184-7 118 14 186 8 100-11 156-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M6 18C70 12 120 22 188 16s110-8 178-2 120 11 186 5 118-12 186-6 116 13 184 7 98-10 154-5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
    </div>
  )
}
