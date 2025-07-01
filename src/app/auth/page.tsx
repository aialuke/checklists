import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';

import { loginAction } from './actions';

const DEPARTMENTS = ['Computers', 'Electronics', 'Gaming', 'Mobile', 'Audio'];

export default async function AuthPage({ searchParams }: { searchParams: { error?: string } }) {
  // Redirect if already authenticated
  const session = await getSession();
  if (session) {
    redirect(session.staff.role === 'MANAGER' ? '/dashboard' : '/checklists');
  }

  const error = searchParams.error;

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>JB Staff Login</h2>
        </div>
        <form className='mt-8 space-y-6' action={loginAction}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='staffNumber' className='block text-sm font-medium text-gray-700'>
                Staff Number
              </label>
              <input
                id='staffNumber'
                name='staffNumber'
                type='text'
                required
                className='mt-1 block h-12 w-full rounded-xl border border-gray-300 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500'
                placeholder='Enter your staff number'
              />
            </div>

            <div>
              <label htmlFor='department' className='block text-sm font-medium text-gray-700'>
                Department (Team Members Only)
              </label>
              <select
                id='department'
                name='department'
                className='mt-1 block h-12 w-full rounded-xl border border-gray-300 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500'
              >
                <option value=''>Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className='text-center text-sm text-red-600'>
              {error === 'missing-staff-number' && 'Please enter your staff number'}
              {error === 'invalid-staff-number' && 'Invalid staff number'}
              {error === 'department-required' && 'Please select your department'}
            </div>
          )}

          <button
            type='submit'
            className='hover:bg-primary-600 flex w-full justify-center rounded-full border border-transparent bg-primary-500 px-4 py-3 text-sm font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
