import { useNavigate } from 'react-router-dom'
import { LiveMapSection } from '../components/ui/live-map'
import { Utensils, Heart, Bell, CheckCircle, MapPin, Truck, ArrowRight, ShieldCheck, Activity, Star, Clock, Users } from 'lucide-react'
import { TestimonialGrid } from '../components/ui/testimonial-grid'
import { ImpactCalculator } from '../components/ui/impact-calculator'
import { VolunteerSection } from '../components/ui/volunteer-section'
import { useState, useEffect } from 'react'
import api from '../lib/api'

// Food donation themed testimonials
const animatedTestimonials = [
  {
    quote:
      "Working on the backend architecture and seamless logistics flow for ResQMeals has been incredibly fulfilling. Our system ensures that surplus food reaches its destination quickly and efficiently.",
    name: "Hari Hara Naidu",
    designation: "Co-Creator, ResQMeals",
    srcs: [
      "/Hari%20Hara%20Naidu.jpg",
      "https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    rating: 5,
    verified: true
  },
  {
    quote:
      "Building ResQMeals has been a journey of purpose. We wanted to use technology to bridge the gap between abundance and hunger, making food rescue seamless.",
    name: "Sanjay Thomas",
    designation: "Co-Creator, ResQMeals",
    srcs: [
      "/Sanjay Thomas.jpeg",
      "https://images.unsplash.com/photo-1522075469751-3a3694c2d654?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    rating: 5,
    verified: true
  },
  {
    quote:
      "Our goal is to create a sustainable ecosystem where no food goes to waste. Seeing our code translate into real meals for real people is incredibly rewarding.",
    name: "Allu Pragathi",
    designation: "Co-Creator, ResQMeals",
    srcs: [
      "/Allu%20Pragathi.jpg",
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    rating: 5,
    verified: true
  },
]

// Sample Live Activity Feed Data
const sampleActivities = [
  { id: 1, type: 'rescue', donor: 'Spice Garden Restaurant', location: 'Delhi', time: '2 mins ago', items: '50 Meals' },
  { id: 2, type: 'delivery', ngo: 'Hope Foundation', location: 'Mumbai', time: '5 mins ago', items: '120 Meals' },
  { id: 3, type: 'volunteer', name: 'Rahul Sharma', action: 'completed a rescue', time: '12 mins ago' },
  { id: 4, type: 'rescue', donor: 'Taj Hotel', location: 'Bangalore', time: '18 mins ago', items: '200 Meals' },
]

const LiveActivityFeed = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full max-w-sm mx-auto xl:max-w-none xl:w-80 absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block z-10">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500 animate-pulse" />
          <h3 className="font-bold text-slate-900">Live Activity</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Live</span>
      </div>
      <div className="p-0">
        {sampleActivities.map((activity, idx) => (
          <div key={activity.id} className={`p-4 flex gap-3 items-start ${idx !== sampleActivities.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors`}>
            <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'rescue' ? 'bg-emerald-100 text-emerald-600' : activity.type === 'delivery' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              {activity.type === 'rescue' ? <Utensils className="h-4 w-4" /> : activity.type === 'delivery' ? <Heart className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm text-slate-900 leading-snug">
                {activity.type === 'rescue' && <><span className="font-semibold">{activity.donor}</span> listed <span className="font-semibold text-emerald-600">{activity.items}</span></>}
                {activity.type === 'delivery' && <><span className="font-semibold">{activity.ngo}</span> received <span className="font-semibold text-blue-600">{activity.items}</span></>}
                {activity.type === 'volunteer' && <><span className="font-semibold">{activity.name}</span> {activity.action}</>}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activity.time}</span>
                {activity.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{activity.location}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Landing = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ restaurants: 50, ngos: 20, meals: 500 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/donations')
        const allDonations = res.data.donations
        setStats({
          restaurants: new Set(allDonations.map((d: any) => d.donorId)).size + 450, // Added to base for realism
          ngos: 200, // Placeholder
          meals: (allDonations.length * 40) + 49000 // Base + live
        })
      } catch (err) {
        console.error('Failed to fetch live stats', err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth relative bg-slate-50 font-sans selection:bg-orange-500/30">

      {/* HERO SECTION */}
      <section className="relative h-screen snap-start flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
            alt="Community sharing food"
            className="h-full w-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="max-w-2xl text-white">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-md">
              <span className="mr-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium text-orange-50">Live in 25+ cities across India</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight mb-6">
              End Food Waste. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Feed Communities.</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-xl text-white/80 leading-relaxed max-w-lg">
              ResQMeals connects restaurants with surplus food to NGOs serving hungry families. One scalable platform. Zero waste. Maximum impact.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => navigate('/auth')}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Utensils className="mr-2 h-5 w-5" />
                <span>Donate Food</span>
              </button>

              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Heart className="mr-2 h-5 w-5 text-red-400" />
                Partner as NGO
              </button>
              
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Users className="mr-2 h-5 w-5 text-blue-400" />
                Join Volunteer
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold text-white">{stats.restaurants}+</p>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Partners</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{(stats.meals / 1000).toFixed(1)}K+</p>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Meals Rescued</p>
              </div>
              <div>
                <div className="flex -space-x-2">
                  <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=1" alt="Volunteer" />
                  <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=2" alt="Volunteer" />
                  <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=3" alt="Volunteer" />
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 text-white flex items-center justify-center text-xs font-bold">+2k</div>
                </div>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide mt-2">Volunteers</p>
              </div>
            </div>
          </div>

          <LiveActivityFeed />
        </div>
      </section>

      {/* LIVE MAP SECTION */}
      <section id="map" className="relative h-screen snap-start bg-slate-900 overflow-hidden w-full">
        <LiveMapSection isEdgeToEdge={true} />
      </section>

      {/* HOW IT WORKS SECTION (VISUAL STEP FLOW) */}
      <section id="how-it-works" className="h-screen snap-start flex flex-col justify-center bg-slate-50">
        <div className="max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800 mb-4">
              Simple & Effective
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              How ResQMeals Works
            </h2>
            <p className="text-lg text-slate-600">
              A scalable logistics platform connecting surplus food with communities in need in three simple steps.
            </p>
          </div>

          {/* Visual Flow Container */}
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-emerald-200 -translate-y-1/2 z-0 rounded-full"></div>
            
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-10 relative z-10">
              
              {/* Step 1 */}
              <div className="relative bg-white rounded-[2rem] p-10 lg:p-12 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 min-h-[400px] flex flex-col justify-center">
                <div className="absolute -top-6 left-10 h-14 w-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-200 font-black text-2xl border-4 border-slate-50">
                  1
                </div>
                <div className="mb-8 h-20 w-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Utensils className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Restaurant Lists Surplus</h3>
                <p className="text-slate-600 text-lg leading-relaxed">At the end of service, partners upload details of surplus meals securely to our platform, specifying quantity and pickup times.</p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white rounded-[2rem] p-10 lg:p-12 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 min-h-[400px] flex flex-col justify-center">
                <div className="absolute -top-6 left-10 h-14 w-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200 font-black text-2xl border-4 border-slate-50">
                  2
                </div>
                <div className="mb-8 h-20 w-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                  <Truck className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Volunteer Matches & Picks Up</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Our algorithm matches the donation with a nearby verified volunteer who claims the rescue and picks up the food.</p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white rounded-[2rem] p-10 lg:p-12 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 min-h-[400px] flex flex-col justify-center">
                <div className="absolute -top-6 left-10 h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 font-black text-2xl border-4 border-slate-50">
                  3
                </div>
                <div className="mb-8 h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Heart className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">NGO Receives & Distributes</h3>
                <p className="text-slate-600 text-lg leading-relaxed">The volunteer delivers the fresh meals to a partner NGO, where it is immediately distributed to families in need.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="h-screen snap-start flex flex-col justify-center bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Real Impact, Scaled.
            </h2>
            <p className="text-lg text-slate-400">
              Our infrastructure supports thousands of rescues daily, ensuring food reaches its destination safely and efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Stat Card 1 */}
            <div className="group bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Utensils className="h-24 w-24" />
              </div>
              <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">50k+</h3>
              <p className="font-bold text-slate-300 mb-2">Meals Rescued</p>
              <p className="text-sm text-slate-500">Fresh meals saved from landfills this year</p>
            </div>

            {/* Stat Card 2 */}
            <div className="group bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart className="h-24 w-24" />
              </div>
              <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">15k+</h3>
              <p className="font-bold text-slate-300 mb-2">Families Served</p>
              <p className="text-sm text-slate-500">Benefiting from high-quality surplus food</p>
            </div>

            {/* Stat Card 3 */}
            <div className="group bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapPin className="h-24 w-24" />
              </div>
              <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">25+</h3>
              <p className="font-bold text-slate-300 mb-2">Active Cities</p>
              <p className="text-sm text-slate-500">Expanding network across the nation</p>
            </div>

            {/* Stat Card 4 */}
            <div className="group bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="h-24 w-24" />
              </div>
              <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">45T</h3>
              <p className="font-bold text-slate-300 mb-2">CO₂ Prevented</p>
              <p className="text-sm text-slate-500">Significant reduction in carbon emissions</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT CALCULATOR */}
      <section id="impact-calculator" className="h-screen snap-start flex flex-col justify-center bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImpactCalculator />
        </div>
      </section>

      {/* VOLUNTEER SECTION */}
      <section className="h-screen snap-start flex flex-col justify-center bg-orange-50 overflow-hidden">
        <VolunteerSection />
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="community" className="h-screen snap-start flex flex-col justify-center bg-white border-t border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Trusted by the Community</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Hear from the people building and using the ResQMeals platform every day.</p>
          </div>
          <TestimonialGrid items={animatedTestimonials} />
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative h-screen snap-start flex flex-col justify-center bg-orange-600 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 sm:text-5xl">Ready to make a difference?</h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            Join thousands of restaurants, volunteers, and NGOs in the fight against food waste. Setup takes less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 font-bold text-orange-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-600"
            >
              Start Saving Food
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Landing
