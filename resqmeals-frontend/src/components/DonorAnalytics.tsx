import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BarChart3, Leaf, Heart, Clock, CheckCircle2, AlertCircle, Building2, Zap, ArrowUpRight, Activity, PieChart as PieChartIcon, Sparkles, Target, Lightbulb, Package, Timer, Trophy
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

const leaderboardData = [
  { rank: 1, name: "Marriott Hotel", meals: "1,240", icon: "🏢", isCurrent: false },
  { rank: 2, name: "Green Grocers", meals: "980", icon: "🍏", isCurrent: false },
  { rank: 3, name: "Naidu", meals: "850", icon: "⭐", isCurrent: true },
  { rank: 4, name: "Community Cafe", meals: "720", icon: "☕", isCurrent: false },
];

const trendData = [
  { day: 'Mon', donations: 4 },
  { day: 'Tue', donations: 6 },
  { day: 'Wed', donations: 5 },
  { day: 'Thu', donations: 8 },
  { day: 'Fri', donations: 12 },
  { day: 'Sat', donations: 18 },
  { day: 'Sun', donations: 15 },
];

const peakHoursData = [
  { hour: '12 PM', volume: 20 },
  { hour: '3 PM', volume: 45 },
  { hour: '6 PM', volume: 80 },
  { hour: '9 PM', volume: 100 },
  { hour: '11 PM', volume: 60 },
];

const ngoData = [
  { name: 'Hope Fnd.', volume: 450 },
  { name: 'FoodBank', volume: 380 },
  { name: 'Robin Hood', volume: 220 },
];

const performanceData = [
  { name: 'Success', value: 94, fill: '#10b981' }, // emerald-500
  { name: 'Delay', value: 4, fill: '#f59e0b' },   // amber-500
  { name: 'Rejection', value: 2, fill: '#f43f5e' }, // rose-500
];

