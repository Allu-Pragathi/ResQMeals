type StatCardProps = {
  label: string
  value: string
  change?: string
}

const StatCard = ({ label, value, change }: StatCardProps) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm text-slate/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate">{value}</p>
      {change && <p className="text-xs text-primary mt-1">{change}</p>}
    </div>
  )
}

export default StatCard
