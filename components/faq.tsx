import { faq } from '@/lib/faq'
import { site } from '@/lib/site'

import { EmailAction } from './email-action'

/**
 * The questions people actually type, answered in 40-60 words each.
 *
 * Native <details> so every answer is in the HTML whether or not it is open:
 * a crawler and an answer engine both read closed items.
 */
export function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="faq-inner">
        <div className="faq-head">
          <p className="eyebrow">Questions</p>
          <h2>Subscriptions on Solana, answered plainly.</h2>
          <p className="faq-definition">{site.definition}</p>
        </div>

        <div className="faq-list">
          {faq.map((item, index) => (
            /* A shared `name` makes these an exclusive accordion natively:
               opening one closes the rest, with no JavaScript. */
            <details className="faq-item" key={item.question} name="faq">
              <summary>
                <span className="faq-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.question}</h3>
                <span className="faq-sign" aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}

          <p className="faq-more">
            Still have a question? <EmailAction />
          </p>
        </div>
      </div>
    </section>
  )
}
