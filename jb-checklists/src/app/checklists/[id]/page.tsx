import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';

import { ChecklistDetail } from './checklist-detail';

interface ChecklistPageProps {
  params: {
    id: string;
  };
}

export default async function ChecklistPage({ params }: ChecklistPageProps) {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const { staff } = session;

  return (
    <div className='container mx-auto px-4 py-8'>
      <ChecklistDetail checklistId={params.id} staffNumber={staff.staff_number} />
    </div>
  );
}
