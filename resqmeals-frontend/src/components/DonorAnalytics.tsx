import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BarChart3, Leaf, Heart, Clock, CheckCircle2, AlertCircle, Building2, Zap, ArrowUpRight, Activity, PieChart as PieChartIcon, Sparkles, Target, Lightbulb, Package, Timer, Trophy, Shield, Map
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';

const leaderboardData = [
  { rank: 1, name: "Marriott Hotel", meals: "1,240", icon: "🏢", isCurrent: false },
  { rank: 2, name: "Green Grocers", meals: "980", icon: "🍏", isCurrent: false },
  { rank: 3, name: "Naidu", meals: "850", icon: "⭐", isCurrent: true },
  { rank: 4, name: "Community Cafe", meals: "720", icon: "☕", isCurrent: false },
];

const trendData = [
  { day: 'Mon', donations: 4, impact: 20 },
  { day: 'Tue', donations: 6, impact: 35 },
  { day: 'Wed', donations: 5, impact: 30 },
  { day: 'Thu', donations: 8, impact: 50 },
  { day: 'Fri', donations: 12, impact: 85 },
  { day: 'Sat', donations: 18, impact: 120 },
  { day: 'Sun', donations: 15, impact: 100 },
];

const peakHoursData = [
  { hour: '08:00', volume: 20 },
  { hour: '11:00', volume: 45 },
  { hour: '14:00', volume: 80 },
  { hour: '17:00', volume: 100 },
  { hour: '20:00', volume: 140 },
  { hour: '23:00', volume: 60 },
];

const foodTypeDistribution = [
  { name: 'Fresh_Produce', value: 400, color: '#10b981' },
  { name: 'Cooked_Meals', value: 300, color: '#f97316' },
  { name: 'Bakery_Items', value: 200, color: '#f59e0b' },
  { name: 'Dairy_Products', value: 100, color: '#3b82f6' },
];

const collaborationData = [
  { name: 'Hope_Fnd', missions: 45, efficiency: 98 },
  { name: 'Food_Bank', missions: 32, efficiency: 92 },
  { name: 'Robin_Hood', missions: 28, efficiency: 95 },
  { name: 'Unity_Relief', missions: 15, efficiency: 88 },
];

