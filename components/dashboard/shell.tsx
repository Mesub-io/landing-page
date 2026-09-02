'use client'

import { useState } from 'react'

import { ClaudeMark } from '@/components/claude-mark'
import { Logo } from '@/components/logo'
import type { Period } from '@/lib/dashboard/data'
import { PERIODS, planById, projectById, projects } from '@/lib/dashboard/data'
import { formatAmount, formatMoney } from '@/lib/dashboard/format'

import { Icon } from './bits'
import { DetailPanel } from './detail'
import { Overview } from './overview'
import type { Detail } from './tables'

/**
 * The dashboard shell.
 *
 * Only the overview exists for now. The rest of the lifecycle -  plans,
 * subscriptions, collection, recovery, entitlements, events -  is still listed
 * in the sidebar so the shape of the product stays visible, but those entries
 * are disabled rather than linking to an empty screen. The data model in
 * `lib/dashboard` already covers every one of them, so they are a rendering job
 * when their turn comes, not a modelling one.
 *
 * One client component holds the navigation state -  which project, which plan,
 * which period, which row is open. It is a single screen with panes rather than
 * a set of routes on purpose: nearly every action here is "show me the rows
 * behind that number", and a route change would throw away the scope the reader
 * just set.
 */

const NAV: { icon: string; label: string; ready?: boolean }[] = [
  { label: 'Overview', icon: 'overview', ready: true },
  { label: 'Plans', icon: 'plans' },
  { label: 'Subscriptions', icon: 'subscriptions' },
  { label: 'Collection', icon: 'pulls' },
  { label: 'Recovery', icon: 'failed' },
  { label: 'Entitlements', icon: 'entitlements' },
  { label: 'Events', icon: 'events' },
  { label: 'Settings', icon: 'settings' },
]

export function DashboardShell() {
  const [projectId, setProjectId] = useState<string>(projects[0].id)
  const [planId, setPlanId] = useState<string>('all')
  const [period, setPeriod] = useState<Period>(30)
  const [detail, setDetail] = useState<Detail | null>(null)

  const project = projectById.get(projectId) ?? projects[0]
  /* The plan list follows the project, and a plan that does not belong to the
     newly chosen project cannot stay selected. */
  const projectPlans = project.planIds.map((id) => planById.get(id)).filter(Boolean)

  function switchProject(nextId: string) {
    setProjectId(nextId)
    setPlanId('all')
  }

  /* What a subscription to the chosen plan costs, stated in the bar so the two
     facts about the scope sit together.

     Prices are written in dollars like everything else on the screen, except
     when a plan settles in something other than the default token -  there the
     token is named, because "$290 / year" would hide that this one is billed in
     USDT and the subscriber holds none of it.

     With no single plan chosen there is no single price, so the badge falls back
     to a range. Plans on another token or another interval are left out of that
     range rather than folded into it: "$9 - $299 / month" would be a lie the
     moment a yearly USDT plan joined the set. */
  const selectedPlan = planId === 'all' ? undefined : planById.get(planId)
  const comparable = projectPlans.filter(
    (plan) => plan!.token === 'USDC' && plan!.interval === 'month',
  )
  const amounts = comparable.map((plan) => plan!.amount)
  const priceLabel = selectedPlan
    ? `${
        selectedPlan.token === 'USDC'
          ? formatMoney(selectedPlan.amount)
          : formatAmount(selectedPlan.amount, selectedPlan.token)
      } / ${selectedPlan.interval}`
    : amounts.length === 0
      ? null
      : `${formatMoney(Math.min(...amounts))} - ${formatMoney(Math.max(...amounts))} / month`

  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="dash-brand">
          <Logo />
          Mesub
        </div>

        <nav className="dash-nav" aria-label="Dashboard sections">
          {NAV.map((item) => (
            <button
              /* The label is hidden on narrow screens where the strip only has
                 room for icons, so the accessible name has to come from the
                 attribute -  a button with a display:none label has no name at
                 all to a screen reader. */
              aria-current={item.ready ? 'page' : undefined}
              aria-label={item.ready ? item.label : `${item.label}, not built yet`}
              className="dash-nav-item"
              disabled={!item.ready}
              key={item.label}
              title={item.ready ? item.label : `${item.label} - not built yet`}
              type="button"
            >
              <Icon kind={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash-side-foot">
          <div className="dash-account">
            <span className="dash-avatar" aria-hidden="true">
              {project.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="dash-account-text">
              <span className="dash-account-name">{project.name}</span>
              <span className="dash-account-plan">{project.environment}</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="dash-main">
        {/* The scope bar, as one breadcrumb rather than a row of labelled boxes.
            Project, plan and period are a hierarchy -  each one narrows what the
            next one means -  so they read as a path and not as unrelated
            switches. */}
        <header className="dash-top">
          <nav className="dash-crumbs" aria-label="Scope">
            <span className="dash-crumb">
              <Icon className="dash-crumb-icon" kind="plans" />
              <span className="dash-crumb-control">
                <select
                  aria-label="Project"
                  onChange={(event) => switchProject(event.target.value)}
                  value={projectId}
                >
                  {projects.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
                <Icon className="dash-crumb-chevron" kind="updown" />
              </span>
            </span>

            <span className="dash-crumb-sep" aria-hidden="true">
              /
            </span>

            <span className="dash-crumb">
              <span className="dash-crumb-control">
                <select
                  aria-label="Plan"
                  onChange={(event) => setPlanId(event.target.value)}
                  value={planId}
                >
                  <option value="all">All plans</option>
                  {projectPlans.map((plan) => (
                    <option key={plan!.id} value={plan!.id}>
                      {plan!.name}
                    </option>
                  ))}
                </select>
                <Icon className="dash-crumb-chevron" kind="updown" />
              </span>
              {priceLabel && <span className="dash-badge dash-badge-price">{priceLabel}</span>}
            </span>

            <span className="dash-crumb-sep" aria-hidden="true">
              /
            </span>

            <span className="dash-crumb">
              <span className="dash-crumb-control">
                <select
                  aria-label="Period"
                  onChange={(event) => setPeriod(Number(event.target.value) as Period)}
                  value={period}
                >
                  {PERIODS.map((value) => (
                    <option key={value} value={value}>
                      Last {value} days
                    </option>
                  ))}
                </select>
                <Icon className="dash-crumb-chevron" kind="updown" />
              </span>
            </span>
          </nav>

          <span className="dash-top-spacer" />

          {/* The MCP entry point: point Claude at this account and ask it
              questions in words instead of assembling the query by hand. */}
          <button className="dash-claude" type="button">
            <ClaudeMark size={16} />
            Connect me
          </button>
        </header>

        <div className="dash-view">
          <div className="dash-view-head">
            <h2>Overview</h2>
          </div>

          <Overview
            onOpenDetail={setDetail}
            onPeriodChange={setPeriod}
            period={period}
            planId={planId}
          />
        </div>
      </div>

      {detail && <DetailPanel detail={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
