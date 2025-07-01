import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type ChecklistWithTasks = Database['public']['Tables']['checklists']['Row'] & {
  tasks: Database['public']['Tables']['tasks']['Row'][];
};

export function useChecklists(department?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['checklists', department],
    queryFn: async () => {
      let query = supabase
        .from('checklists')
        .select(
          `
          *,
          tasks (*)
        `
        )
        .order('type');

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      return data as ChecklistWithTasks[];
    },
    enabled: !!department,
    networkMode: 'offlineFirst',
  });
}

export function useChecklist(checklistId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['checklist', checklistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(
          `
          *,
          tasks (*)
        `
        )
        .eq('id', checklistId)
        .single();

      if (error) {
        throw error;
      }
      return data as ChecklistWithTasks;
    },
    networkMode: 'offlineFirst',
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ taskId, staffNumber }: { taskId: string; staffNumber: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          completed_by: staffNumber,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    networkMode: 'offlineFirst',
    onMutate: async ({ taskId, staffNumber }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['checklist'] });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: ['checklist'] });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ['checklist'] },
        (old: ChecklistWithTasks | undefined) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            tasks: old.tasks.map(task =>
              task.id === taskId
                ? {
                    ...task,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    completed_by: staffNumber,
                  }
                : task
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error using snapshot
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to complete task. Will retry when online.');
    },
    onSuccess: () => {
      toast.success('Task completed!');
      // Invalidate related queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
