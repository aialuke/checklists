import React from 'react'

import {
  CheckCircle,
  Camera,
  Menu,
  BarChart,
  Settings,
  Users,
  ClipboardList,
  Bell,
  LogOut,
  User,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckSquare,
  Square,
  X,
  Home,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Wifi,
  WifiOff,
  AlertCircle,
  XCircle,
  type LucideProps,
} from 'lucide-react'

// Icon name mapping for tree-shaking optimization
const iconMap = {
  'check-circle': CheckCircle,
  camera: Camera,
  menu: Menu,
  'bar-chart': BarChart,
  settings: Settings,
  users: Users,
  'clipboard-list': ClipboardList,
  bell: Bell,
  'log-out': LogOut,
  user: User,
  'chevron-right': ChevronRight,
  plus: Plus,
  search: Search,
  filter: Filter,
  calendar: Calendar,
  clock: Clock,
  'alert-triangle': AlertTriangle,
  'check-square': CheckSquare,
  square: Square,
  x: X,
  home: Home,
  'loader-2': Loader2,
  'refresh-cw': RefreshCw,
  'arrow-left': ArrowLeft,
  wifi: Wifi,
  'wifi-off': WifiOff,
  'alert-circle': AlertCircle,
  'x-circle': XCircle,
} as const

export type IconName = keyof typeof iconMap

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName
  className?: string
}

/**
 * Optimized Icon component using tree-shaken Lucide React icons
 * Follows design system patterns from UIStylingPlan.md
 */
export const Icon: React.FC<IconProps> = ({ name, className = '', size = 24, ...props }) => {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`)
    return null
  }

  return (
    <IconComponent
      size={size}
      className={`motion-reduce:transition-none ${className}`}
      {...props}
    />
  )
}

// Export individual icons for direct use when needed


