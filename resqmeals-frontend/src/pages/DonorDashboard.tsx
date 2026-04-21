import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { Plus, Package, Clock, MapPin, Loader2, TrendingUp, User, Mail, Phone, BellRing, UserCog, Bot, Trophy } from 'lucide-react'
import { LiveTrackingCard } from '../components/ui/live-tracker'
import { SignInCard } from '../components/ui/travel-connect-signin'
import { Gallery4 } from '../components/ui/gallery4'
import ProfileVerificationCenter from '../components/ProfileVerificationCenter'
import VerificationGate from '../components/VerificationGate'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { NGOFinder } from '../components/ui/NGOFinder'
import DonorAnalytics from '../components/DonorAnalytics'
import CommunityLeaderboard from '../components/CommunityLeaderboard'

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
             <div className="h-2 w-8 bg-orange-500 rounded-full"></div>
             <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">
                Donor Portal {user && `• ${user.name}`}
             </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-orange-600 tracking-tight">
            {isHome && `Home.`}
            {isDashboard && 'Stats & Activity'}
            {isDonations && 'My Donations'}
            {isProfile && 'Profile Settings'}
            {isAnalytics && 'My Impact'}
          </h1>
          <p className="text-slate-500 mt-4 max-w-2xl text-lg font-medium leading-relaxed">
            {isHome && 'Welcome back! Here is a quick look at your contributions and how you can help today.'}
            {isDashboard && 'A simple overview of your food rescue activity and community impact.'}
            {isDonations && 'List your extra food here. We will help you find a nearby NGO to pick it up.'}
            {isProfile && 'Manage your account information and how we contact you.'}
            {isAnalytics && 'See a detailed breakdown of the food and CO2 you have saved.'}
          </p>
        </motion.div>
        
        {isDonations && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
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
              className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-8 py-4 text-sm font-black text-slate-700 shadow-sm hover:border-primary/20 hover:text-primary transition-all hover:scale-105 active:scale-95 focus:outline-none"
            >
              Export Archive
            </button>
            <button
              aria-label="Scroll to donation form"
              onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 focus:outline-none"
            >
              <Plus className="w-6 h-6" />
              New Donation
            </button>
          </motion.div>
        )}
      </header>

      {/* HOME VIEW */}
      {isHome && (
        <section className="space-y-12">
          {/* Dashboard Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[3rem] p-8 md:p-14 overflow-hidden shadow-2xl group min-h-[450px] flex items-center border border-orange-100"
          >
            {/* Animated Background Image with Soft Overlays */}
            <div className="absolute inset-0 z-0 bg-orange-50">
              <img 
                src="/food_donation_hero_bg_1775809213499.png" 
                alt="Community Background" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-orange-50/60 to-transparent"></div>
              <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] pointer-events-none"></div>
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white shadow-xl border border-orange-100 text-orange-600 text-[11px] font-black uppercase tracking-[0.2em] mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                Top Contributor This Week
              </motion.div>
              
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
                Feeding Hope, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 drop-shadow-sm">Saving Future.</span>
              </h2>
              
              <p className="text-slate-600 mt-6 text-xl font-medium leading-relaxed max-w-lg">
                Join our network of 500+ donors making a difference every single day through smart food redistribution.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/donor/donations')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:shadow-[0_15px_30px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-1 active:scale-95 border border-orange-400/50"
                >
                  Post Surplus Food
                </button>
                <button 
                  onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg shadow-slate-200/50"
                >
                  View Network
                </button>
              </div>
            </div>
          </motion.div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Rescued", val: "1,240 kg", icon: <Package className="w-6 h-6" />, color: "from-blue-500 to-indigo-600" },
              { label: "Active Rescues", val: "8 Missions", icon: <Bot className="w-6 h-6" />, color: "from-emerald-500 to-teal-600" },
              { label: "CO2 Reduction", val: "340 kg", icon: <TrendingUp className="w-6 h-6" />, color: "from-orange-500 to-amber-600" },
              { label: "Community Rep", val: "Level 12", icon: <Trophy className="w-6 h-6" />, color: "from-purple-500 to-rose-600" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6"
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                   {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-8 h-full flex flex-col justify-between relative overflow-hidden rounded-[3rem] bg-white p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-16">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      Milestone Journey
                    </h3>
                    <p className="text-slate-500 font-medium mt-3 text-lg">
                      You are a <span className="text-primary font-bold">{currentTier} Rescuer</span>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-2.5 rounded-full shadow-lg border border-slate-700">
                    <p className="text-xs font-black text-white tracking-widest uppercase">Tier {tierLevel}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-slate-900 leading-none">{totalMealsRescued.toLocaleString()}</p>
                      <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">Meals Rescued</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{targetMeals.toLocaleString()}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">Target for {nextTier}</p>
                    </div>
                  </div>
                  
                  <div className="relative h-6 w-full bg-slate-100 rounded-full p-1.5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary via-orange-400 to-amber-400 rounded-full relative group"
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl border-4 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-4 h-full relative overflow-hidden rounded-[3rem] bg-white border border-orange-100 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] group flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-200 transition-colors"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 border border-orange-100 group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">One-Tap Relist</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Quickly re-donate your most frequent items.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 group-hover:bg-orange-100/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-orange-100">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-lg leading-tight">{mostFrequentDonation}</p>
                      <p className="text-orange-600 text-xs font-black uppercase tracking-wider mt-1">Instant Share ➜</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* GALLERY SECTION - Upgraded based on Gallery4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Gallery4 />
          </motion.div>

          <div className="pb-12">
            {/* Mission Impact Banner - Horizontal Redesign */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-[3rem] bg-gradient-to-r from-orange-500 to-amber-600 p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group flex flex-col lg:flex-row items-center justify-between gap-10"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-xl">
                <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/30 shadow-xl group-hover:scale-105 transition-transform">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Mission Impact</h3>
                <p className="text-orange-50 text-lg md:text-xl font-medium leading-relaxed opacity-90">
                  Your rescue efforts are setting new benchmarks for community care and environmental sustainability.
                </p>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row gap-6 w-full lg:w-auto mt-6 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-md px-10 py-8 rounded-[2.5rem] border border-white/20 hover:bg-white/20 transition-all flex-1 text-center lg:text-left shadow-lg">
                  <p className="text-4xl lg:text-5xl font-black text-white mb-2">{(totalMealsRescued * 0.5).toFixed(1)}kg</p>
                  <p className="text-sm font-black text-orange-100 uppercase tracking-[0.2em]">CO2 Saved</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-10 py-8 rounded-[2.5rem] border border-white/20 hover:bg-white/20 transition-all flex-1 text-center lg:text-left shadow-lg">
                  <p className="text-4xl lg:text-5xl font-black text-white mb-2">~{(totalMealsRescued / 3).toFixed(0)}</p>
                  <p className="text-sm font-black text-orange-100 uppercase tracking-[0.2em]">Families Fed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}


      {/* DASHBOARD VIEW */}
      {isDashboard && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-10 pb-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-100 flex flex-col justify-between"
              >
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-4xl font-black text-slate-900">{stat.count}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${stat.color}`}>
                    {stat.label === 'Pending' ? 'Active' : 'Total'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Mobile Tracking for Active Rescue */}
          {donations.find(d => d.status === 'Accepted' || d.status === 'Picked') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <LiveTrackingCard donationId={donations.find(d => d.status === 'Accepted' || d.status === 'Picked')!.id} />
            </motion.div>
          )}

          <div className="grid gap-10 lg:grid-cols-2">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <BellRing className="w-5 h-5 text-blue-600" />
                </div>
                Live Activity
              </h2>
              <div className="space-y-6">
                {[
                  { icon: "🔔", title: "NGO Found", desc: "Hope Foundation accepted your donation.", time: "10 mins ago", bg: "bg-orange-50", text: "text-orange-600" },
                  { icon: "🚚", title: "On its way", desc: "Volunteer is arriving for bread pickup.", time: "1 hour ago", bg: "bg-slate-50", text: "text-slate-600" }
                ].map((alert, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className={`p-5 rounded-[2rem] ${alert.bg} border border-transparent hover:border-slate-100 flex gap-5 items-center`}
                  >
                    <div className="h-14 w-14 shrink-0 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                      {alert.icon}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{alert.title}</p>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">{alert.desc}</p>
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{alert.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
            >
               <CommunityLeaderboard />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ANALYTICS VIEW */}
      {isAnalytics && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-10 pb-12"
        >
          <div className="grid gap-10 lg:grid-cols-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  Impact Overview
                </h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={impactData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Line type="monotone" dataKey="meals" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#f97316' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4 }} />
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#f8fafc', padding: '12px' }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <DonorAnalytics donations={donations} />
          </motion.div>
        </motion.div>
      )}


      {/* PROFILE VIEW */}
      {isProfile && (
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Profile Settings</h2>
              <p className="text-slate-500 mt-1 text-lg">Manage your organization details and notification preferences.</p>
            </div>
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary rotate-3">
              <User className="h-10 w-10" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 mb-12">
            <div className="flex-1">
              <ProfileVerificationCenter />
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name / Organization</label>
                <div className="relative group">
                   <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <input 
                      disabled={!isEditingProfile}
                      value={editProfileData.name}
                      onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <input 
                      disabled={!isEditingProfile}
                      value={editProfileData.email}
                      type="email"
                      onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Primary Pickup Address</label>
                <div className="relative group">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <input 
                      disabled={!isEditingProfile}
                      value={editProfileData.address}
                      onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Contact Number</label>
                <div className="relative group">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <input 
                      disabled={!isEditingProfile}
                      value={editProfileData.phone}
                      onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                   />
                </div>
              </div>
              
              {isEditingProfile && (
                <div className="space-y-2 md:col-span-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-slate-700 ml-1">New Password (leave blank to keep current)</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={editProfileData.password}
                    onChange={(e) => setEditProfileData({...editProfileData, password: e.target.value})}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                  />
                </div>
              )}
            </div>

            <div className="mb-12 p-8 rounded-[2rem] border border-slate-200 bg-slate-50/30">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                <BellRing className="w-6 h-6 text-primary" />
                Communication Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500 mt-1">Receive alerts when NGOs accept donations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">SMS Alerts</p>
                    <p className="text-sm text-slate-500 mt-1">Get text messages for volunteer arrivals.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-slate-100">
              {!isEditingProfile ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 px-10 py-5 text-sm font-black text-white shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                  <UserCog className="w-6 h-6" />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false)
                      setEditProfileData({
                        name: user?.name || '',
                        email: user?.email || '',
                        address: user?.address || '',
                        phone: user?.phone || '+91 98765 43210',
                        password: ''
                      })
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-8 py-4 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primaryDark transition-all hover:scale-105 active:scale-95 disabled:opacity-75"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
      )}

      {/* RESCUE MAP VIEW */}
      {isMap && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-10"
        >
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Rescue Network Explorer</h2>
            <p className="text-slate-500 mt-3 text-lg font-medium">Real-time visualization of help being delivered and nearby NGOs accepting food.</p>
          </div>
          
          <div className="rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
            <NGOFinder />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
            {[
              { title: "Safe Zones", desc: "All highlighted areas are verified for safe food handling and rapid distribution.", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
              { title: "Response Time", desc: "Average response time for donation pickup in your sector is 18 minutes.", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
              { title: "Global Impact", desc: "Your city has rescued over 2.4 tons of food this week alone!", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" }
            ].map((card, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2.5rem] ${card.bg} border ${card.border} shadow-sm`}
              >
                <h4 className={`text-xl font-black ${card.text} mb-3`}>{card.title}</h4>
                <p className={`text-sm font-medium ${card.text} opacity-80 leading-relaxed`}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* DONATIONS VIEW - MISSION CONTROL */}
      {isDonations && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* REGISTRATION CORE */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-orange-100/30 border border-orange-100"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Share Food</h2>
                  <p className="text-slate-500 font-medium mt-1">Tell us what you have so we can help you find a match.</p>
                </div>
                <div className="h-16 w-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
                  <Package className="w-8 h-8" />
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const finalData = {
                    ...formData,
                    quantity: `${formData.quantity} ${formData.unit}`,
                    foodType: `[${formData.category}] ${formData.foodType}`
                  };
                  const response = await api.post('/donations', finalData);
                  setDonations(prev => [response.data.donation, ...prev]);
                  setFormData(prev => ({ ...prev, foodType: '', quantity: '' }));
                  fetchAiMatch(response.data.donation.id);
                } catch (err) {
                  console.error(err);
                  alert('Submission failed.');
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-8">
                {/* Category Selection */}
                <div className="grid grid-cols-3 gap-4">
                   {[
                     { id: 'Veg', label: 'Vegetarian', color: 'emerald' },
                     { id: 'Non-Veg', label: 'Non-Veg', color: 'rose' },
                     { id: 'Vegan', label: 'Vegan', color: 'blue' }
                   ].map(cat => (
                     <button
                       key={cat.id}
                       type="button"
                       onClick={() => setFormData({...formData, category: cat.id})}
                       className={`p-4 rounded-2xl border-2 transition-all text-center group ${
                         formData.category === cat.id 
                         ? `bg-${cat.color}-50 border-${cat.color}-500 text-${cat.color}-700 shadow-lg shadow-${cat.color}-100` 
                         : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                       }`}
                     >
                        <div className={`text-xs font-black uppercase tracking-widest mb-1 ${formData.category === cat.id ? `text-${cat.color}-600` : ''}`}>
                          {cat.id}
                        </div>
                        <div className="text-[10px] font-bold opacity-60">{cat.label}</div>
                     </button>
                   ))}
                </div>

                <div className="space-y-6">
                  <div className="group space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">What food is it?</label>
                    <div className="relative">
                      <input 
                        required
                        placeholder="E.g. 50 Veg Meals, leftover bread..."
                        value={formData.foodType}
                        onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white px-6 py-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">How much?</label>
                      <div className="flex gap-2">
                         <input 
                           required
                           type="number"
                           placeholder="0"
                           value={formData.quantity}
                           onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                           className="flex-1 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white px-6 py-5 rounded-[1.5rem] outline-none transition-all font-black text-slate-800 shadow-inner"
                         />
                         <select 
                           value={formData.unit}
                           onChange={(e) => setFormData({...formData, unit: e.target.value})}
                           className="bg-slate-900 text-white px-4 rounded-2xl font-black text-xs uppercase tracking-widest focus:ring-4 focus:ring-orange-500/20"
                         >
                            <option value="Kgs">Kgs</option>
                            <option value="Plates">Plates</option>
                            <option value="Boxes">Boxes</option>
                         </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Good for how long? (Hours)</label>
                      <div className="relative">
                         <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-600" />
                         <input 
                           required
                           placeholder="E.g. 4"
                           value={formData.expiry}
                           onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                           className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white pl-16 pr-6 py-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-inner"
                         />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Where should we pick up?</label>
                    <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-600" />
                       <input 
                         required
                         placeholder="Enter your address"
                         onChange={(e) => setFormData({...formData, location: e.target.value})}
                         className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white pl-16 pr-6 py-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-inner"
                       />
                    </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Discovery Range</label>
                       <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-[10px] font-black">{formData.radius} KM</span>
                    </div>
                    <div className="relative h-12 flex items-center bg-slate-50 px-6 rounded-[1.5rem] border-2 border-transparent focus-within:border-orange-500 transition-all">
                      <input 
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={formData.radius}
                        onChange={(e) => setFormData({...formData, radius: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                      <div className="absolute -bottom-1 left-6 right-6 flex justify-between text-[9px] font-bold text-slate-300 pointer-events-none">
                         <span>1 KM</span>
                         <span>25 KM</span>
                         <span>50 KM</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium px-1">
                      NGOs within this radius will receive instant notifications. Expand if no partners are available.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Bot className="w-6 h-6" />
                      List & Find NGO
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* LISTING HUB */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                   <TrendingUp className="w-6 h-6 text-orange-400" />
                   Recent Dispatch
                </h3>
                
                <div className="space-y-4">
                  {donations.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                       <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                       <p className="text-slate-500 font-bold">Awaiting your first mission.</p>
                    </div>
                  ) : (
                    donations.slice(0, 5).map(don => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={don.id}
                        className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 flex justify-between items-center group/item hover:bg-slate-800 transition-colors"
                      >
                         <div className="min-w-0">
                            <p className="font-black text-sm truncate uppercase tracking-tight">{don.foodType}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{don.quantity}</span>
                               <span className="h-1 w-1 bg-slate-600 rounded-full"></span>
                               <span className="text-[10px] font-bold text-slate-400">{don.status}</span>
                            </div>
                         </div>
                         <div className="h-10 w-10 bg-slate-700 rounded-xl flex items-center justify-center group-hover/item:text-orange-400 transition-colors">
                            <Plus className="w-4 h-4" />
                         </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <button className="w-full mt-8 py-4 border-t border-slate-800 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                   View Full History ➜
                </button>
             </div>

             <div className="bg-orange-50 rounded-[3rem] p-10 border border-orange-100 flex items-center gap-6">
                 <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-orange-200/50">
                    <Trophy className="w-10 h-10 text-orange-600" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-slate-900">AI Verified!</h4>
                    <p className="text-slate-600 font-medium">Your donations have rescued over 4,000 potential meals this month.</p>
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonorDashboard
