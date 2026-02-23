import { useState } from 'react'
import { ngoRequests } from '../data/mockData'
import {
  Clock, MapPin,
  Utensils, Users, Truck, AlertCircle, Leaf, Flame, ShieldCheck
} from 'lucide-react'

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    High: 'bg-rose-100 text-rose-700 border-rose-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles[priority] || styles.Low}`}>
      {priority === 'High' && <AlertCircle className="h-3 w-3" />}
      {priority}
    </span>
  )
}

const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${color} opacity-10 blur-2xl`}></div>
    <div className="relative flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon className="h-6 w-6 text-current" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <p className="text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  </div>
)

const RequestCard = ({ req }: { req: any }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Icon & Details */}
      <div className="flex gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Utensils className="h-7 w-7" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{req.foodType}</h3>
            <PriorityBadge priority={req.priority} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span className="font-medium text-slate-700">{req.quantity}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {req.donor} ({req.distance})
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              <Clock className="h-3 w-3" /> Pickup: {req.pickup}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
              <Leaf className="h-3 w-3" /> Fresh
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
              <ShieldCheck className="h-3 w-3" /> Verified Donor
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="text-right mb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expires in</span>
          <p className="text-sm font-bold text-rose-600 flex items-center justify-end gap-1">
            <Flame className="h-3 w-3" /> 2h 15m
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2">
          <button className="flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            Ignore
          </button>
          <button className="flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 hover:shadow-orange-500/30 transition-all">
            Accept Rescue
          </button>
        </div>
      </div>
    </div>
  </div>
)

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('requests')

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Dashboard Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                Verified NGO Partner
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mission Control</h1>
            <p className="text-slate-500">Manage incoming donations and track your rescue impact.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              <Users className="mr-2 h-4 w-4 text-slate-400" /> Manage Volunteers
            </button>
            <button className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <MapPin className="mr-2 h-4 w-4" /> View Live Map
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Utensils}
            label="Meals Rescued"
            value="1,248"
            subtext="+12% from last week"
            color="bg-orange-500"
          />
          <StatCard
            icon={Truck}
            label="Active Pickups"
            value="4"
            subtext="2 volunteers en route"
            color="bg-blue-500"
          />
          <StatCard
            icon={Users}
            label="Families Fed"
            value="850"
            subtext="Impact Score: 98/100"
            color="bg-emerald-500"
          />
          <StatCard
            icon={Leaf}
            label="CO₂ Saved"
            value="450 kg"
            subtext="Equivalent to 12 trees"
            color="bg-teal-500"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Requests Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Incoming Donations</h2>
              <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'requests' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Requests (3)
                </button>
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'scheduled' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Scheduled
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {ngoRequests.map((req) => (
                <RequestCard key={req.id} req={req} />
              ))}
              {/* Demo extra card for variety */}
              <LinkCard />
            </div>
          </div>

          {/* Sidebar - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Active Deliveries Widget */}
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-orange-400" /> Live Deliveries
              </h3>
              <div className="space-y-4">
                <div className="relative pl-4 border-l-2 border-slate-700">
                  <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-4 ring-slate-900"></div>
                  <p className="text-sm font-medium text-slate-200">Pickup from <span className="text-white font-bold">Grand Hotel</span></p>
                  <p className="text-xs text-slate-500 mt-1">Driver: Ravi K. • 5 mins away</p>
                </div>
                <div className="relative pl-4 border-l-2 border-slate-700">
                  <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900"></div>
                  <p className="text-sm font-medium text-slate-200">In Transit to <span className="text-white font-bold">Shelter #4</span></p>
                  <p className="text-xs text-slate-500 mt-1">Est. Arrival: 6:45 PM</p>
                </div>
              </div>
              <button className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
                Track All Fleet
              </button>
            </div>

            {/* Volunteer Availability */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Volunteer Pool</span>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">12 Active</span>
              </h3>
              <div className="flex -space-x-2 overflow-hidden mb-4">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-xs font-medium text-slate-500">+9</div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Most volunteers are currently concentrated in <span className="font-semibold text-slate-700">Downtown area</span>.
              </p>
              <button className="w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Broadcast Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">Urgent: Baby Formula</h3>
              <span className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                Specific Request
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-2">Requested by <span className="font-semibold text-indigo-900">Sunshine Orphanage</span></p>
          </div>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
          View Details
        </button>
      </div>
    </div>
  )
}

export default NGODashboard