export default function DonorAnalytics({ donations, isDarkMode }: { donations: any[], isDarkMode?: boolean }) {
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  
  return (
    <section aria-label="Smart Analytics Dashboard" className={`space-y-10 pb-32 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* 🚀 CYBER-ANALYTICS HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
         <div>
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 mb-4"
            >
               <div className="h-0.5 w-16 bg-orange-500"></div>
               <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.5em]">Impact_Intelligence_v3.0</span>
            </motion.div>
            <h2 className={`text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 ${textColor}`}>
               The Core.
            </h2>
            <p className={`${subTextColor} font-mono text-xs uppercase tracking-widest`}>Global Telemetry // Operational Insights // Predictive Modeling</p>
         </div>
         
         <div className="flex flex-wrap gap-4">
            <div className={`px-8 py-4 rounded-2xl border flex items-center gap-4 group transition-all cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-900 hover:border-orange-500'}`}>
               <div className="relative">
                  <Activity className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-emerald-400' : 'text-orange-500'}`} />
                  <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full animate-ping ${isDarkMode ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Data_Stream</span>
                  <span className="text-xs font-black uppercase">Live_Operational</span>
               </div>
            </div>
         </div>
      </div>

      {/* --- REAL-TIME IMPACT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { title: "KILOGRAMS_RESCUED", val: "2,450", sub: "kg", icon: Package, color: "text-blue-500", trend: "+12.4%" },
            { title: "MEALS_GENERATED", val: "10,200", sub: "units", icon: Heart, color: "text-rose-500", trend: "+8.2%" },
            { title: "CARBON_OFFSET", val: "850", sub: "kg CO2", icon: Leaf, color: "text-emerald-500", trend: "+15.1%" },
            { title: "NETWORK_RELIABILITY", val: "99.9", sub: "%", icon: Shield, color: "text-orange-500", trend: "Stable" }
         ].map((m, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`relative overflow-hidden border p-10 hover:border-orange-500/50 transition-all group rounded-[2.5rem] ${cardBg}`}
            >
               <div className="flex justify-between items-start mb-8">
                  <p className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em]">{m.title}</p>
                  <span className={`text-[10px] font-black font-mono ${m.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{m.trend}</span>
               </div>
               <div className="flex items-baseline gap-2 mb-8">
                  <span className={`text-5xl font-black tracking-tighter ${textColor}`}>{m.val}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase">{m.sub}</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${m.color} bg-current/10 border border-current/20`}>
                     <m.icon className="w-5 h-5" />
                  </div>
                  <div className={`h-1 flex-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                     <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className={`h-full bg-current ${m.color}`} />
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         
         {/* --- PRIMARY OPERATIONAL FLOW --- */}
         <div className="xl:col-span-8 space-y-8">
            <div className={`border p-10 rounded-[3rem] ${cardBg}`}>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                  <div>
                     <h3 className={`font-black uppercase tracking-[0.2em] text-sm ${textColor}`}>
                        Operational_Efficiency_Matrix
                     </h3>
                     <p className="text-[10px] font-mono text-slate-400 mt-2">Correlating donation frequency with community impact.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Donations</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isDarkMode ? 'bg-white' : 'bg-slate-900'}`}></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Impact</span>
                     </div>
                  </div>
               </div>
               
               <div className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={trendData}>
                        <defs>
                           <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', border: 'none', borderRadius: '1rem', padding: '1rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                           itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                           labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '0.5rem' }}
                        />
                        <Area type="monotone" dataKey="donations" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorDonations)" />
                        <Area type="monotone" dataKey="impact" stroke="#ffffff00" fill="#94a3b820" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* --- PEAK HOURS VISUALIZATION --- */}
               <div className={`border p-10 rounded-[3rem] ${cardBg}`}>
                  <h4 className={`font-black uppercase tracking-[0.2em] text-xs mb-10 ${textColor}`}>Peak_Operational_Hours</h4>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakHoursData}>
                           <Tooltip cursor={{fill: 'transparent'}} contentStyle={{display: 'none'}} />
                           <Bar dataKey="volume" radius={[10, 10, 10, 10]}>
                              {peakHoursData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.volume > 80 ? '#f97316' : (isDarkMode ? '#1e293b' : '#f1f5f9')} />
                              ))}
                           </Bar>
                           <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className={`mt-8 pt-8 border-t flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Max_Capacity</span>
                        <span className="text-xl font-black text-orange-500">20:00 - 21:30</span>
                     </div>
                     <Timer className="w-6 h-6 text-slate-300" />
                  </div>
               </div>

               {/* --- COLLABORATION NETWORK --- */}
               <div className={`border p-10 rounded-[3rem] ${cardBg}`}>
                  <h4 className={`font-black uppercase tracking-[0.2em] text-xs mb-10 ${textColor}`}>Collab_Partner_Efficiency</h4>
                  <div className="space-y-6">
                     {collaborationData.map((ngo, idx) => (
                        <div key={idx} className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-slate-400">{ngo.name}</span>
                              <span className="text-[10px] font-mono font-black text-emerald-500">{ngo.efficiency}% EFF</span>
                           </div>
                           <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <motion.div 
                                 initial={{ width: 0 }} 
                                 animate={{ width: `${ngo.efficiency}%` }} 
                                 className={`h-full ${ngo.efficiency > 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                              />
                           </div>
                        </div>
                     ))}
                  </div>
                  <button className={`mt-10 w-full py-4 border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'border-slate-800 text-slate-400 hover:text-orange-500 hover:border-orange-500' : 'border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900'}`}>
                     View_Partner_Metrics
                  </button>
               </div>
            </div>
         </div>

         {/* --- INTELLIGENCE & DISTRIBUTION --- */}
         <div className="xl:col-span-4 space-y-8">
            <div className={`p-12 rounded-[3.5rem] h-full flex flex-col relative overflow-hidden group border ${isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-950 border-slate-900 text-white'}`}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-orange-500/20"></div>
               
               <div className="relative z-10 mb-16">
                  <div className="flex items-center gap-3 text-orange-500 mb-12">
                     <Sparkles className="w-6 h-6 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">AI_Prediction_Model</span>
                  </div>
                  
                  <div className="space-y-12">
                     <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">OPTIMAL_DONATION_STRATEGY</p>
                        <p className="text-4xl font-black leading-tight">Prioritize_Cooked_Meals during Weekend_Cycle.</p>
                        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                           <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                              "Current trends indicate a 28% shortage in community kitchens on Saturdays. Your intervention could bridge this gap."
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[9px] font-mono text-slate-600 uppercase mb-2">Impact_Factor</p>
                           <p className="text-3xl font-black text-white">4.8x</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-mono text-slate-600 uppercase mb-2">Relief_Speed</p>
                           <p className="text-3xl font-black text-orange-500">Fast</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-auto pt-12 border-t border-white/10 flex flex-col gap-8 relative z-10">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Food_Asset_Distribution</h5>
                  <div className="h-[200px] w-full flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={foodTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {foodTypeDistribution.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                           </Pie>
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '1rem' }}
                              itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {foodTypeDistribution.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: f.color }}></div>
                           <span className="text-[9px] font-mono text-slate-400 uppercase truncate">{f.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- PEER BENCHMARKING: LEADERBOARD --- */}
      <div className={`border p-12 rounded-[4rem] ${cardBg}`}>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <div>
               <h3 className={`text-2xl font-black tracking-tight uppercase ${textColor}`}>Peer_Impact_Benchmarking</h3>
               <p className="text-xs text-slate-400 font-mono mt-2 uppercase tracking-widest">Global Network Standing // Top 5% Rank</p>
            </div>
            <button className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${isDarkMode ? 'bg-slate-900 text-white hover:bg-orange-500' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl'}`}>
               <Trophy className="w-4 h-4" /> View_Full_Leaderboard
            </button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaderboardData.map((donor, idx) => (
               <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className={`p-10 border transition-all rounded-[3rem] relative overflow-hidden ${donor.isCurrent ? (isDarkMode ? 'border-orange-500 bg-orange-50/10' : 'border-orange-500 bg-orange-50/50') : (isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50')}`}
               >
                  {donor.isCurrent && (
                     <div className="absolute top-0 right-0 px-6 py-2 bg-orange-500 text-white font-black text-[8px] uppercase tracking-widest rounded-bl-3xl">You</div>
                  )}
                  <p className="font-mono text-[10px] text-slate-400 mb-6 uppercase tracking-widest">RANK_0{donor.rank}</p>
                  <div className="text-3xl mb-4">{donor.icon}</div>
                  <p className={`text-xl font-black mb-1 ${textColor}`}>{donor.name}</p>
                  <p className="text-sm font-bold text-slate-400">{donor.meals} meals rescues</p>
                  
                  <div className={`mt-10 h-1 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${100 - (idx * 15)}%` }} 
                        className={`h-full ${donor.isCurrent ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-400'}`} 
                     />
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

    </section>
  );
}
