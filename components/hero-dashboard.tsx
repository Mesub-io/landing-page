import { planById, subscriptions } from '@/lib/dashboard/data'
import { formatMoney, timeUntil } from '@/lib/dashboard/format'

/**
 * The same account, seen from the subscriber's side, for the phone in front of
 * the window. It is the other half of the argument the hero is making: one
 * delegation signed, and the product knows whether to let them in.
 *
 * Four lines and a way out: the plan, its price, its state, and when the next
 * collection runs. The empty space under the card is the screen's, not a gap to
 * be filled -  a subscription screen that needs padding to look finished is
 * showing things the product does not have.
 */
export function HeroPhoneCard() {
  const subscription = subscriptions[0]
  const plan = planById.get(subscription.planId)

  return (
    <div aria-hidden="true" className="dash hero-phone-dash">
      <span className="hero-phone-title">Your plan</span>

      <div className="dash-card">
        <div className="dash-card-body">
          <span className="hero-phone-plan">{plan?.name}</span>
          <span className="hero-phone-amount dash-num">
            {formatMoney(plan?.amount ?? 0)} / {plan?.interval}
          </span>
          <span className="dash-pill" data-status="active">
            active
          </span>

          <div className="hero-phone-row">
            <span className="dash-muted">Next payment</span>
            <span className="dash-num">{timeUntil(subscription.dueInHours)}</span>
          </div>
        </div>
      </div>

      <span className="hero-phone-cta">Manage subscription</span>
    </div>
  )
}
