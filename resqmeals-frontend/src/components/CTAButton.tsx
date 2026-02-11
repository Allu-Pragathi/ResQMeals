import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type CTAButtonProps = {
  to: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

const CTAButton = ({ to, children, variant = 'primary' }: CTAButtonProps) => {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
  const styles =
    variant === 'primary'
      ? 'bg-primary text-white shadow-md hover:bg-primaryDark'
      : 'border border-primary text-primary hover:bg-primary/10'

  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
    </Link>
  )
}

export default CTAButton
