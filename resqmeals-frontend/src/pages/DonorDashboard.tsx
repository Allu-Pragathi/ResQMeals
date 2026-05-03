import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { Plus, Package, Clock, MapPin, Loader2, TrendingUp, User, Mail, Phone, BellRing, UserCog, Bot, Trophy, Zap, Bell, Sun, Moon, CheckCircle, AlertTriangle, Activity, ChevronRight, History, Heart, ShieldCheck, Timer, Leaf } from 'lucide-react'

import { LiveTrackingCard } from '../components/ui/live-tracker'
import { SignInCard } from '../components/ui/travel-connect-signin'
import { Gallery4 } from '../components/ui/gallery4'
import ProfileVerificationCenter from '../components/ProfileVerificationCenter'
import VerificationGate from '../components/VerificationGate'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { NGOFinder } from '../components/ui/NGOFinder'
import DonorAnalytics from '../components/DonorAnalytics'
import CommunityLeaderboard from '../components/CommunityLeaderboard'
import SmartDonationView from '../components/SmartDonationView'
import RescueMap from '../components/RescueMap'
import DonorProfile from '../components/DonorProfile'
import { useSocket } from '../contexts/SocketContext'

type Donation = {
  id: string
  foodType: string
  quantity: string
  expiry: string
  location: string
  status: string
  pickupOtp?: string
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { socket, notifications, isConnected } = useSocket()
  const [showNotifications, setShowNotifications] = useState(false)
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    unit: 'Kgs',
    category: 'Veg',
    expiry: '',
    location: '',
    radius: 5
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [matchedNgo, setMatchedNgo] = useState<any>(null)
  const [isMatching, setIsMatching] = useState(false)

  const [user, setUser] = useState<{ name: string; address: string; email?: string; phone?: string; latitude?: number; longitude?: number } | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    password: ''
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Load user and donations
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('resqmeals_current_user')
      if (currentUser && currentUser !== 'undefined') {
        const parsedUser = JSON.parse(currentUser)
        setUser(parsedUser)
        setFormData(prev => ({ ...prev, location: parsedUser.address || '' }))
        setEditProfileData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          address: parsedUser.address || '',
          phone: parsedUser.phone || '+91 98765 43210',
          password: ''
        })
      }
    } catch (e) {
      console.error('Failed to parse user', e)
    }

    const fetchMyDonations = async () => {
      try {
        const res = await api.get('/donations/me')
        setDonations(res.data.donations)
      } catch (err) {
        console.error('Failed to fetch donations from server', err)
      }
    }

    fetchMyDonations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Socket.io Integration
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data: { id: string, status: string }) => {
      setDonations(prev => prev.map(d => d.id === data.id ? { ...d, status: data.status } : d));
    };

    socket.on('status:updated', handleStatusUpdate);

    return () => {
      socket.off('status:updated', handleStatusUpdate);
    };
  }, [socket]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await api.post('/donations', formData)

      // The backend returns the full newly inserted donation object
      const newDonation = response.data.donation
      setDonations(prev => [newDonation, ...prev])

      // Reset form
      setFormData({ 
        foodType: '', 
        quantity: '', 
        unit: 'Kgs',
        category: 'Veg',
        expiry: '', 
        location: user?.address || '',
        radius: 5
      })

      // AI Matching Task
      fetchAiMatch(newDonation.id)
    } catch (err) {
      console.error('Failed to publish donation', err)
      alert('Failed to publish. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchAiMatch = async (id: string) => {
    try {
        setIsMatching(true);
        const res = await api.get(`/donations/ml/match/${id}`);
        if (res.data.matches && res.data.matches.length > 0) {
            setMatchedNgo(res.data.matches[0]);
        }
    } catch (err) {
        console.error('AI Matching failed', err);
    } finally {
        setIsMatching(false);
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
      alert('Profile updated successfully!')
    } catch (err: any) {
      console.error('Failed to update profile', err)
      const errorMsg = err.response?.data?.error || 'Failed to update profile. Please try again.'
      alert(errorMsg)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const location = useLocation()
  const navigate = useNavigate()
  const isProfile = location.pathname.includes('profile')
  const isDonations = location.pathname.includes('donations')
  const isHome = location.pathname.includes('home')
  const isMap = location.pathname.includes('map')
  const isAnalytics = location.pathname.includes('analytics')
  const isDashboard = !isProfile && !isDonations && !isHome && !isMap && !isAnalytics

  // Dynamic metrics calculation
  const totalMealsRescuedTemp = donations.reduce((acc, curr) => {
    const num = parseInt(curr.quantity.replace(/\D/g, ''))
    return acc + (isNaN(num) ? 40 : num) 
  }, 0)
  
  const totalMealsRescued = totalMealsRescuedTemp > 0 ? totalMealsRescuedTemp : 0
  
  let currentTier = 'Bronze'
  let nextTier = 'Silver'
  let targetMeals = 500
  let tierLevel = 1
  
  if (totalMealsRescued >= 2000) {
    currentTier = 'Platinum'
    nextTier = 'Diamond'
    targetMeals = 5000
    tierLevel = 4
  } else if (totalMealsRescued >= 1000) {
    currentTier = 'Gold'
    nextTier = 'Platinum'
    targetMeals = 2000
    tierLevel = 3
  } else if (totalMealsRescued >= 500) {
    currentTier = 'Silver'
    nextTier = 'Gold'
    targetMeals = 1000
    tierLevel = 2
  }
  
  const progressPercent = Math.min(100, Math.round((totalMealsRescued / targetMeals) * 100))

  return (
    <div className={`space-y-8 w-full transition-all duration-700 min-h-screen -m-8 p-8 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- ACCESSIBLE HEADER --- */}
      <header className={`flex flex-col gap-8 md:flex-row md:items-center md:justify-between py-10 transition-all duration-700 border-b ${isDarkMode ? 'border-slate-800 mb-12' : 'border-slate-200 mb-12 bg-white/50 backdrop-blur-xl -mx-8 px-8 rounded-b-[3rem]'}`}>

        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-2">
             <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-400">
                Verified_Donor // {user?.name || 'Partner'}
             </span>
          </div>
          <h1 className={`text-3xl font-bold tracking-tight transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {isHome && `Welcome Back, ${user?.name || 'Donor'}!`}
            {isDashboard && 'Command Center'}
            {isDonations && 'Mission Planning'}
            {isProfile && 'Identity Settings'}
            {isAnalytics && 'Impact Intelligence'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isHome && 'Ready to save lives today? Explore your mission control below.'}
            {isDashboard && 'Overview of your rescue operations and impact.'}
            {isDonations && 'Manage your active food donations and missions.'}
            {isProfile && 'Manage your registration and operational details.'}
            {isAnalytics && 'Data-driven insights for strategic mobilization.'}
          </p>
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-4">

           <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-4 rounded-2xl border transition-all relative group ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white/70 backdrop-blur-2xl border-white/60 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                >
                  <Bell className="w-6 h-6 group-hover:rotate-[15deg] transition-transform" />
                  {notifications.length > 0 && <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`absolute right-0 mt-4 w-80 rounded-3xl shadow-2xl p-6 z-[100] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                  >
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h4 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>NOTIFICATIONS</h4>
                      {notifications.length > 0 && <span className="text-[10px] font-black text-orange-500">{notifications.length} NEW</span>}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {notifications.length === 0 ? (
                         <div className="text-center py-8 text-xs text-slate-400 font-bold uppercase tracking-widest">System Clear</div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl text-[11px] font-bold border transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-orange-50'}`}>
                            {notif.message}
                            <p className="text-[9px] font-medium text-slate-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(notif.timestamp).toLocaleTimeString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => {
                  const newMode = !isDarkMode;
                  setIsDarkMode(newMode);
                  if (newMode) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }}
                className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white/70 backdrop-blur-2xl border-white/60 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
              >
                {isDarkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
              </button>

              {isDonations && (
                <button
                  onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden sm:flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  New_Mission
                </button>
              )}
           </div>
        </div>
      </header>

      {/* 🌟 IMMERSIVE HOME VIEW */}
      {isHome && (
        <section className="space-y-12 pb-24 relative">
          
          {/* Animated Background Mesh for Home */}
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[3rem] opacity-50">
            <div className={`absolute top-0 left-0 w-full h-[600px] blur-3xl ${isDarkMode ? 'bg-orange-950/20' : 'bg-gradient-to-br from-orange-100 via-amber-50 to-rose-50'}`}></div>
          </div>

          <div className="relative rounded-[3rem] overflow-hidden group min-h-[450px] flex items-center p-12 lg:p-20 shadow-2xl transition-all duration-500 hover:shadow-orange-500/10">
            <div className="absolute inset-0 z-0">
               <img 
                 src="https://images.unsplash.com/photo-1593113565214-80afcb4a4771?q=80&w=2000&auto=format&fit=crop" 
                 alt="Community sharing" 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
               <div className="absolute inset-0 bg-orange-900/20 mix-blend-overlay"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                 <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                 <span className="text-xs font-bold text-white uppercase tracking-widest">Live Network Active</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8 drop-shadow-lg">
                Your surplus,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">someone's feast.</span>
              </h2>
              
              <p className="text-slate-200 text-xl font-medium leading-relaxed max-w-xl mb-12">
                Join 1,200+ donors making a real impact today. There are currently 5 urgent food requests in your area.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={() => navigate('/donor/donations')}
                    className="bg-orange-500 text-white px-10 py-5 rounded-2xl text-lg font-black tracking-wide hover:bg-orange-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 group"
                  >
                    <Package className="w-6 h-6 transition-transform group-hover:-translate-y-1" />
                    Donate Now
                  </button>
                <button 
                  onClick={() => navigate('/donor/dashboard')}
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                >
                  <Activity className="w-6 h-6" />
                  Command Center
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
                { title: "Meals Provided", value: totalMealsRescued.toLocaleString(), suffix: "meals", icon: "🍲", color: "from-orange-500 to-amber-400" },
                { title: "CO2 Emissions Saved", value: "340", suffix: "kg", icon: "🌱", color: "from-emerald-500 to-teal-400" },
                { title: "Community Rank", value: `Top ${Math.max(1, 10 - tierLevel)}%`, suffix: "donor", icon: "🏆", color: "from-blue-500 to-indigo-400" }
             ].map((stat, idx) => (
                <motion.div 
                   key={idx}
                   whileHover={{ y: -10, scale: 1.02 }}
                   className={`relative overflow-hidden rounded-[2.5rem] p-8 shadow-xl border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                >
                   <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10`}></div>
                   <div className="text-4xl mb-6">{stat.icon}</div>
                   <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{stat.title}</h4>
                   <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                      <span className="text-lg font-bold text-slate-500">{stat.suffix}</span>
                   </div>
                </motion.div>
             ))}
          </div>

          <div className={`rounded-[3rem] p-12 relative overflow-hidden shadow-2xl transition-colors ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-950 text-white'}`}>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative z-10">
                <div>
                   <h3 className="text-3xl font-black mb-2">Live Community Impact</h3>
                   <p className="text-slate-400 font-medium">Real-time updates from your local area</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {[
                   { ngo: "Hope Foundation", action: "picked up 20 meals", time: "Just now", icon: <CheckCircle className="text-emerald-400" /> },
                   { ngo: "Helping Hands", action: "requested fresh produce", time: "10 mins ago", icon: <Bell className="text-amber-400" /> },
                   { ngo: "Food for All", action: "delivered your donation", time: "1 hour ago", icon: <MapPin className="text-blue-400" /> }
                ].map((feed, idx) => (
                   <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-white/10 rounded-xl">
                            {feed.icon}
                         </div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{feed.time}</span>
                      </div>
                      <p className="text-lg font-medium leading-tight">
                         <span className="font-black text-white">{feed.ngo}</span> {feed.action}
                      </p>
                   </div>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* 📊 DASHBOARD VIEW - ADVANCED OPERATIONAL CONTROL */}
      {isDashboard && (
        <section className="space-y-10 pb-32 -mx-2 md:-mx-6 px-2 md:px-6 pt-10 min-h-screen">
          
          {/* Header Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Active_Missions", val: donations.filter(d => ['Pending', 'Accepted'].includes(d.status)).length, icon: Activity, color: "text-emerald-400", trend: "+12%" },
              { label: "Community_Reach", val: "4.2k", icon: Heart, color: "text-rose-400", trend: "+5.4%" },
              { label: "Network_Nodes", val: "128", icon: Zap, color: "text-blue-400", trend: "Stable" },
              { label: "System_Health", val: "99.9%", icon: ShieldCheck, color: "text-emerald-500", trend: "Optimal" }
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`backdrop-blur-xl border p-6 rounded-[2rem] transition-all group ${isDarkMode ? 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700' : 'bg-white/60 border-slate-200 hover:border-orange-200 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} ${stat.color}`}>
                        <StatIcon className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.trend}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.val}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-8">
              <div className={`flex items-center justify-between border-b pb-6 ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
                 <div>
                    <h3 className={`text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                       Live_Operations_Pipeline
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">Real-time telemetry from active food rescue units.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {donations.filter(d => ['Pending', 'Accepted', 'On The Way'].includes(d.status)).length === 0 ? (
                  <div className={`relative border-2 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-white/50'}`}>
                       <div className={`h-20 w-20 rounded-full border flex items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                          <Package className="w-8 h-8 text-slate-400" />
                       </div>
                       <h4 className={`text-lg font-black mb-2 uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Active Missions</h4>
                       <button 
                         onClick={() => navigate('/donor/donations')}
                         className="mt-8 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                       >
                          Start_New_Mission
                       </button>
                  </div>
                ) : (
                  donations.filter(d => ['Pending', 'Accepted', 'On The Way'].includes(d.status)).map((item, i) => (
                  <motion.div 
                    key={item.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`backdrop-blur-md border rounded-3xl p-6 flex items-center justify-between transition-all border-l-4 border-l-orange-500 ${isDarkMode ? 'bg-slate-900/30 border-slate-800/50 hover:bg-slate-900/60' : 'bg-white border-slate-100 hover:border-orange-200 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-8">
                       <div className="relative">
                          <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                             <img 
                               src={`https://api.dicebear.com/7.x/shapes/svg?seed=${item.foodType}&backgroundColor=0f172a`} 
                               alt="Asset" 
                               className="w-10 h-10 opacity-60"
                             />
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <span className="text-[9px] font-black bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest">
                                {item.status}
                             </span>
                             <span className="text-[9px] font-mono text-slate-500">ID: {item.id?.slice(-8) || 'UNIT-04'}</span>
                          </div>
                          <p className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.foodType}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {item.location}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-10">
                       <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Payload_Mass</p>
                          <p className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Expiration_Clock</p>
                          <p className="text-lg font-black text-red-500 flex items-center gap-2 justify-end">
                             <Timer className="w-4 h-4" /> {item.expiry || '2h'}
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className={`border-b pb-6 ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
                 <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    System_Intelligence
                 </h3>
                 <p className="text-[10px] font-mono text-slate-500 mt-2">AI-driven diagnostics & predictive mapping.</p>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "NGO_RESP_TIME", val: "8.4m", icon: Clock, color: "text-emerald-400" },
                      { label: "LOGISTIC_EFFICIENCY", val: "94%", icon: Zap, color: "text-blue-400" },
                      { label: "WASTE_PREVENTION", val: "1.2t", icon: Leaf, color: "text-orange-400" }
                    ].map((metric, i) => {
                       const MetricIcon = metric.icon;
                       return (
                         <div key={i} className={`backdrop-blur-md border p-6 rounded-[2rem] transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-orange-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-4">
                                  <MetricIcon className={`w-5 h-5 ${metric.color}`} />
                                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">{metric.label}</span>
                               </div>
                               <span className={`font-mono text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{metric.val}</span>
                            </div>
                         </div>
                       );
                    })}
                 </div>

                 <div className={`rounded-[2.5rem] p-8 relative overflow-hidden group border ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-slate-950 border-slate-900'}`}>
                    <div className="flex items-center gap-3 text-orange-500 mb-6">
                       <Bot className="w-5 h-5" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI_Core_Advisory</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                       "Pattern analysis detects a high-impact donation window in your vicinity. Coordination with **Hope Fnd.** could reduce pickup latency by **12%**."
                    </p>
                 </div>
              </div>
            </div>
          </div>

          <div className={`mt-12 border rounded-[3rem] p-10 transition-colors ${isDarkMode ? 'bg-slate-900/30 border-slate-800/50' : 'bg-white border-slate-200 shadow-xl'}`}>
             <div className="flex items-center justify-between mb-8">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   Cumulative Operational Impact
                </h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: "Total Operations", count: "128", sub: "missions" },
                 { label: "People Served", count: "4.2k", sub: "individuals" },
                 { label: "CO2 Saved", count: "850", sub: "kilograms" },
                 { label: "Relief Value", count: "$12.4k", sub: "estimated" }
               ].map((step, i) => (
                 <div key={i} className="relative">
                    <p className="text-sm font-medium text-slate-500 mb-2">{step.label}</p>
                    <div className="flex items-baseline gap-2">
                       <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{step.count}</p>
                       <p className="text-xs text-slate-400 font-medium uppercase">{step.sub}</p>
                    </div>
                    {i < 3 && <div className={`hidden md:block absolute top-1/2 -right-4 h-8 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>}
                 </div>
               ))}
             </div>
          </div>

        </section>
      )}

      {isAnalytics && <DonorAnalytics donations={donations} isDarkMode={isDarkMode} />}
      
      {isDonations && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
           <SmartDonationView 
             user={user} 
             donations={donations} 
             onAddDonation={(don) => setDonations(prev => [don, ...prev])} 
           />
        </motion.div>
      )}

      {isProfile && (
        <DonorProfile 
           user={user} 
           isEditingProfile={isEditingProfile}
           setIsEditingProfile={setIsEditingProfile}
           editProfileData={editProfileData}
           setEditProfileData={setEditProfileData}
           isUpdatingProfile={isUpdatingProfile}
           handleProfileUpdate={handleProfileUpdate}
        />
      )}

      {isMap && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
           <RescueMap user={user} />
        </motion.section>
      )}
    </div>
  )
}

export default DonorDashboard
