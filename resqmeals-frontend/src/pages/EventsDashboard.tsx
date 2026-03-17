import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { 
  Calendar, MapPin, Utensils, Users, Clock, 
  TrendingUp, Award, Building2, Mail, Phone,
  Loader2, Plus, History, Heart, ShieldCheck,
  Gift, PartyPopper, Home as HouseIcon, Briefcase
} from 'lucide-react'

// Sub-components
const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
  <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${color} opacity-10 blur-2xl`}></div>
    <div className="relative flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} bg-opacity-10 text-${color.includes('orange') ? 'orange-600' : color.split('-')[1] + '-600'}`}>
        <Icon className="h-6 w-6 text-current" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{subtext}</p>
      </div>
    </div>
  </div>
)

const EventsDashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [donations, setDonations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        foodType: '',
        quantity: '',
        expiry: '',
        location: ''
    })

    const isProfile = location.pathname.includes('profile')
    const isSchedule = location.pathname.includes('schedule')
    const isDashboard = !isProfile && !isSchedule

    const eventTemplates = [
        {
            id: 'bday',
            name: 'Birthday Party',
            icon: Gift,
            foodType: 'Birthday Celebration - Party Snacks & Main Course',
            quantity: '50 servings',
            expiry: 'Within 3 hours'
        },
        {
            id: 'marriage',
            name: 'Wedding Banquet',
            icon: PartyPopper,
            foodType: 'Wedding Banquet - Premium Multi-cuisine Buffet',
            quantity: '500 servings',
            expiry: 'Next 6 hours'
        },
        {
            id: 'house',
            name: 'House Warming',
            icon: HouseIcon,
            foodType: 'House Warming Feast - Traditional Veg Meal',
            quantity: '100 servings',
            expiry: 'Within 4 hours'
        },
        {
            id: 'corp',
            name: 'Corporate Event',
            icon: Briefcase,
            foodType: 'Corporate Seminar - Executive Lunch Boxes',
            quantity: '75 servings',
            expiry: 'Next 2 hours'
        }
    ]

    useEffect(() => {
        const savedUser = localStorage.getItem('resqmeals_current_user')
        if (savedUser) {
            const parsed = JSON.parse(savedUser)
            setUser(parsed)
            setFormData(prev => ({ ...prev, location: parsed.address || '' }))
        }
        fetchMyEvents()
    }, [])

    const fetchMyEvents = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/donations/me')
            setDonations(res.data.donations)
        } catch (err) {
            console.error('Failed to fetch event data', err)
        } finally {
            setIsLoading(false)
        }
    }

    const applyTemplate = (template: typeof eventTemplates[0]) => {
        setFormData(prev => ({
            ...prev,
            foodType: template.foodType,
            quantity: template.quantity,
            expiry: template.expiry
        }))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/donations', formData)
            setFormData({ foodType: '', quantity: '', expiry: '', location: user?.address || '' })
            fetchMyEvents()
            alert('Event pickup scheduled successfully!')
            navigate('/events')
        } catch (err) {
            console.error('Failed to post event surplus', err)
            alert('Failed to schedule. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen pb-12">
            <div className="mx-auto max-w-7xl space-y-8">
                
                {/* Header */}
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 uppercase tracking-wider">
                                Event Partner Profile
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isDashboard && `Welcome back, ${user?.name || 'Organizer'}`}
                            {isSchedule && 'Schedule Mass Rescue'}
                            {isProfile && 'Partner Details'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isDashboard && 'Overview of your recent events and cumulative impact.'}
                            {isSchedule && 'Coordinate the rescue of large-scale event surplus.'}
                            {isProfile && 'Manage your event firm and contact registration.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {isDashboard && (
                            <button 
                                onClick={() => navigate('/events/schedule')}
                                className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all hover:scale-105"
                            >
                                <Plus className="mr-2 h-4 w-4" /> New Event Pickup
                            </button>
                        )}
                        {isProfile && (
                            <button className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all">
                                Update Partner Info
                            </button>
                        )}
                    </div>
                </header>

                {/* DASHBOARD VIEW */}
                {isDashboard && (
                    <>
                        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                icon={Calendar}
                                label="Total Events"
                                value={donations.length}
                                subtext="Contributions to Date"
                                color="bg-orange-500"
                            />
                            <StatCard
                                icon={Utensils}
                                label="Meals Rescued"
                                value={donations.reduce((acc, d) => acc + (parseInt(d.quantity) || 0), 0)}
                                subtext="Total Servings"
                                color="bg-orange-500"
                            />
                            <StatCard
                                icon={Users}
                                label="People Impacted"
                                value={donations.reduce((acc, d) => acc + (parseInt(d.quantity) || 0), 0) * 1.2}
                                subtext="Estimated Reach"
                                color="bg-emerald-500"
                            />
                            <StatCard
                                icon={Award}
                                label="Rescue Tier"
                                value="Platinum"
                                subtext="Elite Contributor"
                                color="bg-blue-500"
                            />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Feed */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <History className="h-5 w-5 text-orange-500" /> Event History
                                        </h2>
                                        <button className="text-xs font-bold text-orange-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="flex justify-center py-20">
                                                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                            </div>
                                        ) : donations.length === 0 ? (
                                            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500 font-medium">No events recorded yet.</p>
                                                <button 
                                                    onClick={() => navigate('/events/schedule')}
                                                    className="mt-4 text-sm font-bold text-orange-600"
                                                >
                                                    Start your first rescue →
                                                </button>
                                            </div>
                                        ) : (
                                            donations.slice(0, 5).map((donation) => (
                                                <div key={donation.id} className="group relative flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-orange-100">
                                                    <div className="flex gap-4">
                                                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                            <Calendar className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{donation.foodType}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {donation.location}
                                                                </span>
                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                <span className="text-[10px] font-bold text-slate-400 capitalize">{donation.quantity}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={donation.status} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Impact Visualization */}
                                <div className="bg-orange-950 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 h-64 w-64 bg-orange-500/10 rounded-full blur-3xl transition-all group-hover:bg-orange-500/20"></div>
                                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-orange-400" /> Community Contribution
                                    </h3>
                                    <p className="text-orange-300/80 text-sm mb-8">Your events have saved over <span className="text-white font-bold">1.2 tons</span> of food this month.</p>
                                    
                                    <div className="grid grid-cols-7 gap-3 items-end h-32 px-4">
                                        {[60, 40, 85, 30, 95, 55, 75].map((h, i) => (
                                            <div key={i} className="relative group/bar flex flex-col items-center gap-2">
                                                <div className="w-full bg-orange-500/40 rounded-t-lg transition-all hover:bg-orange-400 hover:scale-110" style={{ height: `${h}%` }}></div>
                                                <span className="text-[9px] font-bold text-orange-500 uppercase">W{i+1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-rose-500" /> Featured NGOs
                                    </h3>
                                    <div className="space-y-4">
                                        {['Mumbai Roti Bank', 'Feeding India', 'Uday Foundation'].map((ngo, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all cursor-pointer">
                                                <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 text-[10px] font-bold">{ngo[0]}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">{ngo}</p>
                                                    <p className="text-[9px] text-slate-500">Verified Rescue Partner</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-600 transition-colors">See all partners →</button>
                                </div>

                                <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                    <ShieldCheck className="h-10 w-10 text-orange-400 mx-auto mb-3 relative z-10" />
                                    <h4 className="font-bold mb-1 relative z-10">Sustainable Partner</h4>
                                    <p className="text-[10px] text-orange-100/70 mb-4 relative z-10 leading-relaxed">Your organization is recognized for excellence in sustainability and food waste management.</p>
                                    <button className="w-full py-2 bg-white text-orange-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors relative z-10 shadow-sm">View E-Badge</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* SCHEDULE VIEW */}
                {isSchedule && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Event Rescue Form</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Event / Food Description</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    name="foodType"
                                                    value={formData.foodType}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                                                    placeholder="E.g. Charity Gala - Course 1 Leftovers"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Est. Quantity</label>
                                                <div className="relative">
                                                    <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        name="quantity"
                                                        value={formData.quantity}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                                                        placeholder="200 servings"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Must Rescue By</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        name="expiry"
                                                        value={formData.expiry}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                                                        placeholder="11:30 PM Today"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Venue Pickup Point</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                                                    placeholder="Loading Dock B, Grand Hall"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Schedule Bulk Rescue'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-orange-500" /> One-Tap Templates
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {eventTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => applyTemplate(template)}
                                            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200 hover:shadow-sm transition-all text-left"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-orange-500 shadow-sm">
                                                <template.icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{template.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 pt-4">
                            <div className="relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-px bg-slate-100 lg:block hidden"></div>
                                <div className="space-y-8">
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-white lg:block hidden"></div>
                                        <h4 className="font-bold text-slate-900 mb-1">Mass Rescue Protocol</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">For events exceeding 200 portions, we deploy a specialized logistics team to ensure rapid handover within 30 minutes of listing.</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-white lg:block hidden"></div>
                                        <h4 className="font-bold text-slate-900 mb-1">Verification Step</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">NGO partners will verify food temperature and packaging upon arrival at the venue location.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-orange-600">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <p className="text-xs text-orange-700 leading-relaxed">By scheduling, you confirm that the food has been handled according to official Food Safety Guidelines for mass catering.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROFILE VIEW */}
                {isProfile && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-50">
                                <div className="h-24 w-24 bg-orange-100 rounded-[2rem] flex items-center justify-center text-orange-600 text-3xl font-black">
                                    {user?.name?.[0] || 'E'}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">{user?.name}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-emerald-100">Premier Organizer</span>
                                        <span className="text-[10px] font-bold text-slate-400">ID: E-9485023</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email for Logistics</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-orange-100 transition-colors">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dedicated Hotline</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-orange-100 transition-colors">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">+91 76543 21098</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Office / Base Venue</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-orange-100 transition-colors">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">{user?.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-orange-500" /> Partner Configuration
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 group hover:bg-white transition-all cursor-pointer">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Catering License</p>
                                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">Verified <ShieldCheck className="h-3 w-3" /></p>
                                    </div>
                                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 group hover:bg-white transition-all cursor-pointer">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Rescue Success</p>
                                        <p className="text-sm font-bold text-orange-600">99.2% Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <h4 className="font-bold text-orange-900">Annual CSR Report</h4>
                                <p className="text-xs text-orange-600/80">Your impact certificate for the current fiscal year (2025-26) is ready.</p>
                            </div>
                            <button className="px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all active:scale-95">Download PDF</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default EventsDashboard
