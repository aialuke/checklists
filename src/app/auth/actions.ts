'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const staffNumber = formData.get('staffNumber') as string;
  const department = formData.get('department') as string;

  if (!staffNumber) {
    redirect('/auth?error=missing-staff-number');
  }

  const supabase = await createClient();

  // Verify staff exists
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .eq('staff_number', staffNumber)
    .single();

  if (error || !staff) {
    redirect('/auth?error=invalid-staff-number');
  }

  // For team members, department is required
  if (staff.role === 'TEAM_MEMBER' && !department) {
    redirect('/auth?error=department-required');
  }

  // Store session data (simple approach - just staff number in cookie)
  const response = redirect(staff.role === 'MANAGER' ? '/dashboard' : '/checklists');

  // Set session cookie
  const headers = new Headers();
  headers.set('Set-Cookie', `staff_number=${staffNumber}; Path=/; HttpOnly; SameSite=Strict`);

  if (staff.role === 'TEAM_MEMBER') {
    headers.append('Set-Cookie', `department=${department}; Path=/; HttpOnly; SameSite=Strict`);
  }

  revalidatePath('/', 'layout');
  return response;
}

export async function logoutAction() {
  const headers = new Headers();
  headers.set('Set-Cookie', 'staff_number=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
  headers.append('Set-Cookie', 'department=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');

  revalidatePath('/', 'layout');
  redirect('/auth');
}