export default function DonorAnalytics({ donations }: { donations: any[] }) {
  return (
    <section aria-label="Smart Analytics Dashboard" className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
         <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-500" aria-hidden="true" />
            Intelligence & Analytics
         </h2>
         <p className="text-slate-500 mt-2 font-medium text-lg">Actionable insights to optimize your surplus redistribution.</p>
      </div>

      {/* --- SECTION 1: OVERVIEW METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" aria-label="Overview Metrics">
         {[
            { title: "Total Rescued", val: "2,450 kg", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
            { title: "Meals Served", val: "10,200", icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
            { title: "CO₂ Reduced", val: "850 kg", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-100" },
            { title: "Total Missions", val: "128", icon: Target, color: "text-orange-600", bg: "bg-orange-100" }
         ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm" tabIndex={0} aria-label={`${m.title}: ${m.val}`}>
                 <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                 </div>
                 <p className="text-4xl font-black text-slate-900 mb-1">{m.val}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.title}</p>
              </div>
            );
         })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- SECTION 2: TREND ANALYSIS --- */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-orange-500" aria-hidden="true" /> Weekly Flow Trend
              </h3>
              <select className="bg-slate-50/70 backdrop-blur-lg border-white/50 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" aria-label="Select Time Range">
                 <option>This Week</option>
                 <option>Last Week</option>
                 <option>This Month</option>
              </select>
           </div>
           <div className="flex-1 min-h-[300px] w-full" aria-label="Area chart showing weekly donation trends" role="img">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                   itemStyle={{ color: '#fb923c' }}
                 />
                 <Area type="monotone" dataKey="donations" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#trendGradient)" aria-hidden="true" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* --- SECTION 3: PREDICTION (ADVANCED) --- */}
        <div className="lg:col-span-4 p-8 flex flex-col justify-between">
           
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-8 flex items-center gap-2">
                 <Sparkles className="w-5 h-5" aria-hidden="true" /> AI Predictions
              </h3>
              
              <div className="space-y-6">
                 <div tabIndex={0} aria-label="Expected surplus tomorrow: High (25 kg predicted). Peak time: 8 PM to 10 PM.">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Expected Tomorrow</p>
                    <p className="text-3xl font-black text-slate-900 mb-2">High Volume</p>
                    <p className="text-sm text-slate-600 font-medium">Predicting ~25kg surplus based on historical weekend patterns.</p>
                 </div>
                 
                 <div tabIndex={0}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">High Demand Window</p>
                    <p className="text-2xl font-black text-slate-900 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" aria-hidden="true" /> 8 PM - 10 PM</p>
                    <p className="text-sm text-slate-600 font-medium mt-2">NGOs have 40% faster acceptance rates during this window.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- SECTION 9: ACTIONABLE RECOMMENDATIONS --- */}
        <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-sm font-black uppercase tracking-widest text-orange-900 mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-500" aria-hidden="true" /> Actionable Recommendations
           </h3>
           <div className="space-y-4">
              <div className="p-5 border-b border-slate-100 flex gap-4 items-start focus-within:ring-2 focus-within:ring-orange-300" tabIndex={0}>
                 <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl shrink-0" aria-hidden="true"><Clock className="w-5 h-5" /></div>
                 <div>
                    <h4 className="font-black text-slate-900">Shift Donations Earlier</h4>
                    <p className="text-sm text-slate-600 font-medium mt-1">Donating before 8 PM avoids the 10 PM bottleneck, reducing volunteer pickup times by an average of 14 minutes.</p>
                 </div>
              </div>
              <div className="p-5 border-b border-slate-100 flex gap-4 items-start focus-within:ring-2 focus-within:ring-orange-300" tabIndex={0}>
                 <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl shrink-0" aria-hidden="true"><Building2 className="w-5 h-5" /></div>
                 <div>
                    <h4 className="font-black text-slate-900">Prioritize "Hope Foundation"</h4>
                    <p className="text-sm text-slate-600 font-medium mt-1">They currently have high capacity and show the fastest acceptance rate (under 2 mins) in your 5km radius.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* --- SECTION 5: PERFORMANCE BREAKDOWN WITH PIE CHART --- */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" aria-hidden="true" /> Logistics Performance
           </h3>
           
           <div className="flex-1 min-h-[160px] w-full mb-6" aria-label="Pie chart showing success, delay, and rejection rates" role="img">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={performanceData}
                   cx="50%"
                   cy="50%"
                   innerRadius={50}
                   outerRadius={70}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                 >
                   {performanceData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.fill} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 text-center" tabIndex={0}>
                 <p className="text-xl font-black text-emerald-600">94%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mt-1">Success</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 text-center" tabIndex={0}>
                 <p className="text-xl font-black text-amber-600">4%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mt-1">Delay Rate</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100 text-center" tabIndex={0}>
                 <p className="text-xl font-black text-rose-600">2%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-rose-800 mt-1">Rejection</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 text-center" tabIndex={0}>
                 <p className="text-xl font-black text-blue-600">18m</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 mt-1">Avg. Pickup</p>
              </div>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* --- SECTION 6: NGO ANALYSIS WITH BAR CHART --- */}
         <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
               <Building2 className="w-5 h-5 text-orange-500" aria-hidden="true" /> NGO Partner Analysis
            </h3>
            
            <div className="flex-1 min-h-[140px] w-full mb-6" aria-label="Bar chart showing NGO volume handled" role="img">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ngoData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} width={70} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="volume" fill="#f97316" radius={[0, 8, 8, 0]} barSize={16}>
                    {ngoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Most Reliable & Fastest</p>
                  <p className="font-black text-lg text-slate-900">Hope Foundation</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">99% Success</span>
                     <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">2m Response</span>
                  </div>
               </div>
            </div>
         </div>

         {/* --- SECTION 4: INSIGHTS PANEL --- */}
         <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border-white/50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
               <PieChartIcon className="w-5 h-5 text-orange-500" aria-hidden="true" /> Smart Insights
            </h3>
            <ul className="space-y-4">
               <li className="flex items-start gap-3" tabIndex={0}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">Weekend donations are <strong className="text-slate-900">45% higher</strong> than weekdays.</p>
               </li>
               <li className="flex items-start gap-3" tabIndex={0}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">Most logistical delays occur <strong className="text-slate-900">after 10 PM</strong> due to volunteer scarcity.</p>
               </li>
               <li className="flex items-start gap-3" tabIndex={0}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">Vegan meals have a <strong className="text-slate-900">3x faster</strong> assignment rate.</p>
               </li>
            </ul>
         </div>

         {/* --- SECTION 7: COMPARISON & SECTION 8: IMPACT --- */}
         <div className="lg:col-span-4 space-y-8">
            <div className="p-8" tabIndex={0} aria-label="Comparison: +12% improvement this week. You are in the top 5% of all local donors.">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" aria-hidden="true" /> Growth Metrics
               </h3>
               <div className="flex items-end gap-3 mb-2">
                  <p className="text-4xl font-black text-emerald-600">+12%</p>
                  <p className="text-sm font-bold text-slate-500 mb-1">vs last week</p>
               </div>
               <p className="text-sm text-slate-600 font-medium">You are in the <strong className="text-slate-900">top 5%</strong> of all local donors this month!</p>
            </div>

            <div className="p-8 border-t border-slate-100" tabIndex={0}>
               <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" aria-hidden="true" /> Direct Impact
               </h3>
               <p className="text-2xl font-black text-slate-900 leading-tight">Your efforts have fed a total of <span className="text-emerald-600">10,200 people</span> so far.</p>
            </div>
         </div>

      </div>

      {/* --- SECTION 10: LOCAL TOP DONORS LEADERBOARD --- */}
      <div className="bg-white/80 backdrop-blur-xl border-white/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm" aria-label="Local Top Donors Leaderboard">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
               <Trophy className="w-8 h-8 text-orange-500" aria-hidden="true" /> Local Top Donors
            </h3>
            <div className="bg-orange-50 text-orange-900 px-6 py-3 rounded-2xl font-black text-sm tracking-wide border border-orange-100">
               <span className="text-orange-700">You are #3 this week!</span> <span className="text-emerald-500 ml-2">+2 positions</span>
            </div>
         </div>
         
         <div className="space-y-4">
            {leaderboardData.map((donor, idx) => (
               <div 
                  key={idx} 
                  tabIndex={0}
                  className={`flex items-center justify-between p-6 rounded-[2rem] transition-transform ${donor.isCurrent ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]' : 'hover:bg-slate-50'}`}
                  aria-label={`Rank ${donor.rank}: ${donor.name}, ${donor.meals} meals rescued.`}
               >
                  <div className="flex items-center gap-8">
                     <span className={`text-2xl font-black ${donor.isCurrent ? 'text-white' : 'text-slate-900'} w-4`}>{donor.rank}</span>
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${donor.isCurrent ? 'bg-orange-500/50 border border-orange-400' : 'bg-slate-100 border border-slate-200'}`}>
                        {donor.icon}
                     </div>
                     <span className={`text-xl font-black ${donor.isCurrent ? 'text-white' : 'text-slate-900'}`}>{donor.name}</span>
                  </div>
                  <div className="text-right">
                     <p className={`text-2xl font-black ${donor.isCurrent ? 'text-white' : 'text-slate-900'}`}>{donor.meals}</p>
                     <p className={`text-[10px] font-black uppercase tracking-widest ${donor.isCurrent ? 'text-orange-200' : 'text-slate-400'}`}>Meals Rescued</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </section>
  );
}
