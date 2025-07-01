import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';

export default async function Home() {
  // Check if user is already authenticated
  const session = await getSession();

  if (session) {
    // Redirect authenticated users to their appropriate dashboard
    redirect(session.staff.role === 'MANAGER' ? '/dashboard' : '/checklists');
  } else {
    // Redirect unauthenticated users to login
    redirect('/auth');
  }
}
