'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  try {
    const staffNumber = formData.get('staffNumber') as string;
    const department = formData.get('department') as string;

    if (!staffNumber) {
      redirect('/auth?error=missing-staff-number');
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      redirect('/auth?error=server-configuration');
    }

    const supabase = await createClient();

    // Verify staff exists with proper error handling
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('staff_number', staffNumber)
      .single();

    if (staffError) {
      console.error('Database error:', staffError);
      redirect('/auth?error=database-error');
    }

    if (!staff) {
      redirect('/auth?error=invalid-staff-number');
    }

    // For team members, department is required
    if (staff.role === 'TEAM_MEMBER' && !department) {
      redirect('/auth?error=department-required');
    }

    // Set session cookies with proper production settings
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    
    cookieStore.set('staff_number', staffNumber, cookieOptions);
    
    if (staff.role === 'TEAM_MEMBER' && department) {
      cookieStore.set('department', department, cookieOptions);
    }

    revalidatePath('/', 'layout');
    
    // Redirect outside try-catch as per Next.js best practices
  } catch (error) {
    console.error('Login action error:', error);
    redirect('/auth?error=server-error');
  }

  // This redirect happens after successful authentication
  const staff = formData.get('staffNumber') as string;
  const supabase = await createClient();
  const { data } = await supabase
    .from('staff')
    .select('role')
    .eq('staff_number', staff)
    .single();
  
  redirect(data?.role === 'MANAGER' ? '/dashboard' : '/checklists');
}

export async function logoutAction() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    
    cookieStore.set('staff_number', '', { 
      expires: new Date(0),
      path: '/',
      httpOnly: true 
    });
    cookieStore.set('department', '', { 
      expires: new Date(0),
      path: '/',
      httpOnly: true 
    });

    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Logout action error:', error);
  }
  
  redirect('/auth');
}
