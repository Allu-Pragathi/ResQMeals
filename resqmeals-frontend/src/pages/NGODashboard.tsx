import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Clock, MapPin,
  Utensils, Users, Truck, AlertCircle, Leaf, ShieldCheck,
  Building2, Mail, Phone, Heart, History, Star, HandHeart, Bell,
  TrendingUp, Map as MapIcon, Calendar, Loader2,
  ArrowRight, BarChart3, LayoutDashboard, UserCog
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
  const isDashboard = !isProfile && !isAvailable && !isAnalytics && !isHome

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

        {/* HOME VIEW */}
        {isHome && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-4 backdrop-blur-md border border-white/10 uppercase tracking-widest">
                    NGO Hub • {user?.name}
                  </span>
                  <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight max-w-2xl">
                    Empowering Communities, <br /> One Rescue at a Time.
                  </h2>
                  <p className="text-orange-100 max-w-xl text-lg mb-10 leading-relaxed font-medium">
                    Welcome to your mission control. Coordinate pickups, track impact, and manage your organization&apos;s food rescue operations seamlessly.
                  </p>
                  
                  {/* Inline Hero Alert */}
                  {donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 5).length > 0 && (
                    <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md animate-pulse">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                      <p className="text-xs font-bold">{donations.filter(d => d.status === 'Pending' && d.distance !== null && d.distance <= 5).length} missions within 5km</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate('/ngo/available')}
                      className="bg-white text-orange-700 font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-orange-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
                    >
                      Browse Available Food
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate('/ngo')}
                      className="bg-white/10 text-white font-black px-8 py-4 rounded-2xl shadow-md hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      View Performance Metrics
                    </button>
                  </div>
               </div>
               {/* Decorative floating elements */}
               <div className="absolute top-0 right-0 -mt-20 -mr-20 bg-white/10 w-96 h-96 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000"></div>
               <div className="absolute bottom-10 right-20 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 hidden lg:block">
                  <HandHeart className="w-64 h-64" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-12">
               {/* Impact Stats Card */}
               <div className="md:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                           <TrendingUp className="h-5 w-5 text-orange-500" /> Operational Efficiency
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Your organization&apos;s performance this month.</p>
                     </div>
                     <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">+18% Efficiency</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:border-orange-100 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg. Response</p>
                        <p className="text-3xl font-black text-slate-900">14m</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Faster than 80% NGOs</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:border-orange-100 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rescue Ratio</p>
                        <p className="text-3xl font-black text-slate-900">92%</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Successfully Delivered</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:border-emerald-100 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reliability</p>
                        <p className="text-3xl font-black text-slate-900">4.9</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Donor Rating</p>
                     </div>
                  </div>
               </div>

               {/* Notifications/Alerts */}
               <div className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                     <Bell className="h-5 w-5 text-orange-400 animate-pulse" /> Live Alerts
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                       <p className="text-xs font-bold text-orange-400 uppercase mb-1">Nearby Rescue</p>
                       <p className="text-sm font-medium">Bakery surplus available 2.4km away.</p>
                       <p className="text-[10px] text-slate-400 mt-2">Expires in 45m</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm opacity-60">
                       <p className="text-xs font-bold text-orange-400 uppercase mb-1">System Update</p>
                       <p className="text-sm font-medium">New intelligence dashboard is now live.</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 bg-orange-500/20 w-40 h-40 rounded-full blur-3xl"></div>
               </div>

               {/* Quick Action Links */}
               <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { title: 'Rescue Feed', desc: 'Find available food', path: '/ngo/available', icon: HandHeart, color: 'bg-orange-500' },
                   { title: 'Dashboard', desc: 'Detailed analytics', path: '/ngo', icon: BarChart3, color: 'bg-orange-500' },
                   { title: 'Intelligence', desc: 'Predictive insights', path: '/ngo/analytics', icon: TrendingUp, color: 'bg-emerald-500' },
                   { title: 'Settings', desc: 'Privacy & Security', path: '/ngo/profile', icon: UserCog, color: 'bg-slate-700' }
                 ].map((item, i) => (
                   <div 
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group"
                   >
                     <div className={`h-14 w-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-7 h-7" />
                     </div>
                     <h4 className="font-extrabold text-slate-900 text-lg mb-1">{item.title}</h4>
                     <p className="text-slate-500 text-sm">{item.desc}</p>
                   </div>
                 ))}
               </div>
            </div>
          </section>
        )}


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
                      <div key={req.id} className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4">
                            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                              <Utensils className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{req.foodType}</p>
                              <p className="text-xs text-slate-500">{req.donor?.name || 'Private Donor'}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">Accepted</span>
                        </div>
                        <button
                          onClick={async () => {
                            const otp = prompt('Enter the 4-digit Pickup OTP from the donor:');
                            if (!otp) return;
                            try {
                              const res = await api.post(`/donations/${req.id}/verify-pickup`, { otp });
                              alert(res.data.message);
                              window.location.reload(); // Quick refresh to update status
                            } catch (err: any) {
                              alert(err.response?.data?.error || 'Verification failed');
                            }
                          }}
                          className="w-full py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                        >
                          Verify Pickup (Enter OTP)
                        </button>
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
                    <button 
                      onClick={() => setFilterNearby(true)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filterNearby ? 'bg-orange-50 text-orange-700' : 'text-slate-500'}`}
                    >
                      Nearby
                    </button>
                    <button 
                      onClick={() => setFilterNearby(false)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${!filterNearby ? 'bg-orange-50 text-orange-700' : 'text-slate-500'}`}
                    >
                      All Requests
                    </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : donations.filter(d => d.status === 'Pending' && (!filterNearby || (d.distance !== null && d.distance <= 5))).length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Utensils className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">{filterNearby ? 'No pending donations within 5km.' : 'No pending donations in your area.'}</p>
                    <p className="text-xs text-slate-400 mt-1">We&apos;ll notify you when new surplus is listed.</p>
                  </div>
                ) : (
                  donations.filter(d => d.status === 'Pending' && (!filterNearby || (d.distance !== null && d.distance <= 5))).map((req) => (
                    <RequestCard key={req.id} req={req} onAccept={handleAccept} />
                  ))
                )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-0 relative z-10">
                  <h3 className="font-bold text-slate-900 mb-4">Rescue Zones</h3>
                  <div className="mb-4">
                     <FoodFinderMap 
                       ngoLat={user?.latitude} 
                       ngoLon={user?.longitude} 
                       radiusKm={5} 
                       availableDonations={donations.filter(d => d.status === 'Pending' && (!filterNearby || (d.distance !== null && d.distance <= 5)))} 
                     />
                  </div>
                  <p className="text-xs text-slate-500 mb-4">You are currently monitoring a <span className="font-bold text-orange-600">5km radius</span> for food rescue missions.</p>
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
          <div className="space-y-8 w-full animate-in fade-in duration-700">
             <div className="mb-0">
                <ProfileVerificationCenter />
             </div>
             <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-in slide-in-from-bottom-5 duration-500">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:rotate-6"><Building2 className="h-48 w-48" /></div>
                   
                   <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 relative z-10">
                      <div className="h-24 w-24 bg-orange-100 rounded-[2rem] flex items-center justify-center text-orange-600 text-4xl font-black rotate-3 shadow-orange-100/50 shadow-xl border-4 border-white">
                         {user?.name?.[0] || 'N'}
                      </div>
                      <div className="text-center sm:text-left">
                         <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">{user?.name}</h2>
                         <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 italic"><Building2 className="h-3 w-3" /> DARPAN: UP/2023/04859</span>
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-100/20"><ShieldCheck className="h-3 w-3" /> Verified Partner</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Organization Nomenclature</label>
                         <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                disabled={!isEditingProfile}
                                value={editProfileData.name}
                                onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-slate-800 disabled:opacity-60"
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Communication Channel</label>
                         <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                disabled={!isEditingProfile}
                                value={editProfileData.email}
                                type="email"
                                onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-slate-800 disabled:opacity-60"
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Emergency Dispatch</label>
                         <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                disabled={!isEditingProfile}
                                value={editProfileData.phone}
                                onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-slate-800 disabled:opacity-60"
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Operational Vicinity</label>
                         <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                disabled={!isEditingProfile}
                                value={editProfileData.address}
                                onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-slate-800 disabled:opacity-60"
                            />
                         </div>
                      </div>

                      {isEditingProfile && (
                        <div className="space-y-3 md:col-span-2 animate-in slide-in-from-top-2 duration-300">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Security Redirection (New Password)</label>
                           <input 
                                type="password" 
                                placeholder="Target new encryption key"
                                value={editProfileData.password}
                                onChange={(e) => setEditProfileData({...editProfileData, password: e.target.value})}
                                className="w-full px-5 py-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-slate-800"
                           />
                        </div>
                      )}
                   </div>

                   <div className="mt-12 pt-10 border-t border-slate-100 flex justify-end gap-4 relative z-10">
                      {isEditingProfile && (
                        <button 
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/30 hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-75"
                        >
                            {isUpdatingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing Changes...</> : 'Save Institutional Data'}
                        </button>
                      )}
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                   <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                       <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="h-10 w-10 text-orange-400" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h4 className="text-2xl font-black mb-2 tracking-tight">System Compliance Hub</h4>
                          <p className="text-slate-400 text-sm leading-relaxed max-w-md italic">Your legal 80G and 12A certifications are cryptographically verified until June 2027.</p>
                       </div>
                       <button 
                         type="button" 
                         onClick={() => alert('Viewing credentials... Secure Vault Access Enabled.')}
                         className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-lg shadow-white/5 active:scale-95"
                       >
                         View Credentials
                       </button>
                    </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-orange-500" /> Operational Config
                   </h3>
                   <div className="space-y-4">
                      <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-orange-100 transition-all group">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-orange-500">Rescue Radius</p>
                         <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">5.0</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Kilometers</span>
                         </div>
                      </div>
                      <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-orange-100 transition-all group">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-orange-500">Daily Capacity</p>
                         <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">500</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Meals / Day</span>
                         </div>
                      </div>
                   </div>
                   <button 
                    type="button" 
                    onClick={() => alert('Logistics config updated successfully!')}
                    className="w-full mt-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                   >
                    Update Infrastructure
                   </button>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700"><History className="h-24 w-24" /></div>
                   <h4 className="text-lg font-black mb-2 tracking-tight">Rescue Archives</h4>
                   <p className="text-orange-100/70 text-[10px] font-medium mb-8 leading-relaxed">Secure audit trails for all mission-critical food rescues in fiscal year 2024.</p>
                   <button 
                    type="button" 
                    onClick={() => alert('Compiling digital history... Safe storage protocol active.')}
                    className="w-full py-4 bg-white/20 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all border border-white/10 active:scale-95"
                   >
                    Digital Archives Export
                   </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default NGODashboard
