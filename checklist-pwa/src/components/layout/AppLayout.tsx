import React from 'react'

import BottomNavigation from './BottomNavigation'
import Header from './Header'
import { type IconName } from '../ui/Icon'

interface AppLayoutProps {
  // Header props
  headerTitle: string
  headerSubtitle?: string
  headerBadge?: {
    text: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }
  headerLeftAction?: {
    icon: IconName
    onClick: () => void
    ariaLabel: string
  }
  headerRightAction?: {
    icon: IconName
    onClick: () => void
    ariaLabel: string
  }

  // Navigation props
  navigationItems: {
    id: string
    label: string
    icon: IconName
    href?: string
    onClick?: () => void
  }[]
  activeNavigationId: string
  onNavigationItemClick?: (item: { id: string; label: string; icon: IconName }) => void

  // Layout props
  children: React.ReactNode
  className?: string
  showBottomNavigation?: boolean
}

/**
 * Main app layout component implementing PWA shell pattern
 * Provides consistent header, content area, and bottom navigation
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  headerTitle,
  headerSubtitle,
  headerBadge,
  headerLeftAction,
  headerRightAction,
  navigationItems,
  activeNavigationId,
  onNavigationItemClick,
  children,
  className = '',
  showBottomNavigation = true,
}) => {
  return (
    <div className={`bg-surface-base flex min-h-screen flex-col ${className}`.trim()}>
      {/* Header */}
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        badge={headerBadge}
        leftAction={headerLeftAction}
        rightAction={headerRightAction}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-auto ${showBottomNavigation ? 'pb-16' : ''} `.trim()}
        role='main'
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNavigation && (
        <BottomNavigation
          items={navigationItems}
          activeItemId={activeNavigationId}
          onItemClick={onNavigationItemClick}
        />
      )}
    </div>
  )
}

