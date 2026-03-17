import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Clock, MapPin,
  Utensils, Users, Truck, AlertCircle, Leaf, ShieldCheck,
  Building2, Mail, Phone, Heart, History, Star, HandHeart
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

const RequestCard = ({ req, onAccept }: { req: any, onAccept: (id: string) => void }) => (
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
            <PriorityBadge priority={req.status === 'Pending' ? 'High' : 'Low'} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span className="font-medium text-slate-700">{req.quantity}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {req.donor?.name || 'Unknown Donor'} ({req.location})
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              <Clock className="h-3 w-3" /> Expires: {req.expiry}
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
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
          <p className={`text-sm font-bold flex items-center justify-end gap-1 ${req.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
             {req.status}
          </p>
        </div>
        {req.status === 'Pending' && (
          <div className="flex gap-2 w-full sm:w-auto mt-2">
            <button className="flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              Ignore
            </button>
            <button 
              onClick={() => onAccept(req.id)}
              className="flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 hover:shadow-orange-500/30 transition-all"
            >
              Accept Rescue
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)

const NGODashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [donations, setDonations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const isProfile = location.pathname.includes('profile')
  const isAvailable = location.pathname.includes('available')
  const isDashboard = !isProfile && !isAvailable

  useEffect(() => {
    const savedUser = localStorage.getItem('resqmeals_current_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const fetchDonations = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/donations')
      setDonations(res.data.donations)
    } catch (err) {
      console.error('Failed to fetch donations', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const handleAccept = async (id: string) => {
    try {
      await api.patch(`/donations/${id}/accept`)
      // Refresh list
      fetchDonations()
      alert('Donation successfully accepted!')
    } catch (err: any) {
      console.error('Failed to accept donation', err)
      alert(err.response?.data?.error || 'Failed to accept donation. Please try again.')
    }
  }


  return (
    <div className="min-h-screen pb-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Dynamic Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                Verified NGO Partner
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isDashboard && `Welcome back, ${user?.name || 'NGO'}`}
              {isAvailable && 'Rescue Feed'}
              {isProfile && 'Organization Profile'}
            </h1>
            <p className="text-slate-500">
              {isDashboard && 'Overview of your rescue operations and impact.'}
              {isAvailable && 'Available surplus food waiting for pickup.'}
              {isProfile && 'Manage your registration and operational details.'}
            </p>
          </div>
          <div className="flex gap-3">
             {isDashboard && (
                <button 
                  onClick={() => navigate('/ngo/available')}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all"
                >
                  <HandHeart className="mr-2 h-4 w-4" /> Start Rescue
                </button>
             )}
             {isProfile && (
                <button className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                  Save Changes
                </button>
             )}
          </div>
        </header>

        {/* DASHBOARD VIEW */}
        {isDashboard && (
          <>
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Utensils}
                label="Meals Rescued"
                value={donations.filter(d => d.status === 'Accepted' || d.status === 'Delivered').length * 40}
                subtext="Est. People Fed"
                color="bg-orange-500"
              />
              <StatCard
                icon={Truck}
                label="Active Missions"
                value={donations.filter(d => d.status === 'Accepted').length}
                subtext="In Progress"
                color="bg-blue-500"
              />
              <StatCard
                icon={Star}
                label="Impact Score"
                value="4.8/5"
                subtext="Community Trust"
                color="bg-emerald-500"
              />
              <StatCard
                icon={Leaf}
                label="Carbon Saved"
                value="128 kg"
                subtext="Environmental Impact"
                color="bg-teal-500"
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <History className="h-5 w-5 text-orange-500" /> Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {donations.filter(d => d.status === 'Accepted').slice(0, 3).map(req => (
                      <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                            <Utensils className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{req.foodType}</p>
                            <p className="text-xs text-slate-500">{req.donor?.name}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Accepted</span>
                      </div>
                    ))}
                    {donations.filter(d => d.status === 'Accepted').length === 0 && (
                      <p className="text-center py-10 text-slate-400 text-sm">No active rescues at the moment.</p>
                    )}
                  </div>
                </div>

                {/* Impact Chart (Simplified placeholder) */}
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-20"><Heart className="h-32 w-32" /></div>
                   <h3 className="text-xl font-bold mb-2">Weekly Impact Trend</h3>
                   <p className="text-slate-400 text-sm mb-6">You&apos;ve increased rescues by 12% this week!</p>
                   <div className="flex items-end gap-3 h-32">
                      {[40, 60, 45, 90, 65, 80, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-orange-500 rounded-t-lg transition-all hover:bg-orange-400" style={{ height: `${h}%` }}></div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-4 px-1 text-[10px] uppercase font-bold text-slate-500">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" /> Active Drivers
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Ravi Kumar', status: 'On Delivery', color: 'text-orange-600 bg-orange-50' },
                      { name: 'Amit Singh', status: 'Available', color: 'text-emerald-600 bg-emerald-50' },
                      { name: 'Sonia Verma', status: 'En Route', color: 'text-blue-600 bg-blue-50' }
                    ].map((driver, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{driver.name[0]}</div>
                          <p className="text-sm font-medium text-slate-900">{driver.name}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${driver.color}`}>{driver.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white text-center">
                  <ShieldCheck className="h-10 w-10 text-orange-400 mx-auto mb-3" />
                  <h4 className="font-bold mb-1">Safety Certified</h4>
                  <p className="text-xs text-slate-400 mb-4">Your NGO follows all food safety guidelines protocols.</p>
                  <button className="w-full py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">View Certificate</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* AVAILABLE FEED VIEW */}
        {isAvailable && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Current Surplus Requests</h2>
                  <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                    <button className="px-4 py-1.5 text-xs font-bold bg-orange-50 text-orange-700 rounded-md">Nearby</button>
                    <button className="px-4 py-1.5 text-xs font-bold text-slate-500">Urgent</button>
                  </div>
               </div>
               
               <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : donations.filter(d => d.status === 'Pending').length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Utensils className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No pending donations in your area.</p>
                    <p className="text-xs text-slate-400 mt-1">We&apos;ll notify you when new surplus is listed.</p>
                  </div>
                ) : (
                  donations.filter(d => d.status === 'Pending').map((req) => (
                    <RequestCard key={req.id} req={req} onAccept={handleAccept} />
                  ))
                )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Rescue Zones</h3>
                  <div className="aspect-video bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                     <img src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.2,28.6,10/400x200?access_token=pk.eyJ1IjoibW9ja3VzZXIiLCJhIjoiY2p4ZGJwYTA0MDBqeTN4bm9tYXJ0eHBsNCJ9.m9pZ" className="w-full h-full object-cover" alt="Map Preview" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-orange-500/20 w-20 h-20 rounded-full animate-ping"></div>
                        <MapPin className="text-orange-600 h-8 w-8 relative z-10" />
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">You are currently monitoring a <span className="font-bold text-slate-900 text-orange-600">5km radius</span> for food rescue missions.</p>
                  <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">Expand Radius</button>
               </div>

               <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <h4 className="font-bold text-orange-900 mb-1 flex items-center gap-2">
                     <AlertCircle className="h-4 w-4" /> Pro-tip
                  </h4>
                  <p className="text-xs text-orange-800 leading-relaxed">Accepted rescues must be picked up within 45 minutes of the listing to ensure food quality.</p>
               </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {isProfile && (
           <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                 <div className="flex items-start justify-between mb-8">
                    <div className="flex gap-6 items-center">
                       <div className="h-20 w-20 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 text-3xl font-bold">
                          {user?.name?.[0] || 'N'}
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                          <div className="flex items-center gap-4 mt-2">
                             <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><Building2 className="h-3.5 w-3.5" /> NGO Darpan ID: <span className="text-slate-900">UP/2023/04859</span></span>
                             <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                       <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{user?.email || 'not-provided@ngo.org'}</span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Phone</label>
                       <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">+91 9876543210</span>
                       </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Address</label>
                       <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{user?.address || 'No address saved.'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Operations Config</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-200 transition-colors">
                          <p className="text-xs font-bold text-slate-500 mb-1">Rescue Radius</p>
                          <p className="text-xl font-bold text-slate-900">5.0 km</p>
                       </div>
                       <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-200 transition-colors">
                          <p className="text-xs font-bold text-slate-500 mb-1">Max Daily Capacity</p>
                          <p className="text-xl font-bold text-slate-900">500 meals</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck className="h-24 w-24" /></div>
                 <h4 className="text-lg font-bold mb-2">Registration Status</h4>
                 <p className="text-indigo-200 text-sm mb-6 max-w-md">Your 80G and 12A certifications are up to date. You are eligible for tax-exempt donations.</p>
                 <div className="flex gap-4">
                    <button className="px-6 py-2 bg-white text-indigo-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors">Verify Documents</button>
                    <button className="px-6 py-2 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/20 transition-colors">Download Report</button>
                 </div>
              </div>
           </div>
        )}

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
