import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, LineChart, Line, ScatterChart, Scatter, Pie, PieChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts'
import { 
  Calendar, MapPin, Utensils, Users, Clock, 
  TrendingUp, Award, Building2, Mail, Phone,
  Loader2, Plus, History, Heart, ShieldCheck,
  Gift, PartyPopper, Home as HouseIcon, Briefcase, Bot,
  AlertTriangle, Activity, Zap, CheckCircle2, Navigation, Truck,
  Leaf, Radio, ChevronRight, BarChart3, ThermometerSun,
  Map as MapIcon, ArrowRight, AlertCircle, Trophy
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
    const [foodSeg, setFoodSeg] = useState('cooked')
    const [coldChain, setColdChain] = useState(true)
    const [multiNgo, setMultiNgo] = useState(true)
    const [forecast, setForecast] = useState<any[]>([])
    const [isAiLoading, setIsAiLoading] = useState(false)

    // Analysis Data
    const eventVolumeTrend = [
        { month: 'Jan', cooked: 400, raw: 240, packaged: 180 },
        { month: 'Feb', cooked: 300, raw: 139, packaged: 220 },
        { month: 'Mar', cooked: 500, raw: 380, packaged: 250 },
        { month: 'Apr', cooked: 450, raw: 390, packaged: 280 },
        { month: 'May', cooked: 600, raw: 480, packaged: 320 },
        { month: 'Jun', cooked: 550, raw: 430, packaged: 300 },
    ];

    const latencyScatterData = [
        { x: 1, y: 12, z: 200 },
        { x: 2, y: 15, z: 260 },
        { x: 3, y: 8, z: 400 },
        { x: 4, y: 22, z: 280 },
        { x: 5, y: 18, z: 500 },
        { x: 6, y: 14, z: 600 },
    ];

    const impactSuccessData = [
        { name: 'Weddings', value: 45, fill: '#f97316' },
        { name: 'Corporate', value: 30, fill: '#3b82f6' },
        { name: 'Festivals', value: 15, fill: '#10b981' },
        { name: 'Private', value: 10, fill: '#6366f1' },
    ];

    const capabilityRadarData = [
        { subject: 'Logistics', A: 120, fullMark: 150 },
        { subject: 'Food Safety', A: 140, fullMark: 150 },
        { subject: 'NGO Network', A: 110, fullMark: 150 },
        { subject: 'Response Time', A: 90, fullMark: 150 },
        { subject: 'Cold Chain', A: 130, fullMark: 150 },
        { subject: 'Scalability', A: 100, fullMark: 150 },
    ];

    const isProfile = location.pathname.includes('profile')
    const isSchedule = location.pathname.includes('schedule')
    const isHome = location.pathname.includes('home')
    const isControl = location.pathname.includes('control')
    const isAnalytics = location.pathname.includes('analytics')
    const isDashboard = !isProfile && !isSchedule && !isHome && !isControl && !isAnalytics

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
                            {isControl && 'Active Event Control Center'}
                            {isAnalytics && 'Post-Event Impact Analytics'}
                            {isProfile && 'Partner Details'}
                        </h1>
                        <p className="text-slate-500 mt-1 max-w-xl">
                            {isHome && 'Coordinate the rescue of hundreds of portions in minutes.'}
                            {isDashboard && 'Overview of your recent events and cumulative impact.'}
                            {isSchedule && 'Coordinate the rescue of large-scale event surplus with our logistics team.'}
                            {isControl && 'Real-time operational control for managing ongoing large-scale rescue events.'}
                            {isAnalytics && 'Data-driven insights to evaluate and improve mass rescue operations.'}
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
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    {/* SECTION 1: HERO (ACTION-DRIVEN) */}
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                       <div className="relative z-10">
                          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-4 backdrop-blur-md border border-white/10 uppercase tracking-widest">
                            Command Center • {user?.name || 'Event Partner'}
                          </span>
                          <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                            Mass Rescue Command Center
                          </h2>
                          <div className="flex flex-col sm:flex-row gap-4 mb-8">
                             <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                                <span className="font-semibold text-sm">Focus on large-scale food redistribution</span>
                             </div>
                          </div>
                          <div className="flex gap-4 flex-wrap">
                             <button onClick={() => navigate('/events/schedule')} className="bg-white text-orange-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-orange-50 transition-all flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Start New Event
                             </button>
                             <button onClick={() => navigate('/events')} className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Manage Active Event
                             </button>
                          </div>
                       </div>
                       <div className="absolute top-0 right-0 -mt-20 -mr-20 bg-white/10 w-96 h-96 rounded-full blur-[100px]"></div>
                       <div className="absolute bottom-10 right-10 opacity-20 hidden md:block">
                          <MapIcon className="w-64 h-64" />
                       </div>
                    </div>

                    {/* ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 flex flex-col gap-8">
                          {/* KPI CARDS (Like NGO Performance Metrics) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Calendar className="h-16 w-16" /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Events</p>
                                <h4 className="text-3xl font-black text-slate-900 mb-1">{donations.length}</h4>
                                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">Managed to date</p>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Utensils className="h-16 w-16" /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meals Rescued</p>
                                <h4 className="text-3xl font-black text-slate-900 mb-1">1,200</h4>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +150 this month</p>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Building2 className="h-16 w-16" /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active NGOs</p>
                                <h4 className="text-3xl font-black text-slate-900 mb-1">8</h4>
                                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">Available nearby</p>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Users className="h-16 w-16" /></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Volunteers</p>
                                <h4 className="text-3xl font-black text-slate-900 mb-1">24</h4>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">Ready for dispatch</p>
                             </div>
                          </div>

                          {/* ACTIVE EVENT PANEL */}
                          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex-1">
                             <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                   <Activity className="h-5 w-5 text-orange-500" /> Current Event Status
                                </h3>
                                <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 animate-pulse">LIVE</span>
                             </div>
                             <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 transition-colors">
                                   <div className="flex gap-4 items-center w-full">
                                      <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                         <PartyPopper className="h-6 w-6" />
                                      </div>
                                      <div className="flex-1">
                                         <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-slate-900 text-lg">Grand Palace Wedding Rescue</h4>
                                            <span className="text-xs font-bold text-slate-500">65% Complete</span>
                                         </div>
                                         <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                            <div className="bg-emerald-500 h-2 rounded-full w-[65%] shadow-sm"></div>
                                         </div>
                                         <div className="text-sm text-slate-500 flex items-center gap-3">
                                            <span className="flex items-center gap-1 font-medium"><Building2 className="h-4 w-4 text-slate-400" /> 4 NGOs</span>
                                            <span className="flex items-center gap-1 font-medium"><Users className="h-4 w-4 text-slate-400" /> 12 Volunteers</span>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col gap-8">
                          {/* LOGISTICS PERFORMANCE (Like NGO System Flow or Quick Actions) */}
                          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
                             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-orange-400" /> Logistics Performance
                             </h3>
                             <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                                      <span className="text-sm font-medium">Avg Pickup Time</span>
                                   </div>
                                   <span className="font-bold text-xl text-emerald-400">14m</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Activity className="h-4 w-4" /></div>
                                      <span className="text-sm font-medium">Dist. Efficiency</span>
                                   </div>
                                   <span className="font-bold text-xl text-emerald-400">92%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center"><Award className="h-4 w-4" /></div>
                                      <span className="text-sm font-medium">Success Rate</span>
                                   </div>
                                   <span className="font-bold text-xl text-emerald-400">98%</span>
                                </div>
                             </div>
                          </div>

                          {/* LIVE ALERTS PANEL */}
                          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex-1">
                             <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-rose-500" /> Live Alerts
                             </h3>
                             <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex flex-col gap-2">
                                   <div className="flex items-start justify-between">
                                      <span className="text-sm font-bold text-red-900 flex items-center gap-2"><Clock className="h-4 w-4 text-red-500" /> Food Expiry Warning</span>
                                   </div>
                                   <p className="text-xs text-red-700">Course 1 items expiring in 30 mins.</p>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
                                   <div className="flex items-start justify-between">
                                      <span className="text-sm font-bold text-amber-900 flex items-center gap-2"><Truck className="h-4 w-4 text-amber-500" /> NGO Delays Detected</span>
                                   </div>
                                   <p className="text-xs text-amber-700">Feeding India truck delayed by traffic.</p>
                                </div>
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex flex-col gap-2">
                                   <div className="flex items-start justify-between">
                                      <span className="text-sm font-bold text-rose-900 flex items-center gap-2"><Users className="h-4 w-4 text-rose-500" /> Volunteer Shortages</span>
                                   </div>
                                   <p className="text-xs text-rose-700">High demand zone. Only 2 active volunteers in vicinity.</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2">
                          {/* NGO PARTNERS SECTION */}
                          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full">
                             <div className="flex items-center justify-between mb-8">
                                <div>
                                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                      <Building2 className="h-5 w-5 text-orange-500" /> Verified Rescue Partners
                                   </h3>
                                   <p className="text-sm text-slate-500 mt-1">Available NGOs for mass operations</p>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                   { name: 'Mumbai Roti Bank', capacity: 'High Capacity', dist: '1.2 km', avail: 'Available Now', icon: Building2 },
                                   { name: 'Feeding India', capacity: 'Medium Capacity', dist: '2.5 km', avail: 'Busy (ETA 20m)', icon: Heart },
                                   { name: 'Uday Foundation', capacity: 'High Capacity', dist: '3.0 km', avail: 'Available Now', icon: Award },
                                   { name: 'ResQ Global', capacity: 'Large Vehicles', dist: '4.5 km', avail: 'Available Now', icon: Truck }
                                ].map((ngo, i) => (
                                   <div key={i} className="flex flex-col p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200 transition-all hover:shadow-sm">
                                      <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                         <ngo.icon className="h-6 w-6" />
                                      </div>
                                      <h4 className="font-bold text-slate-900 mb-2">{ngo.name}</h4>
                                      <div className="space-y-1 mt-auto">
                                         <p className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Truck className="h-3 w-3" /> {ngo.capacity}</p>
                                         <p className="text-xs font-semibold text-slate-600 flex items-center gap-2"><MapPin className="h-3 w-3" /> {ngo.dist}</p>
                                         <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${ngo.avail.includes('Busy') ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {ngo.avail}
                                         </p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col gap-8">
                          {/* EVENT READINESS PANEL (Like Volunteer Status) */}
                          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                             <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-orange-500" /> Readiness Panel
                             </h3>
                             <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                   <span className="flex items-center gap-2 text-slate-600"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> NGOs Available</span>
                                   <span className="font-bold text-slate-900">8</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                   <span className="flex items-center gap-2 text-slate-600"><div className="h-2 w-2 rounded-full bg-blue-500"></div> Volunteers Ready</span>
                                   <span className="font-bold text-slate-900">24</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                   <span className="flex items-center gap-2 text-slate-600"><div className="h-2 w-2 rounded-full bg-amber-500"></div> Est. Response Time</span>
                                   <span className="font-bold text-slate-900">8 mins</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}


                {/* DASHBOARD VIEW */}
                {isDashboard && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* 1. KPI CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatCard icon={Calendar} label="Total Events" value={donations.length} subtext="Contributions to Date" color="bg-orange-500" />
                            <StatCard icon={Utensils} label="Meals Rescued" value={donations.reduce((acc, d) => acc + (parseInt(d.quantity) || 0), 0) || 1200} subtext="Total Servings" color="bg-orange-500" />
                            <StatCard icon={Users} label="People Impacted" value={(donations.reduce((acc, d) => acc + (parseInt(d.quantity) || 0), 0) || 1200) * 1.2} subtext="Estimated Reach" color="bg-emerald-500" />
                            <StatCard icon={Building2} label="Active NGOs" value="8" subtext="Available Nearby" color="bg-blue-500" />
                            <StatCard icon={Users} label="Volunteers" value="24" subtext="Currently Assigned" color="bg-indigo-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                           <div className="lg:col-span-8 space-y-6">
                              {/* 2. LIVE EVENT PERFORMANCE PANEL */}
                              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                                 <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                       <Activity className="h-5 w-5 text-orange-500" /> Live Event Performance
                                    </h3>
                                    <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 animate-pulse">LIVE</span>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 transition-colors">
                                       <div className="flex gap-4 items-center w-full">
                                          <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                             <PartyPopper className="h-5 w-5" />
                                          </div>
                                          <div className="flex-1">
                                             <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-slate-900 text-sm">Grand Palace Wedding Rescue</h4>
                                                <span className="text-xs font-bold text-slate-500">65% Complete</span>
                                             </div>
                                             <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                                                <div className="bg-emerald-500 h-1.5 rounded-full w-[65%] shadow-sm"></div>
                                             </div>
                                             <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" /> 4 NGOs Active</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> 2 Pending Pickups</span>
                                                <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-rose-500" /> 1 Delayed</span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* 3. EVENT TIMELINE TRACKER */}
                              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                 <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest text-center">Event Timeline Tracker</h3>
                                 <div className="flex items-center justify-between relative px-2 sm:px-8">
                                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
                                    {[
                                       { status: 'Created', count: '✓', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
                                       { status: 'Assigned', count: '✓', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
                                       { status: 'Pickup', count: '3', color: 'bg-orange-100 text-orange-600 border-orange-400 ring-4 ring-orange-50' },
                                       { status: 'Distribution', count: '0', color: 'bg-slate-100 text-slate-400 border-slate-200' },
                                       { status: 'Completed', count: '0', color: 'bg-slate-100 text-slate-400 border-slate-200' }
                                    ].map((step, i) => (
                                       <div key={i} className="relative z-10 flex flex-col items-center gap-2 bg-white px-1 sm:px-2">
                                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border-2 ${step.color}`}>
                                             {step.count}
                                          </div>
                                          <span className={`text-[10px] font-bold hidden sm:block uppercase tracking-wider ${step.color.includes('orange') ? 'text-orange-600' : 'text-slate-500'}`}>{step.status}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* 7. EVENT HISTORY & 4. NGO PERFORMANCE RANKING */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                          <History className="h-4 w-4 text-blue-500" /> Event History
                                       </h3>
                                       <button className="text-[10px] font-bold text-orange-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                       {donations.slice(0, 3).map((donation) => (
                                          <div key={donation.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2 hover:bg-white hover:border-orange-100 transition-colors cursor-pointer group">
                                             <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{donation.foodType}</span>
                                                <StatusBadge status={donation.status} />
                                             </div>
                                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <span>{donation.quantity}</span> • <span>{donation.location}</span>
                                             </div>
                                          </div>
                                       ))}
                                       {donations.length === 0 && (
                                          <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-lg">No past events found.</p>
                                       )}
                                    </div>
                                 </div>

                                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                       <Award className="h-4 w-4 text-emerald-500" /> NGO Performance
                                    </h3>
                                    <div className="space-y-4">
                                       {[
                                          { name: 'Feeding India', rate: '99%', time: '12m', color: 'bg-emerald-500' },
                                          { name: 'Mumbai Roti Bank', rate: '96%', time: '15m', color: 'bg-blue-500' },
                                          { name: 'ResQ Global', rate: '92%', time: '18m', color: 'bg-amber-500' }
                                       ].map((ngo, i) => (
                                          <div key={i} className="flex gap-3 items-center">
                                             <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-100 shrink-0">#{i+1}</div>
                                             <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                   <p className="text-sm font-bold text-slate-900">{ngo.name}</p>
                                                   <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{ngo.time} avg</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                   <div className={`h-1.5 rounded-full ${ngo.color}`} style={{ width: ngo.rate }}></div>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="lg:col-span-4 space-y-6">
                              {/* 8. IMPACT TREND GRAPH / EVENT TYPE ANALYSIS */}
                              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                                 <h3 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-orange-400" /> Event Type Analysis
                                 </h3>
                                 <div className="space-y-3 relative z-10">
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                       <div className="h-8 w-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center"><PartyPopper className="h-4 w-4" /></div>
                                       <div className="flex-1">
                                          <div className="flex justify-between items-center mb-1">
                                             <p className="text-xs font-bold text-slate-200">Weddings</p>
                                             <span className="text-xs font-black text-white">45%</span>
                                          </div>
                                          <div className="h-1 w-full bg-slate-800 rounded-full"><div className="h-full bg-rose-500 rounded-full w-[45%]"></div></div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                       <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><Briefcase className="h-4 w-4" /></div>
                                       <div className="flex-1">
                                          <div className="flex justify-between items-center mb-1">
                                             <p className="text-xs font-bold text-slate-200">Corporate</p>
                                             <span className="text-xs font-black text-white">30%</span>
                                          </div>
                                          <div className="h-1 w-full bg-slate-800 rounded-full"><div className="h-full bg-blue-500 rounded-full w-[30%]"></div></div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                       <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
                                       <div className="flex-1">
                                          <div className="flex justify-between items-center mb-1">
                                             <p className="text-xs font-bold text-slate-200">Festivals</p>
                                             <span className="text-xs font-black text-white">25%</span>
                                          </div>
                                          <div className="h-1 w-full bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full w-[25%]"></div></div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* 6. BOTTLENECK DETECTION PANEL */}
                              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                 <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" /> Bottleneck Detection
                                 </h3>
                                 <div className="space-y-2">
                                    <div className="p-3 rounded-xl border-l-4 border-red-500 bg-red-50 text-red-900 text-xs font-bold flex flex-col gap-1">
                                       <div className="flex justify-between items-center">
                                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pickup Delay</span>
                                          <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-red-100 text-[10px]">Critical</span>
                                       </div>
                                       <p className="text-[10px] text-red-700 font-medium">NGO truck stuck in transit. ETA +20m.</p>
                                    </div>
                                    <div className="p-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 text-amber-900 text-xs font-bold flex flex-col gap-1">
                                       <div className="flex justify-between items-center">
                                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Vol. Shortage</span>
                                          <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-amber-100 text-[10px]">Warning</span>
                                       </div>
                                       <p className="text-[10px] text-amber-700 font-medium">Need 3 more volunteers at Grand Palace.</p>
                                    </div>
                                 </div>
                              </div>

                              {/* 5. VOLUNTEER EFFICIENCY PANEL */}
                              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                 <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" /> Volunteer Efficiency
                                 </h3>
                                 <div className="space-y-3">
                                    {[
                                       { name: 'Rahul K.', deliveries: 45, rate: '100%', active: true },
                                       { name: 'Priya S.', deliveries: 38, rate: '98%', active: true },
                                       { name: 'Amit V.', deliveries: 34, rate: '95%', active: false }
                                    ].map((vol, i) => (
                                       <div key={i} className="flex items-center justify-between p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                                          <div className="flex items-center gap-3">
                                             <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
                                                {vol.name[0]}
                                             </div>
                                             <div>
                                                <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                                   {vol.name} {vol.active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-medium">{vol.deliveries} Deliveries</p>
                                             </div>
                                          </div>
                                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">{vol.rate}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                    </div>
                )}

                {/* SCHEDULE VIEW */}
                {isSchedule && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* LEFT COLUMN: Input & Planning */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* 1. Event Basic Info */}
                            <VerificationGate role="events">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                       <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                          <Calendar className="h-5 w-5 text-orange-500" /> Event Details
                                       </h2>
                                       {/* 9. Event Templates (enhanced) */}
                                       <div className="flex gap-2">
                                          <button type="button" onClick={() => applyTemplate(eventTemplates[0])} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors">Wedding</button>
                                          <button type="button" onClick={() => applyTemplate(eventTemplates[1])} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors">Corporate</button>
                                       </div>
                                    </div>
                                    <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Event / Food Description</label>
                                                <div className="relative">
                                                    <PartyPopper className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Est. Quantity (Servings)</label>
                                                    <div className="relative">
                                                        <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <input
                                                            name="quantity"
                                                            value={formData.quantity}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                                                            placeholder="200"
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
                                    </form>
                                </div>
                            </VerificationGate>

                            {/* 6. Food Type Segmentation */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                  <Utensils className="h-4 w-4 text-orange-500" /> Food Segmentation
                               </h3>
                               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                  <label onClick={() => setFoodSeg('cooked')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${foodSeg === 'cooked' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-200'}`}>
                                     <PartyPopper className={`h-6 w-6 mb-2 ${foodSeg === 'cooked' ? 'text-orange-500' : 'text-slate-400'}`} />
                                     <span className="text-xs font-bold">Cooked Meals</span>
                                  </label>
                                  <label onClick={() => setFoodSeg('packaged')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${foodSeg === 'packaged' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-200'}`}>
                                     <Briefcase className={`h-6 w-6 mb-2 ${foodSeg === 'packaged' ? 'text-orange-500' : 'text-slate-400'}`} />
                                     <span className="text-xs font-bold">Packaged Items</span>
                                  </label>
                                  <label onClick={() => setFoodSeg('raw')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${foodSeg === 'raw' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-200'}`}>
                                     <Leaf className={`h-6 w-6 mb-2 ${foodSeg === 'raw' ? 'text-orange-500' : 'text-slate-400'}`} />
                                     <span className="text-xs font-bold">Raw/Perishable</span>
                                  </label>
                               </div>
                               <div onClick={() => setColdChain(!coldChain)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${coldChain ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'}`}>
                                  <ThermometerSun className={`h-5 w-5 ${coldChain ? 'text-blue-500' : 'text-slate-400'}`} />
                                  <div className="flex-1">
                                     <p className={`text-xs font-bold ${coldChain ? 'text-blue-900' : 'text-slate-700'}`}>Cold Chain Required</p>
                                     <p className={`text-[10px] ${coldChain ? 'text-blue-700' : 'text-slate-500'}`}>Temperature-controlled vehicles will be prioritized.</p>
                                  </div>
                                  <div className={`w-10 h-6 rounded-full relative shadow-inner transition-colors duration-300 ${coldChain ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${coldChain ? 'right-1' : 'left-1'}`}></div>
                                  </div>
                               </div>
                            </div>

                            {/* 5. Zone Distribution Planner & 10. Multi-NGO Toggle */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                     <MapIcon className="h-4 w-4 text-orange-500" /> Zone Distribution Planner
                                  </h3>
                                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setMultiNgo(!multiNgo)}>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-700 transition-colors">Multi-NGO Dispatch</span>
                                     <div className={`w-8 h-4 rounded-full relative shadow-inner transition-colors duration-300 ${multiNgo ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all duration-300 ${multiNgo ? 'right-0.5' : 'left-0.5'}`}></div>
                                     </div>
                                  </div>
                               </div>
                               <p className="text-xs text-slate-500 mb-4 leading-relaxed">For events {">"}500 meals, we automatically split distribution across multiple zones to accelerate delivery.</p>
                               <div className="space-y-3">
                                  <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                                     <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">Z1</div>
                                     <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900">North District Dropoff</p>
                                        <p className="text-[10px] text-slate-500">Allocated: ~40% of total</p>
                                     </div>
                                     <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded">2 NGOs Ready</span>
                                  </div>
                                  <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                                     <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">Z2</div>
                                     <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900">South Metro Area</p>
                                        <p className="text-[10px] text-slate-500">Allocated: ~60% of total</p>
                                     </div>
                                     <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded">3 NGOs Ready</span>
                                  </div>
                               </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Intelligence & Confirmation */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* 2. Smart Prediction Panel */}
                            <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
                               <h3 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 text-slate-300">
                                  <Bot className="h-4 w-4 text-orange-400" /> AI Forecast
                               </h3>
                               <div className="grid grid-cols-2 gap-4 relative z-10">
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">NGOs Req.</p>
                                     <p className="text-2xl font-bold text-white flex items-center gap-2">4 <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">Optimal</span></p>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Est. Pickup</p>
                                     <p className="text-2xl font-bold text-white">18m</p>
                                  </div>
                                  <div className="col-span-2 p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                                     <span className="text-xs font-bold text-slate-300">Expected Completion</span>
                                     <span className="text-sm font-black text-emerald-400">1h 15m total</span>
                                  </div>
                               </div>
                            </div>

                            {/* 7. Risk & Expiry Warning */}
                            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex gap-3">
                               <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                               <div>
                                  <h4 className="text-xs font-bold text-rose-900 mb-1">Expiry Risk Detected</h4>
                                  <p className="text-[10px] text-rose-700 leading-relaxed">The timeline provided implies high perishability. The system will activate "Urgent Priority Dispatch" for this event.</p>
                               </div>
                            </div>

                            {/* 3. NGO Auto-Match Preview & 4. Volunteer Requirement */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                  <Radio className="h-4 w-4 text-orange-500" /> Auto-Match Preview
                               </h3>
                               
                               <div className="space-y-4 mb-6">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
                                     <span>Available Within 5km</span>
                                     <span className="text-emerald-600">6 Organizations</span>
                                  </div>
                                  {[
                                     { name: 'Feeding India', dist: '1.2km', avail: 'High' },
                                     { name: 'Mumbai Roti Bank', dist: '2.5km', avail: 'High' }
                                  ].map((ngo, i) => (
                                     <div key={i} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                           <span className="text-xs font-bold text-slate-900">{ngo.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{ngo.dist}</span>
                                     </div>
                                  ))}
                               </div>

                               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resource Requirements</h4>
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-xs font-bold text-slate-700 flex items-center gap-1"><Users className="h-3 w-3 text-blue-500" /> Required Volunteers</span>
                                     <span className="text-sm font-black text-slate-900">12 Total</span>
                                  </div>
                                  <div className="flex gap-1 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                     <div className="bg-blue-500 h-full w-[40%]" title="Pickup: 5"></div>
                                     <div className="bg-emerald-500 h-full w-[60%]" title="Distribution: 7"></div>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                     <span className="text-[9px] font-bold text-blue-600">40% Loading</span>
                                     <span className="text-[9px] font-bold text-emerald-600">60% Dropoff</span>
                                  </div>
                               </div>
                            </div>

                            {/* 8. Impact Preview */}
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                               <div className="absolute right-0 bottom-0 opacity-10"><Leaf className="w-32 h-32 -mr-6 -mb-6" /></div>
                               <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-2">Projected Impact</p>
                               <div className="flex justify-between items-end relative z-10">
                                  <div>
                                     <p className="text-3xl font-black">240</p>
                                     <p className="text-xs font-bold text-emerald-100 mt-0.5">People Fed</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-xl font-black">35 kg</p>
                                     <p className="text-[10px] font-bold text-emerald-100 mt-0.5">CO₂ Saved</p>
                                  </div>
                               </div>
                            </div>

                            {/* 11. Final Confirmation Panel */}
                            <button
                               form="schedule-form"
                               type="submit"
                               disabled={isSubmitting}
                               className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm & Dispatch Mission'}
                               {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                            </button>
                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                               Action triggers immediate SMS to matched NGOs
                            </p>
                        </div>
                    </div>
                )}

                {/* CONTROL VIEW */}
                {isControl && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* 1. Event Header & 9. Control Actions */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-slate-900">Grand Palace Wedding Rescue</h2>
                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200 animate-pulse">Live</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1"><Utensils className="h-4 w-4" /> 500 Meals Total</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Started 2:30 PM</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Loading Dock B</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">Reassign NGO</button>
                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">Add Volunteer</button>
                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">Adjust Dist.</button>
                                <button className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300">Cancel</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                {/* 2. Live Progress Tracker */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-orange-500" /> Live Operation Progress
                                    </h3>
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-xl font-black text-slate-900">500</p>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                            <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest mb-1">Picked</p>
                                            <p className="text-xl font-black text-orange-700">350</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest mb-1">Delivered</p>
                                            <p className="text-xl font-black text-blue-700">200</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Remaining</p>
                                            <p className="text-xl font-black text-emerald-700">150</p>
                                        </div>
                                    </div>
                                    <div className="relative pt-2">
                                        <div className="flex mb-2 items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Overall Completion</span>
                                            <span className="text-xs font-black text-emerald-600">40%</span>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                                            <div style={{ width: "40%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Event Timeline */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <History className="h-4 w-4 text-blue-500" /> Mission Timeline
                                    </h3>
                                    <div className="flex items-center justify-between relative px-2 sm:px-8">
                                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
                                        {[
                                            { status: 'Created', time: '2:00 PM', active: true, color: 'bg-emerald-500 text-white border-emerald-500' },
                                            { status: 'Assigned', time: '2:15 PM', active: true, color: 'bg-emerald-500 text-white border-emerald-500' },
                                            { status: 'Pickup', time: 'In Progress', active: true, color: 'bg-orange-500 text-white border-orange-500 ring-4 ring-orange-50' },
                                            { status: 'Distribution', time: 'Pending', active: false, color: 'bg-white text-slate-300 border-slate-200' },
                                            { status: 'Completed', time: 'Pending', active: false, color: 'bg-white text-slate-300 border-slate-200' }
                                        ].map((step, i) => (
                                            <div key={i} className="relative z-10 flex flex-col items-center gap-2 bg-white px-1 sm:px-2">
                                                <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm border-2 ${step.color}`}>
                                                    {step.active && step.status !== 'Pickup' ? '✓' : i + 1}
                                                </div>
                                                <div className="text-center">
                                                    <span className={`text-[9px] sm:text-[10px] font-bold block uppercase tracking-wider ${step.status === 'Pickup' ? 'text-orange-600' : (step.active ? 'text-slate-900' : 'text-slate-400')}`}>{step.status}</span>
                                                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 block">{step.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. NGO Distribution Panel & 5. Zone Distribution View */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-emerald-500" /> Active NGOs
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'Feeding India', assigned: 300, progress: 60 },
                                                { name: 'Mumbai Roti Bank', assigned: 200, progress: 10 }
                                            ].map((ngo, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-slate-900">{ngo.name}</span>
                                                        <span className="text-[10px] font-black text-slate-500">{ngo.assigned} Meals</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${ngo.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <MapIcon className="h-4 w-4 text-indigo-500" /> Zone Distribution
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { zone: 'North District', status: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                                { zone: 'South Metro', status: 'Delayed', color: 'text-amber-600 bg-amber-50 border-amber-100' }
                                            ].map((z, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                                                    <span className="text-xs font-bold text-slate-700">{z.zone}</span>
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${z.color}`}>{z.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                {/* 7. Alerts & Risks */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-rose-500" /> Live Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 flex gap-3">
                                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-amber-900">Traffic Delay (Z2)</p>
                                                <p className="text-[10px] text-amber-700 mt-0.5">South Metro delivery delayed by 15 mins.</p>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl border-l-4 border-rose-500 bg-rose-50 flex gap-3">
                                            <ThermometerSun className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-rose-900">Expiry Warning</p>
                                                <p className="text-[10px] text-rose-700 mt-0.5">Perishables must be distributed within 1 hr.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Volunteer Tracking Panel */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-500" /> Active Fleet
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Rahul K.', role: 'Driver', status: 'On Route', dot: 'bg-amber-500' },
                                            { name: 'Priya S.', role: 'Distributor', status: 'Idle', dot: 'bg-slate-300' },
                                            { name: 'Amit V.', role: 'Driver', status: 'Delivering', dot: 'bg-emerald-500' }
                                        ].map((v, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{v.name[0]}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{v.name}</p>
                                                        <p className="text-[9px] text-slate-500 font-medium">{v.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${v.dot}`}></div>
                                                    <span className="text-[10px] font-bold text-slate-600">{v.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-100 rounded-xl">View Live Map →</button>
                                </div>

                                {/* 8. Impact Tracker */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group text-white">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700"><Zap className="w-24 h-24" /></div>
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-200">
                                        <TrendingUp className="h-4 w-4 text-orange-400" /> Real-time Impact
                                    </h3>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400">People Fed</span>
                                            <span className="text-lg font-black text-emerald-400">200</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400">Food Saved</span>
                                            <span className="text-lg font-black text-orange-400">120 kg</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400">CO₂ Reduced</span>
                                            <span className="text-lg font-black text-blue-400">18 kg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYTICS VIEW */}
                {isAnalytics && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Header & 10. Export Report */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Grand Palace Wedding Rescue</h2>
                                <p className="text-xs font-bold text-slate-500">Completed on Oct 24, 2026 • 500 Meals</p>
                            </div>
                            <button className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Export Full Report
                            </button>
                        </div>

                        {/* 1. Event Impact Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={Utensils} label="Total Meals" value="500" subtext="Rescued" color="bg-orange-500" />
                            <StatCard icon={Users} label="People Fed" value="480" subtext="Estimated" color="bg-blue-500" />
                            <StatCard icon={TrendingUp} label="Food Saved" value="250 kg" subtext="Diverted" color="bg-emerald-500" />
                            <StatCard icon={Leaf} label="CO₂ Reduced" value="38 kg" subtext="Emissions" color="bg-teal-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                {/* Row 1: Operational Efficiency & Volume */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-orange-500" /> Operational Performance Hub
                                    </h3>
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <div className="text-2xl font-black text-emerald-600 mb-1">98%</div>
                                            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Completion Rate</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <div className="text-2xl font-black text-blue-600 mb-1">12m</div>
                                            <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Avg Pickup Time</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                            <div className="text-2xl font-black text-orange-600 mb-1">45m</div>
                                            <div className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Avg Delivery Time</div>
                                        </div>
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={eventVolumeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorCooked" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="cooked" stroke="#f97316" fillOpacity={1} fill="url(#colorCooked)" />
                                                <Area type="monotone" dataKey="raw" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Row 2: Partner & Zone Performance */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-indigo-500" /> NGO Success Matrix
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'Feeding India', rate: '100%', meals: 300, color: 'bg-emerald-500' },
                                                { name: 'Mumbai Roti Bank', rate: '95%', meals: 200, color: 'bg-emerald-400' },
                                                { name: 'Robin Hood Army', rate: '92%', meals: 150, color: 'bg-emerald-300' }
                                            ].map((ngo, i) => (
                                                <div key={i} className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-700">{ngo.name} <span className="text-slate-400 font-normal">({ngo.meals}m)</span></span>
                                                        <span className="text-xs font-black text-slate-900">{ngo.rate}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                        <div className={`${ngo.color} h-1.5 rounded-full`} style={{ width: ngo.rate }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <MapIcon className="h-4 w-4 text-purple-500" /> Regional Hotspots
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'North District', completion: '100%', color: 'bg-emerald-500' },
                                                { name: 'South Metro', completion: '85%', color: 'bg-amber-400' },
                                                { name: 'East Corridor', completion: '72%', color: 'bg-orange-400' }
                                            ].map((zone, i) => (
                                                <div key={i} className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-700">{zone.name}</span>
                                                        <span className="text-xs font-black text-slate-900">{zone.completion}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                        <div className={`${zone.color} h-1.5 rounded-full`} style={{ width: zone.completion }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Categorical & Success Distribution */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-teal-500" /> Category Benchmark
                                        </h3>
                                        <div className="flex items-end gap-2 h-48 mt-4">
                                            {[
                                                { type: 'Corporate', height: '40%', value: 120, color: 'bg-slate-200' },
                                                { type: 'Birthday', height: '30%', value: 50, color: 'bg-slate-200' },
                                                { type: 'Wedding', height: '95%', value: 500, color: 'bg-orange-500' },
                                                { type: 'Concert', height: '60%', value: 300, color: 'bg-slate-200' }
                                            ].map((bar, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                                                    <span className="text-[10px] font-bold text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}m</span>
                                                    <div className={`w-full max-w-[40px] rounded-t-lg ${bar.color} transition-all duration-500`} style={{ height: bar.height }}></div>
                                                    <span className="text-[9px] font-bold text-slate-500 mt-2 rotate-45 sm:rotate-0 origin-left">{bar.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <PieChart className="h-4 w-4 text-indigo-500" /> Impact by Event Type
                                        </h3>
                                        <div className="h-[200px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={impactSuccessData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {impactSuccessData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                                            {impactSuccessData.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{entry.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Advanced Capability & Intelligence */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Award className="h-4 w-4 text-emerald-500" /> Event Capability Radar
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={capabilityRadarData}>
                                                    <PolarGrid stroke="#f1f5f9" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                                                    <Radar name="Performance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-orange-500" /> Intelligence Matrix (Latency)
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis type="number" dataKey="x" name="Order ID" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <YAxis type="number" dataKey="y" name="Latency" unit="m" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Scatter name="Latency" data={latencyScatterData} fill="#f97316" />
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                {/* 8. Recommendation Engine */}
                                <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
                                    <div className="absolute top-0 right-0 p-6 opacity-10"><Bot className="w-24 h-24" /></div>
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-emerald-100 relative z-10">
                                        <Zap className="h-4 w-4 text-yellow-400" /> AI Insights & Recommendations
                                    </h3>
                                    <div className="space-y-4 relative z-10">
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">Logistics Optimization</p>
                                            <p className="text-xs text-white leading-relaxed">For future events in South Metro, allocate 1 additional NGO. Current delays average 15 mins due to high traffic volume.</p>
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">Cold Chain Requirement</p>
                                            <p className="text-xs text-white leading-relaxed">80% of wedding surplus was perishable. Ensure early dispatch of refrigerated units next time.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 7. Bottleneck Insights */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-rose-500" /> Bottleneck Report
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="mt-0.5"><Clock className="h-4 w-4 text-amber-500" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Loading Delay</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Dock B was overcrowded. Resulted in 10 min idle time for 2 vehicles.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="mt-0.5"><MapPin className="h-4 w-4 text-rose-500" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Zone Misallocation</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">South Metro received 50 excess meals initially. Re-routed manually.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Volunteer Efficiency */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-orange-500" /> Top Volunteers
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Amit V.', deliveries: 4, efficiency: '98%' },
                                            { name: 'Priya S.', deliveries: 3, efficiency: '95%' },
                                            { name: 'Rahul K.', deliveries: 3, efficiency: '92%' }
                                        ].map((v, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">#{i + 1}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{v.name}</p>
                                                        <p className="text-[9px] text-slate-500 font-medium">{v.deliveries} Deliveries</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-black text-slate-700">{v.efficiency}</span>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Efficiency</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
