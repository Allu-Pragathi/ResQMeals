import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { 
  Calendar, MapPin, Utensils, Users, Clock, 
  TrendingUp, Award, Building2, Mail, Phone,
  Loader2, Plus, History, Heart, ShieldCheck,
  Gift, PartyPopper, Home as HouseIcon, Briefcase, Bot
} from 'lucide-react'
import ProfileVerificationCenter from '../components/ProfileVerificationCenter'
import VerificationGate from '../components/VerificationGate'

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
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editProfileData, setEditProfileData] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        password: ''
    })
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        foodType: '',
        quantity: '',
        expiry: '',
        location: ''
    })
    const [forecast, setForecast] = useState<any[]>([])
    const [isAiLoading, setIsAiLoading] = useState(false)

    const isProfile = location.pathname.includes('profile')
    const isSchedule = location.pathname.includes('schedule')
    const isHome = location.pathname.includes('home')
    const isDashboard = !isProfile && !isSchedule && !isHome

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
            setEditProfileData({
                name: parsed.name || '',
                email: parsed.email || '',
                address: parsed.address || '',
                phone: parsed.phone || '+91 76543 21098',
                password: ''
            })
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

    const fetchForecast = async () => {
        if (!user?.latitude || !user?.longitude) return;
        try {
            setIsAiLoading(true);
            const res = await api.get(`/donations/ml/forecast?lat=${user.latitude}&lng=${user.longitude}`);
            if (res.data.forecast) setForecast(res.data.forecast);
        } catch (err) {
            console.error('Forecast failed', err);
        } finally {
            setIsAiLoading(false);
        }
    }

    useEffect(() => {
        if (isHome && forecast.length === 0 && user) fetchForecast();
    }, [isHome, user]);

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
        } catch (err: any) {
            console.error('SERVER ERROR DURING SCHEDULING:', err.response?.data);
            const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Unknown server error';
            alert(`Failed to schedule: ${errorMsg}`);
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdatingProfile(true)
        try {
            const res = await api.put('/auth/profile', editProfileData)
            const updatedUser = res.data.user
            setUser(updatedUser)
            localStorage.setItem('resqmeals_current_user', JSON.stringify(updatedUser))
            setIsEditingProfile(false)
            alert('Partner profile updated successfully!')
        } catch (err: any) {
            console.error('Failed to update profile', err)
            const errorMsg = err.response?.data?.error || 'Failed to update profile. Please try again.'
            alert(errorMsg)
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    return (
        <div className="min-h-screen pb-12 animate-in fade-in duration-700 relative">
            {/* Thematic Food & Logistics Background Layer */}
            <div className="absolute -top-4 md:-top-10 -left-2 md:-left-10 -right-2 md:-right-10 bottom-0 z-0 pointer-events-none overflow-hidden rounded-tl-3xl">
                <div 
                    className="absolute inset-0 opacity-40 mix-blend-multiply"
                    style={{ 
                        backgroundImage: "url('/food-background.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                        filter: 'grayscale(30%)'
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/95 via-[#fafafa]/90 to-emerald-50/40 backdrop-blur-[6px]"></div>
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ 
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}
                ></div>
            </div>

            <div className="mx-auto w-full max-w-[1400px] space-y-8 relative z-10 px-4 sm:px-6 lg:px-8 mt-2">
                
                {/* Header */}
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 uppercase tracking-wider shadow-sm border border-orange-200/50">
                                Event Partner Profile
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isHome && `Welcome Partner, ${user?.name || 'Organizer'}!`}
                            {isDashboard && 'Event Performance Hub'}
                            {isSchedule && 'Schedule Mass Rescue'}
                            {isProfile && 'Partner Details'}
                        </h1>
                        <p className="text-slate-500 mt-1 max-w-xl">
                            {isHome && 'Coordinate the rescue of hundreds of portions in minutes.'}
                            {isDashboard && 'Overview of your recent events and cumulative impact.'}
                            {isSchedule && 'Coordinate the rescue of large-scale event surplus with our logistics team.'}
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
                            <button 
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
                            >
                                {isEditingProfile ? 'Cancel' : 'Edit Manager Info'}
                            </button>
                        )}
                    </div>
                </header>

                {/* HOME VIEW */}
                {isHome && (
                    <section className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Event Hero */}
                        <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                              <div className="space-y-8">
                                 <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-black text-white mb-2 backdrop-blur-md border border-white/20 uppercase tracking-widest">
                                    Mass Rescue Command Center
                                 </span>
                                 <h2 className="text-5xl font-black mb-6 tracking-tight leading-[1.1]">
                                    Your Large Scale <br /> Impact, Simplified.
                                 </h2>
                                 <p className="text-orange-50 max-w-lg text-lg leading-relaxed font-medium">
                                    Coordinate the rescue of hundreds of portions in minutes. Our logistics team is standing by to mobilize for your current event surplus.
                                 </p>
                                 <div className="flex flex-wrap gap-4 pt-4">
                                    <button
                                       onClick={() => navigate('/events/schedule')}
                                       className="bg-white text-orange-600 font-black px-10 py-5 rounded-[2rem] shadow-xl hover:bg-orange-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group"
                                    >
                                       Schedule Bulk Handover
                                       <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    </button>
                                    <button
                                       onClick={() => navigate('/events')}
                                       className="bg-white/10 text-white font-black px-10 py-5 rounded-[2rem] shadow-md hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 flex items-center gap-3"
                                    >
                                       <TrendingUp className="w-5 h-5" />
                                       Impact Dashboard
                                    </button>
                                 </div>
                              </div>
                              <div className="hidden lg:flex justify-end pr-8">
                                 <div className="relative">
                                    <div className="h-64 w-64 bg-white/10 rounded-[4rem] backdrop-blur-xl border border-white/20 flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform duration-700">
                                       <PartyPopper className="w-32 h-32 opacity-80" />
                                    </div>
                                    <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-orange-400 rounded-3xl backdrop-blur-md border border-white/30 flex items-center justify-center -rotate-12 shadow-2xl">
                                       <Award className="w-16 h-16 text-white" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="absolute top-0 right-0 -mt-20 -mr-20 bg-white/10 w-[40rem] h-[40rem] rounded-full blur-[120px] pointer-events-none"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                           {/* Quick Setup Card */}
                           <div className="md:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                              <div className="flex items-center justify-between mb-10">
                                 <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                       <ShieldCheck className="h-7 w-7 text-emerald-500" /> Event Sustainability Pulse
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2">Historical efficiency in managing large event surpluses.</p>
                                 </div>
                                 <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm shadow-emerald-50 tracking-tighter uppercase whitespace-nowrap">Elite Rating • 4.95/5</span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                  <div className="p-8 rounded-[2.5rem] bg-orange-50/50 border border-orange-100 group-hover:bg-white transition-all duration-500 overflow-hidden relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[11px] font-black text-orange-400 uppercase tracking-widest">ResQ Forecast</p>
                                        <Bot className="w-4 h-4 text-orange-400 opacity-50" />
                                    </div>
                                    <div className="flex items-end gap-1.5 h-12 mb-4">
                                        {isAiLoading ? (
                                            <div className="flex flex-1 items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-orange-300" /></div>
                                        ) : (forecast.length > 0 ? forecast : [3, 5, 4, 8, 2, 6, 4]).map((f: any, i: number) => (
                                            <div key={i} className="flex-1 bg-orange-200 rounded-sm hover:bg-orange-400 transition-colors" style={{ height: `${(typeof f === 'number' ? f : f.predictedVolume) * 10}%` }}></div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">Predicted Surplus: {forecast.length > 0 ? forecast[0].predictedVolume : '8'} portions</p>
                                  </div>
                                  <div className="p-8 rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 group-hover:bg-white transition-all duration-500">
                                     <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3">Success Rate</p>
                                     <p className="text-4xl font-black text-slate-900">99%</p>
                                     <div className="h-1 w-12 bg-emerald-200 mt-4 rounded-full"></div>
                                  </div>
                                  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group-hover:bg-white transition-all duration-500">
                                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Impact Points</p>
                                     <p className="text-4xl font-black text-slate-900">48k</p>
                                     <div className="h-1 w-12 bg-slate-200 mt-4 rounded-full"></div>
                                  </div>
                              </div>
                           </div>

                           {/* Protocol Alert Section */}
                           <div className="md:col-span-4 bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                              <div>
                                 <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <HouseIcon className="h-5 w-5 text-orange-400" /> FastTrack Logistics
                                 </h3>
                                 <div className="space-y-6">
                                    <div className="flex gap-4">
                                       <div className="h-10 w-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-orange-400 border border-white/10">
                                          <Users className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold">Mass Deployment Mode</p>
                                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">System automatically notifies 5 nearby NGOs for events with 500+ portions.</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                       <div className="h-10 w-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10">
                                          <Clock className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold">Cold-Chain Handover</p>
                                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">Priority pickup and temperature verification guaranteed within 45m.</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="mt-10">
                                 <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Download Venue Protocol</button>
                              </div>
                              <div className="absolute -bottom-10 -right-10 bg-orange-600/10 w-40 h-40 rounded-full blur-3xl"></div>
                           </div>

                           {/* Featured NGO Highlight Section */}
                           <div className="md:col-span-12">
                              <div className="flex items-center justify-between mb-8 px-4">
                                 <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top Verified Rescue Partners</h3>
                                    <p className="text-sm text-slate-500 mt-1">NGOs specializing in large-scale event handling.</p>
                                 </div>
                                 <button className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl border border-orange-100 transition-all">Browse Directory</button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {[
                                    { name: 'Mumbai Roti Bank', missions: 128, rating: 4.9, icon: Building2 },
                                    { name: 'Feeding India', missions: 450, rating: 5.0, icon: Heart },
                                    { name: 'Uday Foundation', missions: 84, rating: 4.8, icon: Award },
                                    { name: 'ResQ Global', missions: 215, rating: 4.9, icon: ShieldCheck }
                                 ].map((ngo, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                                       <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                                          <ngo.icon className="w-7 h-7" />
                                       </div>
                                       <h4 className="font-extrabold text-slate-900 text-lg mb-2">{ngo.name}</h4>
                                       <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ngo.missions} Rescues</p>
                                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">★ {ngo.rating}</span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                    </section>
                )}


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
                                color="bg-orange-500"
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
                            <VerificationGate role="events">
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
                            </VerificationGate>

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
                    <div className="space-y-8 w-full">
                        <ProfileVerificationCenter />
                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full animate-in slide-in-from-bottom-5 duration-500">
                            <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700"><Building2 className="h-48 w-48" /></div>
                                
                                <div className="flex items-center gap-6 mb-12 relative z-10 pb-10 border-b border-slate-50">
                                    <div className="h-24 w-24 bg-orange-100 rounded-[2rem] flex items-center justify-center text-orange-600 text-4xl font-black shadow-xl shadow-orange-100/50">
                                        {user?.name?.[0] || 'E'}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-emerald-100">Premier Event Partner</span>
                                            <span className="text-[10px] font-black text-slate-400 tracking-widest">ID: E-9485023</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Company / Organization</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input 
                                                disabled={!isEditingProfile}
                                                value={editProfileData.name}
                                                onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-slate-800 disabled:opacity-75"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Logistics Contact Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input 
                                                disabled={!isEditingProfile}
                                                value={editProfileData.email}
                                                type="email"
                                                onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-slate-800 disabled:opacity-75"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Firm Hotline</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input 
                                                disabled={!isEditingProfile}
                                                value={editProfileData.phone}
                                                onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-slate-800 disabled:opacity-75"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Headquarter</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                            <input 
                                                disabled={!isEditingProfile}
                                                value={editProfileData.address}
                                                onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-slate-800 disabled:opacity-75"
                                            />
                                        </div>
                                    </div>

                                    {isEditingProfile && (
                                        <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Password Reset</label>
                                            <input 
                                                type="password" 
                                                placeholder="Change only if required"
                                                value={editProfileData.password}
                                                onChange={(e) => setEditProfileData({...editProfileData, password: e.target.value})}
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12 pt-10 border-t border-slate-100 flex justify-end gap-4">
                                    {isEditingProfile && (
                                        <button 
                                            type="submit"
                                            disabled={isUpdatingProfile}
                                            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-10 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/30 hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-75"
                                        >
                                            {isUpdatingProfile ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : 'Save Partner Details'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-orange-50 p-10 rounded-[3rem] border border-orange-100 flex items-center justify-between shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Award className="h-20 w-20 text-orange-600" /></div>
                                <div className="space-y-1 relative z-10">
                                    <h4 className="text-xl font-black text-orange-950">Annual CSR Excellence</h4>
                                    <p className="text-sm text-orange-700 font-medium">Your audited impact certificate for 2025-26 is ready for download.</p>
                                </div>
                                <button type="button" className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all active:scale-95 relative z-10">Audited Report PDF</button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-orange-500" /> Firm Configuration
                                </h3>
                                <div className="space-y-5">
                                    <div className="p-6 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-orange-100 transition-all group cursor-help">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">Safety Rating</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-slate-900">4.95</p>
                                            <span className="text-[10px] font-extrabold text-orange-500 uppercase">Top 1%</span>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-orange-100 transition-all group cursor-help">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">Avg. Rescue Volume</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-slate-900">1.2k</p>
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Meals / Mo</span>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-orange-100 transition-all group cursor-help">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">Global Impact Rank</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-slate-900">#42</p>
                                            <span className="text-[10px] font-extrabold text-orange-500 uppercase">Elite Tier</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <ShieldCheck className="h-10 w-10 text-orange-400 mb-4 relative z-10" />
                                <h4 className="text-xl font-bold mb-2 relative z-10">Catering License</h4>
                                <p className="text-slate-400 text-[11px] leading-relaxed mb-8 relative z-10">Your enterprise food safety and logistics license has been automatically renewed based on your 99.2% success rate.</p>
                                <button type="button" className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all relative z-10">View Entitlement</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            </div>
        </div>
    )
}

export default EventsDashboard
