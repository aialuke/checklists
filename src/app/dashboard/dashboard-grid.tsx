'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useDashboardData, useRealtimeSubscription } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardGrid() {
  const { data: dashboardData, isLoading, error } = useDashboardData();
  const { subscribe } = useRealtimeSubscription();
  const queryClient = useQueryClient();

  // Setup real-time subscription
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      // Invalidate dashboard data when tasks are updated
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    return unsubscribe;
  }, [subscribe, queryClient]);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className='@container grid grid-cols-1 gap-6 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4'>
      {dashboardData?.map(item => (
        <Link
          key={`${item.department}-${item.checklistType}`}
          href={`/checklists/${item.checklistId}`}
        >
          <Card className='cursor-pointer transition-shadow hover:shadow-md'>
            <CardHeader>
              <CardTitle className='text-secondary-500'>
                {item.checklistType === 'OPENING' ? '🌅' : '🌙'} {item.department}
              </CardTitle>
              <div className='text-sm md:text-xs text-gray-600'>{item.checklistType} Checklist</div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm md:text-xs text-gray-600'>Progress</span>
                  <span className='text-sm md:text-xs font-medium'>
                    {item.completedTasks}/{item.totalTasks}
                  </span>
                </div>

                <div className='h-2 w-full rounded-full bg-gray-200'>
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.completionPercentage === 100 ? 'bg-green-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>

                <div className='text-sm md:text-xs text-gray-500'>
                  {item.completionPercentage === 100 ? (
                    <span className='font-medium text-green-600'>✓ Complete</span>
                  ) : item.completedTasks > 0 ? (
                    `${Math.round(item.completionPercentage)}% complete`
                  ) : (
                    'Not started'
                  )}
                </div>

                {item.lastUpdated && (
                  <div className='text-sm md:text-xs text-gray-400'>
                    Last updated: {new Date(item.lastUpdated).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
