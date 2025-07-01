import { cookies } from 'next/headers';

import { createClient } from '@/lib/supabase/server';
import type { Staff } from '@/types/auth.types';

export async function getSession(): Promise<{ staff: Staff; department?: string } | null> {
  const cookieStore = cookies();
  const staffNumber = cookieStore.get('staff_number')?.value;
  const department = cookieStore.get('department')?.value;

  if (!staffNumber) {
    return null;
  }

  const supabase = await createClient();
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('staff_number', staffNumber)
    .single();

  if (!staff) {
    return null;
  }

  return {
    staff,
    department: department ?? undefined,
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireRole(role: 'TEAM_MEMBER' | 'MANAGER') {
  const session = await requireAuth();
  if (session.staff.role !== role) {
    throw new Error('Insufficient permissions');
  }
  return session;
}
