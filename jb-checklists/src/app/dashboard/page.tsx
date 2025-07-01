import { requireRole } from '@/lib/auth'
import { DashboardGrid } from './dashboard-grid'

export default async function DashboardPage() {
  await requireRole('MANAGER')

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Manager Dashboard
      </h1>
      <DashboardGrid />
    </div>
  )
}
