import { ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'hover:bg-primary-600 bg-primary-500 text-black focus-visible:ring-primary-500':
              variant === 'primary',
            'hover:bg-secondary-600 bg-secondary-500 text-white focus-visible:ring-secondary-500':
              variant === 'secondary',
            'hover:bg-gray-100 focus-visible:ring-gray-500': variant === 'ghost',
          },
          {
            'h-11 px-4 text-sm': size === 'sm', // 44px minimum for touch
            'h-12 px-4 text-base': size === 'md',
            'h-14 px-6 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
