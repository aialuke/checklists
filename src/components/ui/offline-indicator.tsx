'use client';

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className='fixed right-4 top-4 z-50 flex items-center space-x-2 rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg'>
      <div className='h-5 w-5'>
        <svg
          className='h-5 w-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M18.364 5.636L5.636 18.364m0-12.728L18.364 18.364M12 8v4l3 3'
          />
        </svg>
      </div>
      <span className='text-sm'>Working Offline</span>
    </div>
  );
}
