import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';

import { ChecklistGrid } from './checklist-grid';

export default async function ChecklistsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const { staff, department } = session;

  if (!department) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='py-12 text-center'>
          <p className='text-red-600'>No department assigned. Please contact your manager.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900'>{department} Checklists</h1>
        <p className='mt-2 text-gray-600'>Complete your daily tasks and track progress</p>
      </div>

      <ChecklistGrid department={department} staffNumber={staff.staff_number} />
    </div>
  );
}
