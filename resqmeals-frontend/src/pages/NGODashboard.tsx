import { ngoRequests, statusTracking } from '../data/mockData'

// Future ML hook: replace static priority with ML scoring (distance, freshness, quantity).
const priorityColor: Record<string, string> = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-orange-100 text-orange-800',
}

const NGODashboard = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">NGO view</p>
          <h1 className="text-3xl font-semibold text-slate">Nearby donation requests</h1>
          <p className="text-sm text-slate/70">
            Accept or decline requests. Priority tag will be ML-driven later (distance, quantity,
            food safety).
          </p>
        </div>
        <button className="rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
          Auto-match (coming soon)
        </button>
      </header>

      <section className="space-y-4">
        {ngoRequests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate">
                {req.foodType} • {req.quantity}
              </p>
              <p className="text-xs text-slate/60">
                Donor: {req.donor} • {req.distance} away • Pickup {req.pickup}
              </p>
              <p className="text-xs text-slate/60">Status: {req.status}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColor[req.priority]}`}
              >
                {req.priority} priority
              </span>
              <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow hover:bg-primaryDark">
                Accept
              </button>
              <button className="rounded-full border border-slate/20 px-4 py-2 text-xs font-semibold text-slate hover:border-slate/40">
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {statusTracking.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-slate">{stat.label}</p>
            <p className="text-xs text-slate/60">{stat.detail}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default NGODashboard
