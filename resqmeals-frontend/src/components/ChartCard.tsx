import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate">{title}</h3>
        {subtitle && <p className="text-xs text-slate/60">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export default ChartCard
