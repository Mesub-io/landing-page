/**
 * The Claude burst, drawn as eight tapered rays.
 * Used as an attribution mark next to the MCP entry point.
 */
export function ClaudeMark({ size = 20 }: { size?: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {rays.map((angle, i) => (
        <rect
          key={angle}
          x={11.15}
          y={i % 2 === 0 ? 1.6 : 3.6}
          width={1.7}
          height={i % 2 === 0 ? 8.6 : 6.6}
          rx={0.85}
          fill="currentColor"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}
