'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useDashboardData, useRealtimeSubscription } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardGrid() {
  const { data: dashboardData, isLoading, error } = useDashboardData()
  const { subscribe } = useRealtimeSubscription()
  const queryClient = useQueryClient()

  // Setup real-time subscription
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      // Invalidate dashboard data when tasks are updated
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    return unsubscribe
  }, [subscribe, queryClient])

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  if (error) {
    return <div>Error loading dashboard data</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboardData?.map((item) => (
        <Link key={`${item.department}-${item.checklistType}`} href={`/checklists/${item.checklistId}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-secondary-500">
                {item.checklistType === 'OPENING' ? '🌅' : '🌙'} {item.department}
              </CardTitle>
              <div className="text-sm text-gray-600">
                {item.checklistType} Checklist
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">
                    {item.completedTasks}/{item.totalTasks}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.completionPercentage === 100 
                        ? 'bg-green-500' 
                        : 'bg-primary-500'
                    }`}
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  {item.completionPercentage === 100 ? (
                    <span className="text-green-600 font-medium">✓ Complete</span>
                  ) : item.completedTasks > 0 ? (
                    `${Math.round(item.completionPercentage)}% complete`
                  ) : (
                    'Not started'
                  )}
                </div>
                
                {item.lastUpdated && (
                  <div className="text-xs text-gray-400">
                    Last updated: {new Date(item.lastUpdated).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 