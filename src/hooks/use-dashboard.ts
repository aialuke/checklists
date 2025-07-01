import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

type DashboardData = {
  department: string;
  checklistType: 'OPENING' | 'CLOSING';
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated?: string;
  checklistId: string;
};

export function useDashboardData() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(
          `
          id,
          department,
          type,
          tasks (
            id,
            completed,
            updated_at
          )
        `
        )
        .order('department')
        .order('type');

      if (error) {
        throw error;
      }

      const dashboardData: DashboardData[] = data.map(checklist => {
        const totalTasks = checklist.tasks.length;
        const completedTasks = checklist.tasks.filter(task => task.completed).length;
        const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const lastUpdated = checklist.tasks
          .filter(task => task.completed)
          .sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0]?.updated_at;

        return {
          department: checklist.department,
          checklistType: checklist.type as 'OPENING' | 'CLOSING',
          totalTasks,
          completedTasks,
          completionPercentage,
          lastUpdated,
          checklistId: checklist.id,
        };
      });

      return dashboardData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useRealtimeSubscription() {
  const supabase = createClient();

  return {
    subscribe: (onTaskUpdate: () => void) => {
      const channel = supabase
        .channel('task_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tasks',
          },
          () => {
            onTaskUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
