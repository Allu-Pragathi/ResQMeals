import { donationStatusSummary, donorDonations } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'

const EventsDashboard = () => {
    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Event Organizer View</p>
                    <h1 className="text-3xl font-semibold text-slate">Manage Event Surplus</h1>
                    <p className="text-sm text-slate/70">
                        Coordinate large-scale food donations from events and track pickups.
                    </p>
                </div>
                <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primaryDark">
                    + Schedule Event Pickup
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
                    <h2 className="text-lg font-semibold text-slate">Event Donation Details</h2>
                    <p className="text-xs text-slate/60">UI only. Hook to backend later.</p>

                    <form className="mt-4 grid gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate">Event Name / Food Type</label>
                            <input
                                className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                placeholder="E.g., Wedding Banquet Leftovers"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate">Quantity (Est.)</label>
                                <input
                                    className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                    placeholder="200 servings"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate">Available Until</label>
                                <input
                                    className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                    placeholder="Before 11:00 PM"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate">Venue Location</label>
                            <input
                                className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                placeholder="Grand Hall, 123 Main St"
                            />
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-primaryDark"
                        >
                            Schedule Pickup
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate">Past Events</h2>
                        <span className="text-xs text-slate/60">Status updates</span>
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

export default EventsDashboard
