import { requireRole } from '@/lib/auth';
import { DashboardGrid } from './dashboard-grid';

export default async function DashboardPage() {
  await requireRole('MANAGER');

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-8 text-xl md:text-2xl lg:text-3xl font-bold text-gray-900'>Manager Dashboard</h1>
      <DashboardGrid />
    </div>
  );
}
