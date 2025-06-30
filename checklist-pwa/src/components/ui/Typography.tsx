import React from 'react'

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption'
type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

interface TypographyProps {
  variant?: TypographyVariant
  element?: TypographyElement
  className?: string
  children: React.ReactNode
}

const typographyVariants = {
  h1: 'text-xl md:text-2xl lg:text-3xl font-bold text-secondary-500',
  h2: 'text-lg md:text-xl lg:text-2xl font-semibold text-foreground',
  h3: 'text-base md:text-lg lg:text-xl font-medium text-foreground',
  body: 'text-sm md:text-base text-foreground',
  caption: 'text-xs md:text-sm text-foreground-muted',
}

const elementMapping: Record<TypographyVariant, TypographyElement> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'span',
}

/**
 * Typography component implementing responsive type scale
 * Follows mobile-first design principles from UIStylingPlan.md
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  element,
  className = '',
  children,
}) => {
  const Component = element ?? elementMapping[variant]
  const variantClasses = typographyVariants[variant]

  return React.createElement(
    Component,
    {
      className: `${variantClasses} ${className}`.trim(),
    },
    children,
  )
}

// Convenience components for common use cases
const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant='h1' {...props} />
)

const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant='h2' {...props} />
)

const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant='h3' {...props} />
)

const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant='body' {...props} />
)

const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant='caption' {...props} />
)

