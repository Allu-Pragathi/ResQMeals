type KPICardProps = {
  label: string
  value: string
  trend?: string
}

const KPICard = ({ label, value, trend }: KPICardProps) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm text-slate/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate">{value}</p>
      {trend && <p className="text-xs text-primary mt-1">{trend}</p>}
    </div>
  )
}

export default KPICard
