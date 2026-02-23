import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import StatusBadge from '../components/StatusBadge'
import { Plus, Package, Clock, MapPin, Loader2, TrendingUp, User, Mail, Phone, BellRing, UserCog } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Donation = {
  id: string
  foodType: string
  quantity: string
  expiry: string
  location: string
  status: string
}

const impactData = [
  { name: 'Mon', meals: 40 },
  { name: 'Tue', meals: 30 },
  { name: 'Wed', meals: 55 },
  { name: 'Thu', meals: 45 },
  { name: 'Fri', meals: 70 },
  { name: 'Sat', meals: 90 },
  { name: 'Sun', meals: 85 },
]

const DonorDashboard = () => {
  const [donations, setDonations] = useState<Donation[]>([])
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    expiry: '',
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [user, setUser] = useState<{ name: string; address: string; email?: string } | null>(null)

  // Load user and donations
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('resqmeals_current_user')
      if (currentUser && currentUser !== 'undefined') {
        const parsedUser = JSON.parse(currentUser)
        setUser(parsedUser)
        setFormData(prev => ({ ...prev, location: parsedUser.address || '' }))
      }
    } catch (e) {
      console.error('Failed to parse user', e)
    }

    const fetchMyDonations = async () => {
      try {
        const token = localStorage.getItem('resqmeals_token')
        if (token) {
          const res = await axios.get('http://localhost:8000/api/donations/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setDonations(res.data.donations)
        }
      } catch (err) {
        console.error('Failed to fetch donations from server', err)
      }
    }

    fetchMyDonations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('resqmeals_token')
      const response = await axios.post('http://localhost:8000/api/donations', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // The backend returns the full newly inserted donation object
      const newDonation = response.data.donation
      setDonations(prev => [newDonation, ...prev])

      // Reset form
      setFormData({ foodType: '', quantity: '', expiry: '', location: user?.address || '' })
    } catch (err) {
      console.error('Failed to publish donation', err)
      alert('Failed to publish. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate stats dynamically
  const stats = [
    { label: 'Pending', count: donations.filter(d => d.status === 'Pending').length, color: 'text-amber-600 bg-amber-50' },
    { label: 'Accepted', count: donations.filter(d => d.status === 'Accepted').length, color: 'text-blue-600 bg-blue-50' },
    { label: 'Picked', count: donations.filter(d => d.status === 'Picked').length, color: 'text-purple-600 bg-purple-50' },
    { label: 'Delivered', count: donations.filter(d => d.status === 'Delivered').length, color: 'text-emerald-600 bg-emerald-50' },
  ]

  const location = useLocation()
  const navigate = useNavigate()
  const isProfile = location.pathname.includes('profile')
  const isDonations = location.pathname.includes('donations')
  const isHome = location.pathname.includes('home')
  const isDashboard = !isProfile && !isDonations && !isHome

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Donor Portal {user && `• Welcome, ${user.name}`}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            {isHome && `Welcome, ${user?.name || 'Valued Donor'}!`}
            {isDashboard && 'Dashboard Overview'}
            {isDonations && 'Manage Donations'}
            {isProfile && 'Your Profile'}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {isHome && 'Thank you for being a part of our food rescue community. Explore your options below.'}
            {isDashboard && 'A quick overview of your total impact, active donations, and metrics.'}
            {isDonations && 'List your surplus food items here. Our system uses smart matching to notify the nearest NGOs and volunteers instantly.'}
            {isProfile && 'Manage your account details and preferences.'}
          </p>
        </div>
        {isDonations && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              aria-label="Export donation history as JSON file"
              onClick={() => {
                const data = JSON.stringify(donations, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'donation_history.json';
                a.click();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Export History
            </button>
            <button
              aria-label="Scroll to donation form"
              onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primaryDark transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
              Add New Donation
            </button>
          </div>
        )}
      </header>

      {/* HOME VIEW */}
      {isHome && (
        <section className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-primary rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold mb-3">Make a Difference Today, {user?.name?.split(' ')[0] || 'Donor'}</h2>
              <p className="text-orange-50 max-w-xl text-lg mb-8">
                Every meal you share brings hope to someone in need. Join hands with our partner NGOs and help us reduce food waste, one meal at a time.
              </p>
              <div className="flex gap-4">
                <button
                  aria-label="Navigate to Add Donation page"
                  onClick={() => navigate('/donor/donations')}
                  className="bg-white text-primary font-bold px-6 py-3 rounded-xl shadow-md hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500"
                >
                  Donate Food Now
                </button>
                <button
                  aria-label="Navigate to Donor Dashboard Overview"
                  onClick={() => navigate('/donor')}
                  className="bg-primaryDark text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-orange-600 transition-colors border border-orange-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500"
                >
                  View My Impact
                </button>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 bg-white/10 w-64 h-64 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-32 -mb-16 bg-white/10 w-48 h-48 rounded-full blur-2xl"></div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Impact Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Impact Journey - Span 8 */}
              <div className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Milestone Journey
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">You are currently a <span className="text-primary font-bold">Gold Rescuer</span></p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                      <p className="text-xs font-bold text-white">Tier 3</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-slate-300">1,250 meals rescued</span>
                      <span className="text-primary">2,000 meals for Platinum</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-300 h-3 rounded-full relative" style={{ width: '62%' }}>
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(251,146,60,0.8)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Re-List - Span 4 */}
              <div
                role="button"
                tabIndex={0}
                aria-label="One-tap quick relist for 50 Veg Meals"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/donor/donations');
                  }
                }}
                onClick={() => navigate('/donor/donations')}
                className="md:col-span-4 rounded-[2.5rem] bg-orange-50 p-8 border border-orange-100 shadow-lg shadow-orange-100/50 group cursor-pointer hover:bg-orange-100 transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div>
                  <div className="h-12 w-12 bg-white text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">One-Tap Relist</h3>
                  <p className="text-slate-600 text-sm mt-2">
                    Quickly re-donate your most common surplus item.
                  </p>
                </div>
                <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-orange-50 flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg"><Package className="w-4 h-4 text-orange-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">50 Veg Meals</p>
                    <p className="text-xs text-slate-500">Tap here to publish directly</p>
                  </div>
                </div>
              </div>

              {/* Local Network Pulse - Span 12 */}
              <div className="md:col-span-12 rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10 w-full">
                  <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping"></span>
                    <div className="relative bg-emerald-50 text-emerald-600 h-16 w-16 rounded-full flex items-center justify-center shadow-inner">
                      <MapPin className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">Neighborhood Pulse</h3>
                    <p className="text-slate-500 text-sm mt-1">There are currently <strong className="text-emerald-600 font-bold">12 NGOs</strong> and <strong className="text-emerald-600 font-bold">8 Volunteers</strong> actively looking for food within a 5km radius of your location right now.</p>
                  </div>
                  <button
                    aria-label="Navigate to donations to broadcast availability"
                    onClick={() => navigate('/donor/donations')}
                    className="hidden md:block whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    Broadcast Availability
                  </button>
                </div>
                {/* Mobile visible button */}
                <button
                  aria-label="Navigate to donations to broadcast availability"
                  onClick={() => navigate('/donor/donations')}
                  className="w-full md:hidden bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Broadcast Availability
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* DASHBOARD VIEW */}
      {isDashboard && (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-slate-900">{stat.count}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.color}`}>
                    {stat.label === 'Pending' ? 'Active' : 'Total'}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Impact Overview
                </h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={impactData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="meals" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Alerts
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3">
                  <div className="h-10 w-10 shrink-0 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm">🔔</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">NGO "Hope Foundation" accepted your recent donation.</p>
                    <p className="text-xs text-slate-500 mt-1">10 mins ago</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                  <div className="h-10 w-10 shrink-0 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm">🚚</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Volunteer is arriving soon for "Leftover Bakery items".</p>
                    <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* PROFILE VIEW */}
      {isProfile && (
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-3xl mx-auto mt-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
              <p className="text-slate-500 mt-1">Manage your account details and preferences.</p>
            </div>
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User className="h-8 w-8" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 hover:border-primary/20 transition-colors">
              <div className="mt-1 flex items-center justify-center p-2 bg-white rounded-lg shadow-sm text-slate-400">
                <UserCog className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1">Organization Name</p>
                <p className="font-bold text-slate-900 truncate">{user?.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 hover:border-primary/20 transition-colors">
              <div className="mt-1 flex items-center justify-center p-2 bg-white rounded-lg shadow-sm text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1">Email Address</p>
                <p className="font-bold text-slate-900 truncate">{user?.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 hover:border-primary/20 transition-colors">
              <div className="mt-1 flex items-center justify-center p-2 bg-white rounded-lg shadow-sm text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1">Primary Address</p>
                <p className="font-bold text-slate-900 truncate">{user?.address || 'Not Location Provided'}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 hover:border-primary/20 transition-colors">
              <div className="mt-1 flex items-center justify-center p-2 bg-white rounded-lg shadow-sm text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1">Contact Number</p>
                <p className="font-bold text-slate-900 truncate">+91 98765 43210</p>
              </div>
            </div>
          </div>

          <div className="mb-8 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
              <BellRing className="w-5 h-5 text-primary" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive alerts when NGOs accept donations.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                <div>
                  <p className="font-medium text-slate-700">SMS Alerts</p>
                  <p className="text-sm text-slate-500">Get text messages for volunteer arrivals.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              aria-label="Cancel profile edits"
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              aria-label="Save profile changes"
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </section>
      )}

      {/* DONATIONS VIEW */}
      {isDonations && (
        <section className="grid gap-8 lg:grid-cols-12">
          {/* Donation Form */}
          <div className="lg:col-span-12 xl:col-span-5">
            <section id="donation-form" className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Donation Details</h2>
                <p className="text-sm text-slate-500 mt-1">Fill in the details to notify NGOs.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">What are you donating?</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        name="foodType"
                        value={formData.foodType}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                        placeholder="E.g., 50 Veg Meals, leftover bakery items..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Quantity</label>
                      <input
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                        placeholder="E.g. 5kg, 40 boxes"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Best before</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                          placeholder="E.g. 2 hours"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Pickup Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primaryDark hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Donation'
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Recent Donations List */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              <button
                aria-label="View all recent activity"
                className="text-sm font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              >
                View All
              </button>
            </div>

            <div className="grid gap-4">
              {donations.length === 0 ? (
                <div className="text-center py-12 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No donations made yet.</p>
                  <p className="text-slate-400 text-sm">Start by adding your first donation!</p>
                </div>
              ) : (
                donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="group relative flex flex-col sm:flex-row gap-5 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Package className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900 truncate pr-4">{donation.foodType}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {donation.location}
                          </p>
                        </div>
                        <StatusBadge status={donation.status} />
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg p-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Qty: <span className="text-slate-700">{donation.quantity}</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          Expires: <span className="text-orange-700">{donation.expiry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default DonorDashboard
