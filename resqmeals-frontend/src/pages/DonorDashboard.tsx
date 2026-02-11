import { donationStatusSummary, donorDonations } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'

const DonorDashboard = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Donor view</p>
          <h1 className="text-3xl font-semibold text-slate">Add Food Donation</h1>
          <p className="text-sm text-slate/70">
            Share surplus food details and track pickup status. ML-based NGO matching will plug in
            here to prioritize nearby partners.
          </p>
        </div>
        <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primaryDark">
          + Add Food Donation
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {donationStatusSummary.map((status) => (
          <div
            key={status.label}
            className="rounded-2xl bg-white p-4 shadow-card"
          >
            <p className="text-sm text-slate/70">{status.label}</p>
            <p className="text-2xl font-semibold text-slate">{status.count}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate">Donation details</h2>
          <p className="text-xs text-slate/60">UI only. Hook to backend later.</p>
          {/* Future: run ML-assisted NGO matching when form submits */}
          <form className="mt-4 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate">Food type</label>
              <input
                className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="E.g., cooked meals, produce, bakery items"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate">Quantity</label>
                <input
                  className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="40 servings"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate">Expiry / safe time</label>
                <input
                  className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="Pickup within 4 hours"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate">Pickup location</label>
              <input
                className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Address or pin location"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-primaryDark"
            >
              Submit donation
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate">Recent donations</h2>
            <span className="text-xs text-slate/60">Status updates only (UI)</span>
          </div>
          <div className="space-y-3">
            {donorDonations.map((donation) => (
              <div
                key={donation.id}
                className="rounded-2xl bg-white p-4 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate">{donation.foodType}</p>
                    <p className="text-xs text-slate/60">
                      {donation.quantity} • {donation.location}
                    </p>
                  </div>
                  <StatusBadge status={donation.status} />
                </div>
                <p className="mt-2 text-xs text-slate/60">{donation.expiry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DonorDashboard
