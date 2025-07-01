'use client';

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChecklists } from '@/hooks/use-checklists';

interface ChecklistGridProps {
  department: string;
  staffNumber: string;
}

export function ChecklistGrid({ department }: ChecklistGridProps) {
  const { data: checklists, isLoading, error } = useChecklists(department);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader>
              <div className='h-6 rounded bg-gray-200'></div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='h-4 rounded bg-gray-200'></div>
                <div className='h-4 w-3/4 rounded bg-gray-200'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-red-600'>Failed to load checklists. Please try again.</p>
      </div>
    );
  }

  if (!checklists?.length) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>No checklists found for {department}.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {checklists.map(checklist => {
        const totalTasks = checklist.tasks.length;
        const completedTasks = checklist.tasks.filter(task => task.completed).length;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return (
          <Link key={checklist.id} href={`/checklists/${checklist.id}`}>
            <Card className='cursor-pointer transition-shadow hover:shadow-md'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>{checklist.type}</span>
                  <span className='text-sm font-normal text-gray-500'>
                    {completedTasks}/{totalTasks}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {/* Progress Bar */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-primary-500 transition-all'
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-gray-500'>
                      Created: {new Date(checklist.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        progressPercentage === 100
                          ? 'bg-green-100 text-green-800'
                          : progressPercentage > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {progressPercentage === 100
                        ? 'Complete'
                        : progressPercentage > 0
                          ? 'In Progress'
                          : 'Not Started'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
