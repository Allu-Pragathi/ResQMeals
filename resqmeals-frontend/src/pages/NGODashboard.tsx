import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Clock, MapPin, Check, CheckCircle2, ChevronDown, X, Brain, Filter, List,
  Utensils, Users, Truck, AlertCircle, Leaf, ShieldCheck, Settings, Download, FileText,
  Building2, Mail, Phone, Heart, History, Star, HandHeart, Bell,
  TrendingUp, Map as MapIcon, Calendar, Loader2,
  ArrowRight, BarChart3, LayoutDashboard, UserCog, Activity
} from 'lucide-react'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell 
} from 'recharts'
import { FoodFinderMap } from '../components/ui/FoodFinderMap'
import ProfileVerificationCenter from '../components/ProfileVerificationCenter'
import VerificationGate from '../components/VerificationGate'

// Helper to calculate distance in KM
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

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
            <PriorityBadge priority={req.distance !== null && req.distance <= 5 ? 'High' : 'Low'} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span className="font-medium text-slate-700">{req.quantity}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {req.donor?.name || 'Unknown Donor'} ({req.location}) 
              {req.distance !== null && <span className="ml-1 text-orange-600 font-bold"> - {req.distance.toFixed(1)} km</span>}
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
            <VerificationGate role="ngo">
              <button 
                onClick={() => onAccept(req.id)}
                className="flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 hover:shadow-orange-500/30 transition-all"
              >
                Accept Rescue
              </button>
            </VerificationGate>
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
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    password: ''
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [filterNearby, setFilterNearby] = useState(false)
  const [trackingDonationId, setTrackingDonationId] = useState<string | null>(null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [forecastData, setForecastData] = useState<any[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  const isProfile = location.pathname.includes('profile')
  const isAvailable = location.pathname.includes('available')
  const isAnalytics = location.pathname.includes('analytics')
  const isHome = location.pathname.includes('home')
  const isMap = location.pathname.includes('map')
  const isDashboard = !isProfile && !isAvailable && !isAnalytics && !isHome && !isMap

  const seasonalData = [
    { month: 'Jan', volume: 450, festival: 'New Year' },
    { month: 'Feb', volume: 380, festival: '' },
    { month: 'Mar', volume: 520, festival: 'Holi' },
    { month: 'Apr', volume: 410, festival: '' },
    { month: 'May', volume: 490, festival: '' },
    { month: 'Jun', volume: 320, festival: '' },
    { month: 'Jul', volume: 440, festival: '' },
    { month: 'Aug', volume: 580, festival: 'Independence Day' },
    { month: 'Sep', volume: 420, festival: '' },
    { month: 'Oct', volume: 850, festival: 'Diwali' },
    { month: 'Nov', volume: 620, festival: 'Wedding Season' },
    { month: 'Dec', volume: 780, festival: 'Christmas' },
  ];

  const wasteZoneData = [
    { name: 'Gachibowli', value: 45, color: '#f97316' },
    { name: 'Kondapur', value: 25, color: '#fb923c' },
    { name: 'Madhapur', value: 20, color: '#fdba74' },
    { name: 'Financial Dist', value: 10, color: '#fed7aa' },
  ];

  // Live Tracking effect
  useEffect(() => {
    let watchId: number | null = null;
    if (trackingDonationId && "geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try { await api.patch(`/donations/${trackingDonationId}/location`, { latitude, longitude }); }
                catch (e) { console.error('Tracking error', e); }
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 10000 }
        );
    }
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, [trackingDonationId]);

  useEffect(() => {
    const savedUser = localStorage.getItem('resqmeals_current_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setEditProfileData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        address: parsedUser.address || '',
        phone: parsedUser.phone || '+91 9876543210',
        password: ''
      })
    }
  }, [])

  const fetchDonations = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/donations')
      
      let processed = res.data.donations.map((d: any) => ({ ...d, distance: null }));
      const savedUser = localStorage.getItem('resqmeals_current_user')
      if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u.latitude && u.longitude) {
              processed = processed.map((d: any) => ({
                  ...d,
                  distance: d.latitude && d.longitude 
                      ? getDistance(u.latitude, u.longitude, d.latitude, d.longitude)
                      : null
              }));
          }
      }

      setDonations(processed)
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
      setTrackingDonationId(id); // Start tracking
      fetchDonations()
      alert('Rescue accepted! Tracking started.')
    } catch (err: any) {
      console.error('Failed to accept donation', err)
      alert(err.response?.data?.error || 'Failed to accept donation. Please try again.')
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
      alert('Organization profile updated successfully!')
    } catch (err: any) {
      console.error('Failed to update profile', err)
      const errorMsg = err.response?.data?.error || 'Failed to update profile. Please try again.'
      alert(errorMsg)
    } finally {
      setIsUpdatingProfile(false)
    }
  }
  const fetchForecast = async () => {
    if (!user?.latitude || !user?.longitude) return;
    try {
        setIsAiLoading(true);
        const res = await api.get(`/donations/ml/forecast?lat=${user.latitude}&lng=${user.longitude}`);
        if (res.data.forecast) {
            setForecastData(res.data.forecast);
        }
    } catch (err) {
        console.error('Failed to fetch forecast', err);
    } finally {
        setIsAiLoading(false);
    }
  }

  useEffect(() => {
    if (isAnalytics && forecastData.length === 0) {
        fetchForecast();
    }
  }, [isAnalytics]);

  return (
    <div className="min-h-screen pb-10 animate-in fade-in duration-700">
      <div className="mx-auto w-full space-y-8">

        {/* Dynamic Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                Verified NGO Partner
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isHome && `Welcome, ${user?.name || 'NGO Partner'}!`}
              {isDashboard && `Dashboard Overview`}
              {isAvailable && 'Rescue Feed'}
              {isAnalytics && 'Mission Intelligence'}
              {isProfile && 'Organization Profile'}
            </h1>
            <p className="text-slate-500">
              {isHome && 'Ready to save lives today? Explore your mission control below.'}
              {isDashboard && 'Overview of your rescue operations and impact.'}
              {isAvailable && 'Available surplus food waiting for pickup.'}
              {isAnalytics && 'Data-driven insights for strategic mobilization.'}
              {isProfile && 'Manage your registration and operational details.'}
            </p>
          </div>
          <div className="flex gap-3">
             {/* Notification Button */}
             <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 p-2.5 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all relative"
                >
                  <Bell className="h-5 w-5" />
                  {donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 5).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-orange-900">Notifications</h3>
                      <span className="text-[10px] font-black bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 5).length} Urgent
                      </span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 5).map((d) => (
                        <div key={d.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                          navigate('/ngo/available');
                          setFilterNearby(true);
                          setIsNotificationsOpen(false);
                        }}>
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                               <Utensils className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900">{d.foodType}</p>
                               <p className="text-xs text-orange-600 font-bold mb-1">{d.distance.toFixed(1)} km away • {d.quantity}</p>
                               <p className="text-[10px] text-slate-400">Expires in {d.expiry}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 5).length === 0 && (
                        <div className="p-8 text-center">
                          <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No urgent missions nearby.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>

              <button 
               onClick={() => navigate(isAnalytics ? '/ngo' : '/ngo/analytics')}
               className={`inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition-all border ${isAnalytics ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
             >
               <TrendingUp className="mr-2 h-4 w-4" /> {isAnalytics ? 'Back to Home' : 'Mission Analytics'}
             </button>
             {isDashboard && (
                <button 
                  onClick={() => navigate('/ngo/available')}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all"
                >
                  <HandHeart className="mr-2 h-4 w-4" /> Start Rescue
                </button>
             )}
             {isProfile && (
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
             )}
          </div>
        </header>

        {/* MISSION CONTROL DASHBOARD (9 Sections) */}
        {/* HOME VIEW (8 Sections with Hero) */}
        {isHome && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* SECTION 1: HERO (ACTION-DRIVEN) */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-4 backdrop-blur-md border border-white/10 uppercase tracking-widest">
                    NGO Hub • {user?.name || 'NGO Partner'}
                  </span>
                  <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                    Welcome to Mission Control
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                     <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                        <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                        <span className="font-semibold text-sm">{donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 3).length || 5} urgent pickups within 3 km</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                        <Clock className="h-4 w-4 text-orange-200" />
                        <span className="font-semibold text-sm">2 expiring within 1 hour</span>
                     </div>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                     <button onClick={() => navigate('/ngo/available')} className="bg-white text-orange-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-orange-50 transition-all flex items-center gap-2">
                        Browse Available Food <ArrowRight className="h-4 w-4" />
                     </button>
                     <button onClick={() => navigate('/ngo/analytics')} className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> View Performance Metrics
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
                  {/* SECTION 2: URGENT RESCUE REQUESTS */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex-1">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                           <AlertCircle className="h-5 w-5 text-red-500" /> Top Urgent Requests
                        </h3>
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Action Required</span>
                     </div>
                     <div className="space-y-4">
                        {donations.filter(d => d.status === 'Pending').slice(0, 2).map((req) => (
                           <div key={req.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-orange-200 transition-colors">
                              <div className="flex gap-4 items-center">
                                 <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Utensils className="h-6 w-6" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <h4 className="font-bold text-slate-900">{req.foodType}</h4>
                                       <PriorityBadge priority={req.distance !== null && req.distance <= 3 ? 'High' : (req.distance !== null && req.distance <= 7 ? 'Medium' : 'Low')} />
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                       <span>{req.quantity}</span> • 
                                       <span className="flex items-center gap-1 text-red-500 font-medium"><Clock className="h-3 w-3" /> {req.expiry}</span> •
                                       <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {req.distance !== null ? `${req.distance.toFixed(1)} km` : req.location}</span>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => handleAccept(req.id)} className="mt-4 sm:mt-0 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors w-full sm:w-auto">
                                 Accept Rescue
                              </button>
                           </div>
                        ))}
                        {donations.filter(d => d.status === 'Pending').length === 0 && (
                           <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl h-full flex items-center justify-center">No urgent requests at the moment.</div>
                        )}
                     </div>
                  </div>

                  {/* SECTION 5: PERFORMANCE METRICS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="h-16 w-16" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Response Time</p>
                        <h4 className="text-3xl font-black text-slate-900 mb-1">12m</h4>
                        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Faster than 80% NGOs</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Heart className="h-16 w-16" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rescue Success</p>
                        <h4 className="text-3xl font-black text-slate-900 mb-1">94%</h4>
                        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +12% improvement this week</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Star className="h-16 w-16" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reliability Score</p>
                        <h4 className="text-3xl font-black text-slate-900 mb-1">4.9/5</h4>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">Based on donor ratings</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-8">
                  {/* SECTION 3: LIVE OPERATIONS */}
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-400" /> Live Operations
                     </h3>
                     <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><Truck className="h-4 w-4" /></div>
                              <span className="text-sm font-medium">Active Pickups</span>
                           </div>
                           <span className="font-bold text-xl">{donations.filter(d => d.status === 'Accepted').length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Users className="h-4 w-4" /></div>
                              <span className="text-sm font-medium">Volunteers on way</span>
                           </div>
                           <span className="font-bold text-xl">2</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center"><Utensils className="h-4 w-4" /></div>
                              <span className="text-sm font-medium">Pending Requests</span>
                           </div>
                           <span className="font-bold text-xl">{donations.filter(d => d.status === 'Pending').length}</span>
                        </div>
                     </div>
                  </div>

                  {/* SECTION 4: LIVE ALERTS */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex-1">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Live Alerts
                     </h3>
                     <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex flex-col gap-2">
                           <div className="flex items-start justify-between">
                              <span className="text-sm font-bold text-red-900 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> Food expiring in 30 mins</span>
                           </div>
                           <button onClick={() => navigate('/ngo/available')} className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-lg border border-red-200 self-start shadow-sm hover:bg-red-50 transition-colors">Accept Now</button>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
                           <div className="flex items-start justify-between">
                              <span className="text-sm font-bold text-amber-900 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Volunteer delayed</span>
                           </div>
                           <button className="text-xs font-bold bg-white text-amber-600 px-3 py-1.5 rounded-lg border border-amber-200 self-start shadow-sm hover:bg-amber-50 transition-colors">Reassign</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                  {/* SECTION 8: SYSTEM FLOW */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-center min-h-[250px]">
                     <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-widest text-center">Live System Flow</h3>
                     <div className="flex items-center justify-between relative px-4 sm:px-12">
                        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
                        {[
                           { status: 'Pending', count: donations.filter(d => d.status === 'Pending').length, color: 'bg-amber-100 text-amber-600', active: true },
                           { status: 'Accepted', count: donations.filter(d => d.status === 'Accepted').length, color: 'bg-blue-100 text-blue-600', active: true },
                           { status: 'Pickup', count: 1, color: 'bg-purple-100 text-purple-600', active: true },
                           { status: 'Delivered', count: donations.filter(d => d.status === 'Delivered').length, color: 'bg-emerald-100 text-emerald-600', active: true }
                        ].map((step, i) => (
                           <div key={i} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${step.color} shadow-sm border-4 border-white`}>
                                 {step.count}
                              </div>
                              <span className="text-xs font-bold text-slate-600 hidden sm:block">{step.status}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-8">
                  {/* SECTION 6: VOLUNTEER STATUS */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-4 w-4" /> Volunteer Status
                     </h3>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                           <span className="flex items-center gap-2 text-slate-600"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> Available</span>
                           <span className="font-bold text-slate-900">8</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="flex items-center gap-2 text-slate-600"><div className="h-2 w-2 rounded-full bg-blue-500"></div> On delivery</span>
                           <span className="font-bold text-slate-900">3</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="flex items-center gap-2 text-slate-600"><div className="h-2 w-2 rounded-full bg-amber-500"></div> Idle</span>
                           <span className="font-bold text-slate-900">2</span>
                        </div>
                     </div>
                  </div>

                  {/* SECTION 7: QUICK ACTIONS */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex-1">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Quick Actions</h3>
                     <div className="grid grid-cols-1 gap-2">
                        <button onClick={() => navigate('/ngo/available')} className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-bold rounded-xl transition-colors text-left flex items-center justify-between">
                           Accept nearest rescue <ArrowRight className="h-4 w-4" />
                        </button>
                        <button onClick={() => navigate('/ngo/available')} className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors text-left flex items-center justify-between">
                           View urgent tasks <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors text-left flex items-center justify-between">
                           Assign volunteer <ArrowRight className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* DASHBOARD VIEW (9 Sections) */}
        {isDashboard && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* SECTION 2: OVERVIEW METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Utensils} label="Meals Rescued" value={donations.filter(d => d.status === 'Accepted' || d.status === 'Delivered').length * 40} subtext="Total this month" color="bg-orange-500" />
              <StatCard icon={Truck} label="Active Missions" value={donations.filter(d => d.status === 'Accepted').length} subtext="Currently in progress" color="bg-blue-500" />
              <StatCard icon={Star} label="Impact Score" value="4.8/5" subtext="Community rating" color="bg-emerald-500" />
              <StatCard icon={Leaf} label="Carbon Saved" value="128 kg" subtext="Emissions prevented" color="bg-teal-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-8 space-y-6">
                  {/* SECTION 1: PRIORITY MISSIONS */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                           <AlertCircle className="h-5 w-5 text-red-500" /> Priority Missions
                        </h3>
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Action Required</span>
                     </div>
                     <div className="space-y-3">
                        {donations.filter(d => d.status === 'Pending').slice(0, 2).map((req) => (
                           <div key={req.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-orange-200 transition-colors">
                              <div className="flex gap-4 items-center">
                                 <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Utensils className="h-5 w-5" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <h4 className="font-bold text-slate-900">{req.foodType}</h4>
                                       <PriorityBadge priority={req.distance !== null && req.distance <= 3 ? 'High' : (req.distance !== null && req.distance <= 7 ? 'Medium' : 'Low')} />
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                       <span className="flex items-center gap-1 text-red-500 font-medium"><Clock className="h-3 w-3" /> {req.expiry}</span> •
                                       <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {req.distance !== null ? `${req.distance.toFixed(1)} km` : req.location}</span>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => handleAccept(req.id)} className="mt-3 sm:mt-0 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors w-full sm:w-auto">
                                 Accept / Assign
                              </button>
                           </div>
                        ))}
                        {donations.filter(d => d.status === 'Pending').length === 0 && (
                           <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl text-sm">No priority missions right now.</div>
                        )}
                     </div>
                  </div>

                  {/* SECTION 3: MISSION FLOW TRACKER */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest text-center">Mission Flow Tracker</h3>
                     <div className="flex items-center justify-between relative px-2 sm:px-8">
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
                        {[
                           { status: 'Pending', count: donations.filter(d => d.status === 'Pending').length, color: 'bg-slate-100 text-slate-600 border-slate-200' },
                           { status: 'Accepted', count: donations.filter(d => d.status === 'Accepted').length, color: 'bg-blue-100 text-blue-600 border-blue-200' },
                           { status: 'On the Way', count: 1, color: 'bg-amber-100 text-amber-600 border-amber-200' },
                           { status: 'Picked', count: 0, color: 'bg-purple-100 text-purple-600 border-purple-200' },
                           { status: 'Delivered', count: donations.filter(d => d.status === 'Delivered').length, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' }
                        ].map((step, i) => (
                           <div key={i} className="relative z-10 flex flex-col items-center gap-2 bg-white px-1 sm:px-2">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${step.color} shadow-sm border-2`}>
                                 {step.count}
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 hidden sm:block uppercase tracking-wider">{step.status}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* SECTION 7: OTP VERIFICATION & SECTION 8: ACTIVITY FEED */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck className="h-4 w-4 text-emerald-500" /> Pending Verifications
                        </h3>
                        <div className="space-y-3">
                           {donations.filter(d => d.status === 'Accepted').slice(0, 2).map(req => (
                              <div key={req.id} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col gap-3">
                                 <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-900">{req.foodType}</span>
                                    <span className="text-[10px] font-bold bg-white text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-200">Awaiting Pickup</span>
                                 </div>
                                 <button onClick={async () => {
                                      const otp = prompt('Enter the 4-digit Pickup OTP:');
                                      if (!otp) return;
                                      try { await api.post(`/donations/${req.id}/verify-pickup`, { otp }); alert('Verified!'); window.location.reload(); }
                                      catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
                                    }} 
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                 >
                                    Verify OTP
                                 </button>
                              </div>
                           ))}
                           {donations.filter(d => d.status === 'Accepted').length === 0 && (
                              <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-lg">No pending pickups requiring OTP.</p>
                           )}
                        </div>
                     </div>

                     <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                           <History className="h-4 w-4 text-blue-500" /> Activity Feed
                        </h3>
                        <div className="space-y-4">
                           <div className="flex gap-3">
                              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0"></div>
                              <div>
                                 <p className="text-sm text-slate-900 font-medium">Mission <span className="font-bold">#492</span> delivered successfully.</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">10 mins ago • Driver: Ravi</p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                              <div>
                                 <p className="text-sm text-slate-900 font-medium">Rescue accepted for <span className="font-bold">Bakery Items</span>.</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">25 mins ago • HQ</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  {/* SECTION 4: LIVE OPERATIONS */}
                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                     <h3 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-400" /> Live Operations
                     </h3>
                     <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/5">
                           <span className="text-xs font-medium text-slate-300">Active Pickups</span>
                           <span className="font-bold text-sm text-white">{donations.filter(d => d.status === 'Accepted').length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/5">
                           <span className="text-xs font-medium text-slate-300">Volunteers En Route</span>
                           <span className="font-bold text-sm text-white">1</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/5">
                           <span className="text-xs font-medium text-slate-300">Pending Missions</span>
                           <span className="font-bold text-sm text-white">{donations.filter(d => d.status === 'Pending').length}</span>
                        </div>
                     </div>
                  </div>

                  {/* SECTION 5: ALERTS & RISKS */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" /> Alerts & Risks
                     </h3>
                     <div className="space-y-2">
                        <div className="p-2.5 rounded-lg border-l-4 border-red-500 bg-red-50 text-red-900 text-xs font-bold flex justify-between items-center">
                           <span>Expiring food (30m)</span>
                           <button onClick={() => navigate('/ngo/available')} className="bg-white px-2 py-1 rounded shadow-sm border border-red-100">Review</button>
                        </div>
                        <div className="p-2.5 rounded-lg border-l-4 border-amber-500 bg-amber-50 text-amber-900 text-xs font-bold flex justify-between items-center">
                           <span>Pickup delayed</span>
                           <button className="bg-white px-2 py-1 rounded shadow-sm border border-amber-100">Contact</button>
                        </div>
                        <div className="p-2.5 rounded-lg border-l-4 border-orange-500 bg-orange-50 text-orange-900 text-xs font-bold flex justify-between items-center">
                           <span>No volunteer assigned</span>
                           <button className="bg-white px-2 py-1 rounded shadow-sm border border-orange-100">Assign</button>
                        </div>
                     </div>
                  </div>

                  {/* SECTION 6: ACTIVE DRIVERS */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" /> Active Drivers
                     </h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 border border-slate-100 rounded-xl bg-slate-50">
                           <div>
                              <p className="text-xs font-bold text-slate-900">Ravi K.</p>
                              <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Available • 1.2km away</p>
                           </div>
                           <button className="text-[10px] font-bold bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">Assign</button>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-slate-100 rounded-xl bg-slate-50">
                           <div>
                              <p className="text-xs font-bold text-slate-900">Amit S.</p>
                              <p className="text-[10px] text-amber-600 font-bold uppercase mt-0.5">On Delivery</p>
                           </div>
                           <button className="text-[10px] font-bold bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 cursor-not-allowed">Busy</button>
                        </div>
                     </div>
                  </div>

                  {/* SECTION 9: INSIGHTS */}
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
                     <h3 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Quick Insights
                     </h3>
                     <ul className="text-xs text-orange-800 space-y-2 font-medium">
                        <li className="flex items-start gap-2">
                           <div className="mt-0.5"><ArrowRight className="h-3 w-3" /></div>
                           Response time improved by 14% this week.
                        </li>
                        <li className="flex items-start gap-2">
                           <div className="mt-0.5"><ArrowRight className="h-3 w-3" /></div>
                           Peak rescue activity is currently between 8 PM - 10 PM.
                        </li>
                     </ul>
                  </div>

               </div>
            </div>
          </div>
        )}

        {/* AVAILABLE FEED VIEW */}
        {isAvailable && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
             {/* Header */}
             <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mission Control: Evaluation</h2>
                <p className="text-slate-500 font-medium text-sm">Analyze and accept high-impact food rescue opportunities.</p>
             </div>

             {/* Main Content Area */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: THE DECISION ENGINE (Recommended Request) */}
                <div className="lg:col-span-7 space-y-6">
                   {donations.filter(d => d.status === 'Pending').length > 0 ? (() => {
                      const topReq = donations.filter(d => d.status === 'Pending').sort((a,b) => (a.distance || 99) - (b.distance || 99))[0];
                      const matchScore = 92; // AI generated score
                      return (
                         <div className="bg-white rounded-3xl border-2 border-orange-500 shadow-xl overflow-hidden relative">
                            {/* Header / Match Score */}
                            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white relative">
                               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
                               <div className="flex justify-between items-start relative z-10">
                                  <div className="pr-4">
                                     <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold backdrop-blur-md mb-4 border border-white/20 uppercase tracking-widest shadow-sm">
                                        <Star className="h-3 w-3 text-yellow-300" fill="currentColor" /> AI Recommended
                                     </span>
                                     <h3 className="text-4xl font-black mb-2 tracking-tight">{topReq.foodType}</h3>
                                     <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-orange-50">
                                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-300" /> {topReq.donor?.name || 'Local Donor'} • {topReq.distance?.toFixed(1) || 'N/A'} km</span>
                                        <span className="flex items-center gap-1.5"><Utensils className="h-4 w-4 text-orange-300" /> {topReq.quantity}</span>
                                     </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                     <div className="inline-flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-2xl transform rotate-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Match Score</span>
                                        <span className="text-4xl font-black text-orange-600">{matchScore}%</span>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            {/* Body details */}
                            <div className="p-8 space-y-8">
                               {/* Key Insights Grid */}
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-red-50 rounded-2xl p-5 border border-red-100 flex flex-col gap-1 relative overflow-hidden">
                                     <div className="absolute -right-2 -bottom-2 opacity-5"><Clock className="w-16 h-16 text-red-500" /></div>
                                     <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Clock className="h-3 w-3" /> Urgency</span>
                                     <span className="text-xl font-black text-red-700">⏳ 38 mins left</span>
                                  </div>
                                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col gap-1 relative overflow-hidden">
                                     <div className="absolute -right-2 -bottom-2 opacity-5"><Users className="w-16 h-16 text-emerald-500" /></div>
                                     <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Users className="h-3 w-3" /> Impact Preview</span>
                                     <span className="text-xl font-black text-emerald-700">Feeds ~45 people</span>
                                  </div>
                               </div>

                               {/* Why Recommended & Capacity */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div>
                                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Brain className="h-3 w-3" /> Decision Logic
                                     </h4>
                                     <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                           <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check className="h-3 w-3" /></div>
                                           Closest active request to your HQ
                                        </li>
                                        <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                           <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check className="h-3 w-3" /></div>
                                           High urgency requires immediate pickup
                                        </li>
                                        <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                           <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check className="h-3 w-3" /></div>
                                           Fits your current transport capacity
                                        </li>
                                     </ul>
                                  </div>

                                  <div>
                                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Capacity Impact</h4>
                                     <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <div className="flex justify-between items-center mb-3">
                                           <span className="text-xs font-bold text-slate-500">Utilization</span>
                                           <span className="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm">80% → 95%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                                           <div className="h-full bg-slate-400 w-[80%]"></div>
                                           <div className="h-full bg-orange-500 w-[15%] relative overflow-hidden">
                                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {/* Map Preview */}
                               <div>
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Route Preview</h4>
                                  <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                                     <FoodFinderMap 
                                       ngoLat={user?.latitude} 
                                       ngoLon={user?.longitude} 
                                       radiusKm={5} 
                                       availableDonations={[topReq]} 
                                     />
                                     <div className="absolute inset-0 pointer-events-none shadow-inner"></div>
                                  </div>
                               </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                               <button onClick={() => {
                                   const reason = prompt('Reason for rejection?');
                                   if(reason) { /* alert logic */ alert('Rejected: ' + reason); }
                                 }} className="px-6 py-4 rounded-xl text-sm font-bold text-slate-500 border-2 border-slate-200 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 transition-colors sm:w-1/3 flex justify-center items-center gap-2">
                                  <X className="h-5 w-5" /> Reject
                               </button>
                               <VerificationGate role="ngo">
                                 <button onClick={() => handleAccept(topReq.id)} className="flex-1 px-6 py-4 rounded-xl text-sm font-bold text-white bg-orange-600 shadow-xl shadow-orange-500/30 hover:bg-orange-700 hover:shadow-orange-600/40 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" /> Accept Rescue
                                 </button>
                               </VerificationGate>
                            </div>
                         </div>
                      );
                   })() : (
                      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                         <div className="mx-auto h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 mb-2">No urgent decisions required</h3>
                         <p className="text-slate-500 font-medium">All nearby food rescues have been handled.</p>
                      </div>
                   )}
                </div>

                {/* RIGHT COLUMN: QUEUE & FILTERS */}
                <div className="lg:col-span-5 space-y-6">
                   {/* FILTER & SORT */}
                   <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex flex-wrap items-center gap-3">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5"><Filter className="h-3 w-3" /> Filters</span>
                         <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5 hover:bg-orange-100 transition-colors shadow-sm">
                            Distance <ChevronDown className="h-3 w-3" />
                         </button>
                         <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-sm">
                            Urgency <ChevronDown className="h-3 w-3" />
                         </button>
                         <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-sm">
                            Food Type <ChevronDown className="h-3 w-3" />
                         </button>
                      </div>
                   </div>

                   {/* SECONDARY REQUESTS LIST */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <List className="h-3 w-3" /> Other Opportunities
                      </h4>
                      {donations.filter(d => d.status === 'Pending').slice(1).map(req => (
                         <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity"><ArrowRight className="w-12 h-12 text-orange-600 -mt-2 -mr-2" /></div>
                            <div className="flex justify-between items-start relative z-10">
                               <div className="flex gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors border border-slate-100 group-hover:border-orange-100">
                                     <Utensils className="h-6 w-6" />
                                  </div>
                                  <div>
                                     <h5 className="font-bold text-slate-900 text-base">{req.foodType}</h5>
                                     <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1"><MapPin className="h-3 w-3" /> {req.donor?.name || 'Local Donor'} ({req.distance?.toFixed(1)} km)</p>
                                  </div>
                               </div>
                               <span className="text-xs font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">{req.quantity}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 relative z-10">
                               <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-red-100"><Clock className="h-3 w-3" /> {req.expiry} left</span>
                               <button onClick={(e) => { e.stopPropagation(); handleAccept(req.id); }} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 group-hover:underline">
                                  Review Details <ArrowRight className="h-3 w-3" />
                               </button>
                            </div>
                         </div>
                      ))}
                      {donations.filter(d => d.status === 'Pending').length <= 1 && (
                         <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl text-sm border border-slate-200 border-dashed flex flex-col items-center gap-3">
                            <Utensils className="h-8 w-8 text-slate-300" />
                            <span className="font-medium">No other pending requests.</span>
                         </div>
                      )}
                   </div>
                </div>

             </div>
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {isAnalytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Seasonal Analysis Card */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                       <Calendar className="h-5 w-5 text-orange-500" /> Seasonal Peak Trends
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Donation volume forecasting based on festival cycles.</p>
                  </div>
                  <div className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-100 italic">
                    Next Peak: Diwali (Oct)
                  </div>
                </div>
                
                <div className="h-[350px] w-full relative">
                  {isAiLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20 rounded-2xl">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ResQ Brain is thinking...</p>
                        </div>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData.length > 0 ? forecastData : seasonalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey={forecastData.length > 0 ? "day" : "month"} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fb923c' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={forecastData.length > 0 ? "predictedVolume" : "volume"} 
                        stroke="#f97316" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorVolume)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm"><TrendingUp className="h-5 w-5" /></div>
                  <p className="text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-900">Pro-Tip:</span> We predict a <span className="text-orange-600 font-bold">45% increase</span> in surplus during the upcoming wedding season (Nov-Dec).
                  </p>
                </div>
              </div>

              {/* Geospatial Heatmap Insights */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MapIcon className="h-5 w-5 text-blue-500" /> Waste Hotspots
                </h3>
                <p className="text-sm text-slate-500 mb-8">High-waste zones needing urgent volunteer deployment.</p>
                
                <div className="flex-1 min-h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                        data={wasteZoneData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={8}
                        cornerRadius={10}
                        dataKey="value"
                      >
                        {wasteZoneData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-black text-slate-900">45%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gachibowli Area</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {wasteZoneData.map((zone) => (
                    <div key={zone.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color }} />
                        <span className="text-sm font-bold text-slate-700">{zone.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{zone.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Deployment Recommendations */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
               <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
               <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                  <div className="lg:w-1/3">
                     <div className="h-16 w-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30">
                        <Users className="h-8 w-8 text-white" />
                     </div>
                     <h4 className="text-2xl font-bold mb-3">Strategic Action Plan</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Based on Gachibowli's 45% waste concentration, we recommend stationing 3 additional volunteers in this sector from <span className="text-orange-400 font-bold">7PM - 11PM</span>.</p>
                  </div>
                  <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                     <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer">
                        <h5 className="font-bold text-orange-400 mb-1">Recruit Local Drivers</h5>
                        <p className="text-xs text-slate-500">Targeting Madhapur residents for shorter pickup TAT.</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer">
                        <h5 className="font-bold text-orange-400 mb-1">Night-Shift Ready</h5>
                        <p className="text-xs text-slate-500">Corporate dinner surpluses peak late at night.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {isProfile && (
          <div className="w-full space-y-8 animate-in fade-in duration-700">
             {/* SECTION 1: ORGANIZATION HEADER & SECTION 2: TRUST SCORE */}
             <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-1000 rotate-12"><Building2 className="h-48 w-48" /></div>
                <div className="flex items-center gap-6 relative z-10">
                   <div className="h-24 w-24 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 text-4xl font-black shadow-inner border-2 border-white transform -rotate-3">
                      {user?.name?.[0] || 'N'}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{user?.name || 'NGO Organization'}</h2>
                      <div className="flex flex-wrap items-center gap-3">
                         <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm"><ShieldCheck className="h-3 w-3" /> Verified ResQ Partner</span>
                         <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">ID: UP/2023/04859</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 min-w-[250px] relative z-10 shadow-xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Star className="h-3 w-3 text-orange-400" fill="currentColor" /> Trust Score</span>
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">94%</span>
                   </div>
                   <span className="text-[10px] font-bold text-emerald-400 mt-2 tracking-widest uppercase">(Highly Reliable)</span>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   
                   {/* SECTION 3: CAPACITY USAGE */}
                   <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-orange-500" /> Real-Time Capacity</h3>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                         <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Daily Limit</span>
                            <span className="text-3xl font-black text-slate-900">500</span>
                         </div>
                         <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-2">Current Usage</span>
                            <span className="text-3xl font-black text-orange-700">420</span>
                         </div>
                         <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Remaining</span>
                            <span className="text-3xl font-black text-emerald-700">80</span>
                         </div>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                         <div className="h-full bg-orange-500 w-[84%] relative">
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                         </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-500">84% Utilized</span>
                         <button onClick={() => alert('Capacity increase request submitted to admin.')} className="text-orange-600 hover:text-orange-700 hover:underline transition-all">Request Capacity Increase</button>
                      </div>
                   </div>

                   {/* SECTION 4: OPERATIONAL SETTINGS */}
                   <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Settings className="h-5 w-5 text-slate-500" /> Operational Configuration</h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm">Rescue Radius</h4>
                               <p className="text-xs text-slate-500 mt-1">Maximum distance for automated alerts.</p>
                            </div>
                            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer hover:border-orange-200 transition-colors">
                               <option>3 km</option>
                               <option selected>5 km</option>
                               <option>10 km</option>
                            </select>
                         </div>
                         
                         <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm">Operating Hours</h4>
                               <p className="text-xs text-slate-500 mt-1">Time window for accepting new pickups.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                               <span className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">08:00 AM</span>
                               <span className="text-slate-400">-</span>
                               <span className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">10:00 PM</span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm">Auto-Accept Trusted Donors</h4>
                               <p className="text-xs text-slate-500 mt-1">Bypass manual review for 5-star rated donors.</p>
                            </div>
                            <button onClick={() => alert('Auto-accept rules updated.')} className="h-8 w-14 bg-orange-500 rounded-full relative shadow-inner transition-colors">
                               <div className="h-6 w-6 bg-white rounded-full absolute top-1 right-1 shadow-sm transition-transform"></div>
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* SECTION 6: TEAM MANAGEMENT */}
                   <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> Team Management</h3>
                         <button onClick={() => alert('Invite new member flow triggered.')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">+ Add Member</button>
                      </div>
                      <div className="space-y-3">
                         {[
                            {name: 'Rahul Sharma', role: 'Fleet Manager', status: 'Active', color: 'emerald'},
                            {name: 'Priya Desai', role: 'Volunteer Driver', status: 'On Duty', color: 'blue'},
                            {name: 'Arun Kumar', role: 'Facility Staff', status: 'Offline', color: 'slate'}
                         ].map((member, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm hover:shadow">
                               <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 border border-slate-200">
                                     {member.name[0]}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{member.role}</p>
                                  </div>
                               </div>
                               <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border bg-${member.color}-50 text-${member.color}-600 border-${member.color}-200 shadow-sm`}>
                                  {member.status}
                               </span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   {/* SECTION 5: COMPLIANCE STATUS */}
                   <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Compliance Status</h3>
                      <div className="space-y-4">
                         <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                            <div className="absolute -right-2 -bottom-2 opacity-10"><ShieldCheck className="w-16 h-16 text-emerald-600" /></div>
                            <div className="flex justify-between items-start mb-3 relative z-10">
                               <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> FSSAI License</h4>
                               <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-md shadow-sm border border-emerald-100">Valid</span>
                            </div>
                            <p className="text-[10px] font-black text-emerald-700/70 uppercase tracking-widest relative z-10">Expires in 1.5 Years</p>
                         </div>
                         <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 relative overflow-hidden">
                            <div className="absolute -right-2 -bottom-2 opacity-10"><AlertCircle className="w-16 h-16 text-amber-600" /></div>
                            <div className="flex justify-between items-start mb-3 relative z-10">
                               <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> 80G Registration</h4>
                               <span className="text-[10px] font-bold text-amber-700 bg-white px-2.5 py-1 rounded-md shadow-sm border border-amber-100">Action Needed</span>
                            </div>
                            <p className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest mb-4 relative z-10">Expires in 45 Days</p>
                            <button onClick={() => alert('Renewal request initiated. A platform agent will contact you.')} className="w-full py-2.5 bg-white rounded-xl text-xs font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm relative z-10">Initiate Renewal</button>
                         </div>
                      </div>
                   </div>

                   {/* SECTION 7: PERFORMANCE SUMMARY */}
                   <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
                      <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><TrendingUp className="h-4 w-4 text-orange-400" /> Performance Metrics</h3>
                      <div className="space-y-5 relative z-10">
                         <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-xs text-slate-400 font-medium">Avg Response Time</span>
                            <span className="text-lg font-black text-white tracking-tight">8.5 mins</span>
                         </div>
                         <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-xs text-slate-400 font-medium">Success Rate</span>
                            <span className="text-lg font-black text-emerald-400 tracking-tight">98.2%</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Delay Rate (&gt;15m)</span>
                            <span className="text-lg font-black text-amber-400 tracking-tight">1.8%</span>
                         </div>
                      </div>
                   </div>

                   {/* SECTION 8: ARCHIVES & REPORTS */}
                   <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><FileText className="h-5 w-5 text-slate-500" /> Archives & Reports</h3>
                      <div className="space-y-3">
                         <button onClick={() => alert('Downloading Monthly Impact Report...')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors group">
                            <div className="flex items-center gap-4">
                               <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-orange-600 transition-colors"><Download className="h-5 w-5" /></div>
                               <span className="font-bold text-sm text-slate-700">Monthly Impact Report</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                         </button>
                         <button onClick={() => alert('Opening Past Missions Log...')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors group">
                            <div className="flex items-center gap-4">
                               <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-orange-600 transition-colors"><History className="h-5 w-5" /></div>
                               <span className="font-bold text-sm text-slate-700">Past Missions Log</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                         </button>
                         <button onClick={() => alert('Opening System Audit Logs...')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors group">
                            <div className="flex items-center gap-4">
                               <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-orange-600 transition-colors"><ShieldCheck className="h-5 w-5" /></div>
                               <span className="font-bold text-sm text-slate-700">System Audit Logs</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                         </button>
                      </div>
                   </div>

                </div>
             </div>
          </div>
        )}

        {/* MAP VIEW */}
        {isMap && (
          <div className="space-y-6 w-full animate-in fade-in duration-700 h-[800px] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Live Operations Map</h2>
                <p className="text-slate-500 font-medium mt-1">Real-time tracking of active rescues and fleet positions.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
            </div>
            
            <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 relative bg-slate-50">
               <FoodFinderMap 
                   ngoLat={user?.latitude || 17.3850} 
                   ngoLon={user?.longitude || 78.4867} 
                   radiusKm={10} 
                   availableDonations={donations.filter(d => d.status === 'Pending' || d.status === 'Accepted')} 
               />
               
               <div className="absolute top-6 left-6 z-10 space-y-4">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 max-w-[250px]">
                     <h3 className="font-black text-slate-900 text-sm mb-3">Map Legend</h3>
                     <div className="space-y-2 text-xs font-bold text-slate-600">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Active Pickups</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> High Priority</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Fleet Vehicles</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default NGODashboard
