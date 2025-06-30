import React from 'react'

import { Icon, type IconName } from '../ui/Icon'

interface NavItem {
  id: string
  label: string
  icon: IconName
  href?: string
  onClick?: () => void
}

interface BottomNavigationProps {
  items: NavItem[]
  activeItemId: string
  onItemClick?: (item: NavItem) => void
  className?: string
}

/**
 * Bottom Navigation component for mobile-first PWA navigation
 * Features touch-optimized targets and visual feedback
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeItemId,
  onItemClick,
  className = '',
}) => {
  const handleItemClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick()
    }
    if (onItemClick) {
      onItemClick(item)
    }
  }

  return (
    <nav
      className={`bg-surface-card border-surface-stroke pb-safe-bottom fixed right-0 bottom-0 left-0 z-30 h-16 border-t ${className} `.trim()}
      role='navigation'
      aria-label='Main navigation'
    >
      <div className='flex h-full'>
        {items.map((item) => {
          const isActive = item.id === activeItemId

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`min-h-touch focus:ring-primary-500 flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-150 focus:ring-2 focus:outline-none focus:ring-inset active:scale-95 motion-reduce:transform-none motion-reduce:transition-none ${
                isActive ? 'text-primary-500' : 'text-foreground-muted hover:text-foreground'
              } `.trim()}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={item.icon} size={20} className='flex-shrink-0' />
              <span className='max-w-full truncate text-xs font-medium'>{item.label}</span>
              {isActive && (
                <div
                  className='bg-primary-500 h-1 w-1 flex-shrink-0 rounded-full'
                  aria-hidden='true'
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
