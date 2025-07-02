'use client';

import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChecklist, useCompleteTask } from '@/hooks/use-checklists';

interface ChecklistDetailProps {
  checklistId: string;
  staffNumber: string;
}

export function ChecklistDetail({ checklistId, staffNumber }: ChecklistDetailProps) {
  const { data: checklist, isLoading, error } = useChecklist(checklistId);
  const completeTaskMutation = useCompleteTask();

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate({ taskId, staffNumber });
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='mb-4 h-8 w-1/3 rounded bg-gray-200'></div>
          <div className='h-4 w-1/2 rounded bg-gray-200'></div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardContent className='p-4'>
                <div className='h-4 rounded bg-gray-200'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-red-600'>Failed to load checklist. Please try again.</p>
        <Link href='/checklists'>
          <Button variant='ghost' className='mt-4'>
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            Back to Checklists
          </Button>
        </Link>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>Checklist not found.</p>
        <Link href='/checklists'>
          <Button variant='ghost' className='mt-4'>
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            Back to Checklists
          </Button>
        </Link>
      </div>
    );
  }

  const totalTasks = checklist.tasks.length;
  const completedTasks = checklist.tasks.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const sortedTasks = [...checklist.tasks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='mb-2 flex items-center space-x-4'>
            <Link href='/checklists'>
              <Button variant='ghost' size='sm'>
                <ArrowLeftIcon className='mr-2 h-4 w-4' />
                Back
              </Button>
            </Link>
            <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900'>
              {checklist.department} - {checklist.type}
            </h1>
          </div>
          <p className='text-gray-600'>
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        <div className='text-right'>
          <div className='text-primary-600 text-lg md:text-xl lg:text-2xl font-bold'>
            {Math.round(progressPercentage)}%
          </div>
          <div className='text-sm text-gray-500'>Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='h-3 w-full rounded-full bg-gray-200'>
        <div
          className='h-3 rounded-full bg-primary-500 transition-all duration-300'
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Task List */}
      <div className='space-y-3'>
        {sortedTasks.map(task => {
          const isCompleting =
            completeTaskMutation.isPending && completeTaskMutation.variables?.taskId === task.id;

          return (
            <Card
              key={task.id}
              className={`transition-all ${
                task.completed ? 'border-green-200 bg-green-50' : 'hover:shadow-sm'
              }`}
            >
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-1 items-start space-x-3'>
                    <div
                      className={`rounded-full p-1 ${
                        task.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <CheckIcon className='h-4 w-4' />
                    </div>

                    <div className='flex-1'>
                      <p
                        className={`${
                          task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {task.description}
                      </p>

                      {task.completed && task.completed_by && task.completed_at && (
                        <p className='mt-1 text-sm md:text-xs text-gray-500'>
                          Completed by {task.completed_by} on{' '}
                          {new Date(task.completed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {!task.completed && (
                    <Button
                      size='sm'
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={isCompleting}
                      className='ml-4'
                    >
                      {isCompleting ? 'Completing...' : 'Complete'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Status */}
      {progressPercentage === 100 && (
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='p-6 text-center'>
            <div className='mb-2 text-green-600'>
              <CheckIcon className='mx-auto h-8 w-8' />
            </div>
            <h3 className='mb-1 text-lg font-semibold text-green-800'>Checklist Complete!</h3>
            <p className='text-green-700'>All tasks have been completed successfully.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
