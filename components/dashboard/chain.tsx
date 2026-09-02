import type { ChainStep } from '@/lib/dashboard/data'
import { timeAgo } from '@/lib/dashboard/format'

/**
 * The lifecycle chain: due date, attempt, transaction, confirmation, webhook,
 * entitlement.
 *
 * It is always the same six steps in the same order, whether it is drawn for a
 * pull or for a subscription. That repetition is the point -  a merchant learns
 * the shape once and can then read any case in the product in a couple of
 * seconds, which is the whole argument for a billing layer over a block
 * explorer. The explorer can show them the transaction; only this can show them
 * that the transaction confirmed and the customer still cannot log in.
 */
export function Chain({ steps }: { steps: ChainStep[] }) {
  return (
    <ol className="dash-chain">
      {steps.map((step, index) => (
        <li className="dash-chain-step" data-state={step.state} key={`${step.label}-${index}`}>
          <span className="dash-chain-marker" aria-hidden="true" />
          <div className="dash-chain-body">
            <span className="dash-chain-label">
              {step.label}
              {step.hoursAgo !== undefined && (
                <span className="dash-muted dash-num"> · {timeAgo(step.hoursAgo)}</span>
              )}
            </span>
            <span className="dash-chain-detail">{step.detail}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
