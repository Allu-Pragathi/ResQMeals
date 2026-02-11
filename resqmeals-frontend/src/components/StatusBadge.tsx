type StatusBadgeProps = {
  status: string
}

const colorMap: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Accepted: 'bg-blue-100 text-blue-800',
  Picked: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-orange-100 text-orange-800',
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors = colorMap[status] ?? 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colors}`}>
      {status}
    </span>
  )
}

export default StatusBadge
