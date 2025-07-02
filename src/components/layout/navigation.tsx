import Link from 'next/link';

import { logoutAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';

export async function Navigation() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const { staff, department } = session;
  const isManager = staff.role === 'MANAGER';

  return (
    <nav className='border-b bg-white shadow-sm'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='flex h-16 justify-between'>
          <div className='flex items-center'>
            <Link href='/' className='text-lg @sm:text-xl @md:text-2xl font-bold text-gray-900'>
              JB Checklists
            </Link>
          </div>

          <div className='flex items-center space-x-4'>
            {isManager ? (
              <Link href='/dashboard' className='text-gray-700 hover:text-gray-900'>
                Dashboard
              </Link>
            ) : (
              <Link href='/checklists' className='text-gray-700 hover:text-gray-900'>
                Checklists
              </Link>
            )}

            <Link href='/profile' className='text-gray-700 hover:text-gray-900'>
              Profile
            </Link>

            <div className='text-sm text-gray-500'>
              {staff.name}
              {department && ` - ${department}`}
            </div>

            <form action={logoutAction}>
              <Button variant='ghost' type='submit'>
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
