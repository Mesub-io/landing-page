import { DashboardShell } from '@/components/dashboard/shell'

/**
 * The dashboard, v1.
 *
 * Every figure on this screen comes from `lib/dashboard/data.ts` and describes a
 * fictional merchant account. None of it is a claim about Mesub's own traction,
 * and nothing is fetched: the point of this build is to settle what the screens
 * have to answer before the API exists to answer it.
 */
export default function DashboardPage() {
  return <DashboardShell />
}
