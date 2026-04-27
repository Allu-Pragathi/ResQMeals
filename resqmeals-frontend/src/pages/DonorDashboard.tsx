import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { Plus, Package, Clock, MapPin, Loader2, TrendingUp, User, Mail, Phone, BellRing, UserCog, Bot, Trophy, Zap, Bell, Sun, Moon, CheckCircle, AlertTriangle, Activity, ChevronRight, History } from 'lucide-react'
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
  const isMap = location.pathname.includes('map')
  const isAnalytics = location.pathname.includes('analytics')
  const isDashboard = !isProfile && !isDonations && !isHome && !isMap && !isAnalytics

  // Dynamic metrics calculation
  const totalMealsRescuedTemp = donations.reduce((acc, curr) => {
    const num = parseInt(curr.quantity.replace(/\D/g, ''))
    return acc + (isNaN(num) ? 40 : num) // Fallback to 40 meals per donation if no number parsing works
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

  const typeCounts = donations.reduce((acc, curr) => {
    acc[curr.foodType] = (acc[curr.foodType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topDonationKeys = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
  const mostFrequentDonation = topDonationKeys.length > 0 ? topDonationKeys[0][0] : 'Fresh Produce'

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between py-6">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-3">
             <div className="h-2 w-8 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
             <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                Donor Portal • Welcome, {user?.name || 'Hero'}
             </p>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {isHome && `Dashboard Overview`}
            {isDashboard && 'Stats & Activity'}
            {isDonations && 'My Donations'}
            {isProfile && 'Profile Settings'}
            {isAnalytics && 'My Impact'}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-xl font-medium leading-relaxed">
            {isHome && 'Get a quick overview of your impact and current status.'}
            {isDashboard && 'A simple overview of your food rescue activity and community impact.'}
            {isDonations && 'List your extra food here. We will help you find a nearby NGO to pick it up.'}
            {isProfile && 'Manage your account information and how we contact you.'}
            {isAnalytics && 'See a detailed breakdown of the food and CO2 you have saved.'}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 self-start md:self-auto"
        >
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-4 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60 border border-slate-100 shadow-sm text-slate-600 hover:bg-slate-50 transition-all relative group"
            >
              <Bell className="w-6 h-6 group-hover:rotate-[15deg] transition-transform" />
              {notifications.length > 0 && <span className="absolute top-3 right-3 h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
            </button>
            
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-[100]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-slate-900">Notifications</h4>
                  {notifications.length > 0 && <span className="text-[10px] font-bold text-slate-400">{notifications.length} new</span>}
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                     <div className="text-center py-4 text-sm text-slate-500 font-medium">No new notifications</div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-xl text-xs font-bold text-slate-700 border border-orange-100/50">
                        {notif.message}
                        <p className="text-[9px] font-medium text-slate-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-4 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60 border border-slate-100 shadow-sm text-slate-600 hover:bg-slate-50 transition-all group"
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
          </button>

          {isDonations && (
            <div className="hidden sm:flex gap-4">
              <button
                onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-6 h-6" />
                New Donation
              </button>
            </div>
          )}
        </motion.div>
      </header>

      {/* HOME VIEW - REFINED */}
      {isHome && (
        <section className="space-y-16 pb-24">
          
          {/* 🔶 SECTION 1: HERO (TOP BANNER) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[3.5rem] p-10 md:p-16 overflow-hidden shadow-2xl group min-h-[350px] flex items-center bg-orange-600"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/70 backdrop-blur-2xl border-white/60/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>
            </div>
            
            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                  Ready to make <br />a difference?
                </h2>
                
                <p className="text-white/90 text-xl font-medium leading-relaxed max-w-xl">
                  There are 3 nearby food donations waiting to be rescued. Join our premium network and help us fight hunger.
                </p>
              </div>
              
              <div className="flex shrink-0">
                <button 
                  onClick={() => navigate('/donor/donations')}
                  className="bg-white/70 backdrop-blur-2xl border-white/60 text-orange-600 px-12 py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1.5 active:scale-95 flex items-center gap-4 shadow-xl group"
                >
                  Post Surplus Food
                  <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 🧠 SECTION 2: RECOMMENDED ACTION (AI-DRIVEN CARD) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6">
                 <div className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <Bot className="w-4 h-4" /> ResQ AI Recommended
                 </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Urgent Opportunity</h3>

              <div className="space-y-8">
                 <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-orange-50 border border-orange-100">
                    <div className="h-20 w-20 rounded-3xl bg-white/70 backdrop-blur-2xl border-white/60 shadow-md flex items-center justify-center text-4xl">🏢</div>
                    <div>
                       <p className="text-2xl font-black text-slate-900">Hope Foundation</p>
                       <p className="text-base font-bold text-slate-500 flex items-center gap-2 mt-1">
                          <MapPin className="w-5 h-5 text-orange-600" /> 2.1 km away
                       </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-orange-100/50 border border-orange-200">
                       <p className="text-[11px] font-black text-orange-700 uppercase tracking-widest mb-1">Est. Pickup</p>
                       <p className="text-xl font-black text-slate-900">25 mins</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-red-50 border border-red-200">
                       <p className="text-[11px] font-black text-red-700 uppercase tracking-widest mb-1">Priority</p>
                       <p className="text-xl font-black text-red-600 uppercase">High</p>
                    </div>
                 </div>

                 <button 
                   onClick={() => navigate('/donor/donations')}
                   className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] shadow-xl"
                 >
                    Donate Now
                 </button>
              </div>

              <div className="mt-8 text-center">
                 <p className="text-sm font-bold text-slate-400">Based on your frequent 9:00 PM donations</p>
              </div>
            </motion.div>

            <div className="lg:col-span-7 space-y-10">
               {/* ⚡ SECTION 3: QUICK ACTION BAR */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { label: "Post Donation", icon: <Plus className="w-7 h-7" />, color: "bg-orange-600", action: () => navigate('/donor/donations') },
                    { label: "Nearby NGOs", icon: <MapPin className="w-7 h-7" />, color: "bg-slate-900", action: () => navigate('/donor/map') },
                    { label: "View Impact", icon: <TrendingUp className="w-7 h-7" />, color: "bg-blue-600", action: () => navigate('/donor/analytics') }
                  ].map((btn, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={btn.action}
                      className="bg-white/70 backdrop-blur-2xl border-white/60 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6 group transition-all hover:shadow-2xl hover:border-orange-200"
                    >
                      <div className={`h-16 w-16 rounded-[1.5rem] ${btn.color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                         {btn.icon}
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-widest text-center">{btn.label}</p>
                    </motion.button>
                  ))}
               </div>

               {/* 📡 SECTION 4: LIVE SYSTEM STATUS */}
               <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-xl font-black uppercase tracking-[0.25em] text-orange-500">Live Network Status</h3>
                     <div className="flex items-center gap-3 px-4 py-1.5 bg-white/70 backdrop-blur-2xl border-white/60/5 rounded-full border border-white/10">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-black uppercase tracking-widest">Real-time Sync</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                     <div className="text-center">
                        <p className="text-4xl font-black text-white">5</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">Active Pickups</p>
                     </div>
                     <div className="text-center border-x border-white/10">
                        <p className="text-4xl font-black text-white">8</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">NGOs Available</p>
                     </div>
                     <div className="text-center">
                        <p className="text-4xl font-black text-white">12</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">Volunteers Active</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 📊 SECTION 5: IMPACT METRICS (MATCHING REFERENCE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Total Meals Saved", val: "3,100", sub: "1,240 kg rescued", icon: <Package className="w-7 h-7 text-orange-600" />, color: "bg-orange-50" },
              { label: "CO2 Reduced", val: "340 kg", sub: "≈ 15 trees planted", icon: <TrendingUp className="w-7 h-7 text-emerald-600" />, color: "bg-emerald-50" },
              { label: "Active Rescues", val: "8 Missions", sub: "Current month", icon: <Zap className="w-7 h-7 text-blue-600" />, color: "bg-blue-50" },
              { label: "Donor Level", val: "Level 12", sub: "Top 5% Donor", icon: <Trophy className="w-7 h-7 text-amber-600" />, color: "bg-amber-50" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -8 }}
                className="bg-white/70 backdrop-blur-2xl border-white/60 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-6">
                   <div className={`h-16 w-16 rounded-2xl ${stat.color} flex items-center justify-center shrink-0`}>
                      {stat.icon}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-400 tracking-wide uppercase text-[11px] mb-1">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                   </div>
                </div>
                <p className="text-[13px] font-bold text-orange-600 mt-6 flex items-center gap-2 px-2 py-1 bg-orange-50 rounded-lg w-fit">
                   <Zap className="w-4 h-4" /> {stat.sub}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* 🧠 SECTION 6: SMART INSIGHTS PANEL */}
             <motion.div 
               className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
             >
                <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 tracking-tight">
                   <Bot className="w-8 h-8 text-orange-600" /> Smart Insights
                </h3>
                <div className="space-y-6">
                   {[
                      { text: "You usually donate at 9:00 PM", icon: "🌙" },
                      { text: "Weekend donations are 40% higher", icon: "📈" },
                      { text: "Hope Foundation responds fastest to you", icon: "⚡" }
                   ].map((insight, i) => (
                      <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-orange-50/30 border border-orange-100/30 group hover:bg-orange-50 transition-colors">
                         <span className="text-2xl">{insight.icon}</span>
                         <p className="text-base font-bold text-slate-700 leading-tight">{insight.text}</p>
                      </div>
                   ))}
                </div>
             </motion.div>

             {/* 🔴 SECTION 7: LIVE ACTIVITY FEED */}
             <motion.div 
               className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
             >
                <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 tracking-tight">
                   <BellRing className="w-8 h-8 text-blue-600" /> Recent Activity
                </h3>
                <div className="space-y-4">
                   {[
                      { icon: "✅", title: "NGO Accepted", desc: "Hope Foundation accepted your bread donation.", time: "2 min ago" },
                      { icon: "🙋", title: "Volunteer Assigned", desc: "Arjun is nearby for your scheduled pickup.", time: "5 min ago" },
                      { icon: "🌟", title: "Impact Milestone", desc: "You just crossed 3,000 meals saved!", time: "1 hour ago" }
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors group">
                         <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60 shadow-md border border-slate-100 flex items-center justify-center text-2xl">
                               {item.icon}
                            </div>
                            <div>
                               <p className="font-black text-slate-900 text-lg leading-tight">{item.title}</p>
                               <p className="text-base font-medium text-slate-500 mt-1">{item.desc}</p>
                            </div>
                         </div>
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.time}</p>
                      </div>
                   ))}
                </div>
             </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* 🏆 SECTION 8: GAMIFICATION / PROGRESS */}
             <motion.div 
               className="lg:col-span-7 bg-gradient-to-br from-slate-950 to-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden"
             >
                <div className="absolute bottom-0 right-0 p-10 opacity-10">
                   <Trophy className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-start justify-between mb-12">
                      <div>
                         <p className="text-orange-500 font-black uppercase tracking-[0.3em] text-[11px] mb-3">Donor Rank • Prestige</p>
                         <h3 className="text-5xl font-black tracking-tight">Level {tierLevel + 10}</h3>
                      </div>
                      <div className="flex gap-3">
                         <div className="h-14 w-14 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60/5 flex items-center justify-center border border-white/10 shadow-lg" title="Top Donor This Week">🏅</div>
                         <div className="h-14 w-14 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60/5 flex items-center justify-center border border-white/10 shadow-lg" title="Fast Responder">⚡</div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between text-base font-black">
                         <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">Progress to Level {tierLevel + 11}</p>
                         <p className="text-orange-500 tracking-widest">{progressPercent}%</p>
                      </div>
                      <div className="h-5 w-full bg-white/70 backdrop-blur-2xl border-white/60/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${progressPercent}%` }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-orange-600 to-amber-400 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.5)]"
                         ></motion.div>
                      </div>
                   </div>
                </div>
             </motion.div>

             {/* 🌍 SECTION 9: MINI MAP PREVIEW */}
             <motion.div 
               className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
             >
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nearby Demand</h3>
                   <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest shadow-sm">Urgent Needs</span>
                </div>
                <div className="h-64 bg-slate-100 rounded-[2.5rem] relative overflow-hidden border border-slate-200 shadow-inner">
                   {/* Enhanced Map Visual */}
                   <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center">
                      <div className="relative">
                         <div className="h-32 w-32 rounded-full bg-orange-500/10 animate-ping absolute -inset-0 opacity-20"></div>
                         <div className="h-3 w-3 rounded-full bg-orange-600 relative z-10 shadow-[0_0_10px_rgba(234,88,12,0.8)]"></div>
                         {/* Urgent markers */}
                         <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="absolute top-12 left-16 h-4 w-4 rounded-full bg-red-600 shadow-xl border-2 border-white"></motion.div>
                         <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, delay: 0.5 }} className="absolute bottom-10 right-24 h-4 w-4 rounded-full bg-orange-600 shadow-xl border-2 border-white"></motion.div>
                         <div className="absolute top-20 right-10 h-4 w-4 rounded-full bg-red-600 shadow-xl border-2 border-white opacity-60"></div>
                      </div>
                   </div>
                   <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-2xl border-white/60 p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center justify-between">
                      <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">3 Active Demand Points</p>
                      <button onClick={() => navigate('/donor/map')} className="text-[12px] font-black text-orange-600 uppercase tracking-widest hover:underline">Explore ➜</button>
                   </div>
                </div>
             </motion.div>
          </div>


        </section>
      )}
      {/* ANALYTICS VIEW */}
      {isAnalytics && (
        <DonorAnalytics donations={donations} />
      )}


      {/* PROFILE VIEW */}
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

      {/* RESCUE MAP VIEW */}
      {isMap && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pb-12"
        >
          <RescueMap user={user} />
        </motion.section>
      )}

      {/* DONATIONS VIEW - SMART ASSISTANT */}
      {isDonations && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
           <SmartDonationView 
             user={user} 
             donations={donations} 
             onAddDonation={(don) => setDonations(prev => [don, ...prev])} 
           />
        </motion.div>
      )}
      {/* 📊 DASHBOARD VIEW - OPERATIONAL CONTROL PANEL */}
      {isDashboard && (
        <section className="space-y-10 pb-20 -mt-10 -mx-10 px-10 pt-10 bg-[#FCF9F1] min-h-screen">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* 🔴 SECTION 1: PRIORITY QUEUE (MOST IMPORTANT) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="h-2 w-8 bg-red-500 rounded-full"></span>
                  Urgent Donations Requiring Attention
                </h3>
                <span className="px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-[11px] font-black uppercase tracking-widest animate-pulse">
                  Live Updates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donations.filter(d => ['Pending', 'Accepted'].includes(d.status)).slice(0, 4).length === 0 ? (
                  <div className="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 font-bold">No urgent donations at the moment.</p>
                  </div>
                ) : (
                  donations.filter(d => ['Pending', 'Accepted'].includes(d.status)).slice(0, 4).map((item, i) => (
                  <motion.div 
                    key={item.id || i}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Pending' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-5 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl">🍲</div>
                      <div>
                        <p className="text-xl font-black text-slate-900">{item.foodType}</p>
                        <p className="text-sm font-bold text-red-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Expires: {item.expiry || 'Soon'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Quantity</span>
                        <span className="font-black text-slate-900">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Location</span>
                        <div className="text-right">
                          <p className="font-black text-slate-900 max-w-[150px] truncate">{item.location}</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => navigate('/donor/donations')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 group">
                      View Details
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )))}
              </div>
            </div>

            {/* 📡 SECTION 3: LIVE ACTIVITY FEED (ENHANCED) */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Activity className="w-7 h-7 text-orange-600" />
                Live activity
              </h3>
              
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[400px]">
                <div className="space-y-8">
                  {[
                    { icon: "🏢", msg: "NGO accepted donation", time: "2 min ago", status: "ACCEPTED", color: "text-emerald-600 bg-emerald-50" },
                    { icon: "🛵", msg: "Volunteer assigned", time: "5 min ago", status: "IN TRANSIT", color: "text-blue-600 bg-blue-50" },
                    { icon: "✅", msg: "Pickup in progress", time: "12 min ago", status: "IN TRANSIT", color: "text-blue-600 bg-blue-50" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 relative group">
                      {i !== 2 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100"></div>}
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0 z-10 shadow-sm">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-900 text-sm leading-tight">{item.msg}</p>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest shrink-0 ${item.color}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-12 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-colors border-t border-slate-50">
                  View full history ➜
                </button>
              </div>
            </div>
          </div>

          {/* 🔁 SECTION 2: DONATION STATUS FLOW TRACKER */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-10 uppercase tracking-widest flex items-center gap-4">
              <span className="h-1 w-12 bg-orange-600"></span>
              Donation Status Pipeline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: "Pending", count: 12, progress: 85, current: false },
                { label: "Accepted", count: 8, progress: 60, current: true },
                { label: "Picked", count: 5, progress: 40, current: false },
                { label: "Delivered", count: 42, progress: 100, current: false }
              ].map((step, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className={`font-black uppercase tracking-widest text-[11px] ${step.current ? 'text-orange-600' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-2xl font-black text-slate-900">{step.count}</p>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${step.progress}%` }}
                      className={`h-full rounded-full ${step.current ? 'bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-slate-300'}`}
                    ></motion.div>
                  </div>
                  {step.current && (
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
                      ● Active Focus
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* ⚠️ SECTION 4: ALERTS & DELAYS PANEL */}
            <div className="lg:col-span-5 space-y-6">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                  Critical Warnings
               </h3>
               <div className="space-y-4">
                  <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-start gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60 flex items-center justify-center shadow-sm shrink-0">🚨</div>
                    <div>
                      <p className="font-black text-red-900 uppercase tracking-tight text-sm">Response Delay</p>
                      <p className="text-sm font-bold text-red-700/80 mt-1">NGO has not responded for 15 minutes to your recent post.</p>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-start gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-white/70 backdrop-blur-2xl border-white/60 flex items-center justify-center shadow-sm shrink-0">🚛</div>
                    <div>
                      <p className="font-black text-orange-900 uppercase tracking-tight text-sm">Pickup Warning</p>
                      <p className="text-sm font-bold text-orange-700/80 mt-1">Pickup delayed due to extreme distance from volunteer base.</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* 📊 SECTION 5: SYSTEM HEALTH OVERVIEW */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Activity className="w-7 h-7 text-emerald-600" />
                Network performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Avg Pickup", val: "22 mins", icon: <Clock />, color: "text-blue-600 bg-blue-50" },
                  { label: "NGO Response", val: "85%", icon: <CheckCircle />, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Success Rate", val: "92%", icon: <Activity />, color: "text-purple-600 bg-purple-50" }
                ].map((card, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-2xl border-white/60 p-8 rounded-[2.5rem] shadow-xl border border-slate-50 group hover:border-orange-200 transition-colors">
                    <div className={`h-12 w-12 rounded-xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                    <p className="text-2xl font-black text-slate-900">{card.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 👤 SECTION 6: PERSONAL PERFORMANCE */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
               <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4">
                  <User className="w-8 h-8 text-orange-600" />
                  Your Impact Performance
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "Donations", val: "154", trend: "↑ 10%", color: "text-emerald-600" },
                    { label: "Acceptance", val: "98%", trend: "Stable", color: "text-blue-600" },
                    { label: "Avg Response", val: "4.2m", trend: "↓ 5%", color: "text-orange-600" },
                    { label: "Meals Saved", val: "3.1k", trend: "↑ 22%", color: "text-purple-600" }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                       <p className="text-3xl font-black text-slate-900">{stat.val}</p>
                       <p className={`text-[11px] font-black ${stat.color}`}>{stat.trend}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* 🧠 SECTION 7: SMART INSIGHTS PANEL */}
            <div className="lg:col-span-4 bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Bot className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-[0.2em] text-orange-500 mb-8">AI Insights</h3>
              <div className="space-y-6">
                {[
                  "You receive faster responses before 9 PM",
                  "Hope Foundation accepts most of your donations",
                  "Weekend donations have 20% higher success rates"
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>



        </section>
      )}
    </div>
  )
}

export default DonorDashboard
