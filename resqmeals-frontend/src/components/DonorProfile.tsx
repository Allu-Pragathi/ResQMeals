import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Phone, Mail, Award, TrendingUp, Zap, Clock, Utensils,
  Heart, Leaf, Star, Building2, Bell, CheckCircle2, Flame, Package, ChevronRight, Settings, ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const activityData = [
  { month: 'Jan', value: 20 },
  { month: 'Feb', value: 35 },
  { month: 'Mar', value: 25 },
  { month: 'Apr', value: 50 },
  { month: 'May', value: 45 },
  { month: 'Jun', value: 75 },
];

interface DonorProfileProps {
  user: any;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  editProfileData: any;
  setEditProfileData: (data: any) => void;
  isUpdatingProfile: boolean;
  handleProfileUpdate: (e: React.FormEvent) => void;
}

export default function DonorProfile({ 
  user, isEditingProfile, setIsEditingProfile, editProfileData, setEditProfileData, isUpdatingProfile, handleProfileUpdate 
}: DonorProfileProps) {
  const trustScore = 92;
  
  return (
    <section aria-label="Donor Profile Dashboard" className="space-y-12 pb-24">
      
      {/* --- ELEGANT HEADER --- */}
      <div className="relative pt-20">
         {/* Background Decoration */}
         <div className="absolute top-0 left-0 right-0 h-48 bg-slate-900 rounded-[3rem] -z-10"></div>
         
         <div className="w-full">
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center md:items-end gap-10">
               <div className="relative -mt-24">
                  <div className="h-40 w-40 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                     <div className="h-full w-full rounded-[2rem] bg-orange-100 overflow-hidden border-4 border-slate-50">
                        <img 
                           src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Donor'}&backgroundColor=f97316&textColor=ffffff`} 
                           alt="Avatar" 
                           className="h-full w-full object-cover" 
                        />
                     </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
               </div>
               
               <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                     <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        {user?.name || 'Premium Member'}
                     </h2>
                     <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        <Star className="w-3 h-3" /> Gold_Tier
                     </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 font-bold text-sm">
                     <span className="flex items-center gap-2"><Mail className="w-4 h-4 opacity-40" /> {user?.email}</span>
                     <span className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-40" /> {user?.address || 'Location Not Set'}</span>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button 
                     onClick={() => setIsEditingProfile(true)}
                     className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20"
                  >
                     Settings
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* LEFT: STATUS & ACHIEVEMENTS */}
         <div className="lg:col-span-5 space-y-10">
            
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Reputation_Score</h3>
               <div className="flex items-center gap-8 mb-8">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                     <svg className="h-full w-full rotate-[-90deg]">
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="276" strokeDashoffset={276 - (276 * trustScore) / 100} className="text-orange-500" />
                     </svg>
                     <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-900">{trustScore}%</span>
                  </div>
                  <div>
                     <p className="text-lg font-black text-slate-900">Highly Reliable</p>
                     <p className="text-sm font-bold text-slate-500 mt-1">Based on 45 successful missions</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                     <span className="text-xs font-bold text-slate-500">Response Rate</span>
                     <span className="text-sm font-black text-slate-900">98%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                     <span className="text-xs font-bold text-slate-500">Avg Quality Score</span>
                     <span className="text-sm font-black text-slate-900">4.9/5</span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-4">Badges_Earned</h3>
               <div className="grid grid-cols-2 gap-4">
                  {[
                     { label: "Elite Donor", icon: <Award className="text-amber-500" />, bg: "bg-amber-50" },
                     { label: "Fast Move", icon: <Zap className="text-blue-500" />, bg: "bg-blue-50" },
                     { label: "Community", icon: <Heart className="text-rose-500" />, bg: "bg-rose-50" },
                     { label: "Eco-Friendly", icon: <Leaf className="text-emerald-500" />, bg: "bg-emerald-50" }
                  ].map((badge, i) => (
                     <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 hover:border-slate-300 transition-colors cursor-default">
                        <div className={`h-12 w-12 rounded-2xl ${badge.bg} flex items-center justify-center`}>
                           {badge.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{badge.label}</span>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* RIGHT: IMPACT & HISTORY */}
         <div className="lg:col-span-7 space-y-10">
            
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-10">Social_Impact_Summary</h3>
               <div className="grid grid-cols-2 gap-10">
                  <div>
                     <p className="text-5xl font-black mb-2 tracking-tighter">1,240</p>
                     <p className="text-sm font-bold text-slate-400">Total Lives Impacted</p>
                  </div>
                  <div>
                     <p className="text-5xl font-black mb-2 tracking-tighter">300<span className="text-xl">kg</span></p>
                     <p className="text-sm font-bold text-slate-400">Surplus Saved from Landfill</p>
                  </div>
               </div>
               <div className="mt-12 pt-10 border-t border-white/10 flex justify-between items-center">
                  <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+50}`} alt="impact" />
                        </div>
                     ))}
                     <div className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black">+12</div>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
                     View Impact Certificate <ExternalLink className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Activity_Timeline</h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={activityData}>
                        <defs>
                           <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        />
                        <Area 
                           type="monotone" 
                           dataKey="value" 
                           stroke="#f97316" 
                           strokeWidth={4} 
                           fill="url(#impactGradient)" 
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

         </div>

      </div>

      {/* --- EDIT MODAL OVERLAY --- */}
      {isEditingProfile && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditingProfile(false)}></div>
            <motion.form 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               onSubmit={handleProfileUpdate} 
               className="bg-white rounded-[3rem] p-12 max-w-2xl w-full relative z-10 shadow-2xl"
            >
               <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Profile Settings</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Organization Name</label>
                     <input 
                        value={editProfileData.name} 
                        onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800 transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Email</label>
                     <input 
                        type="email" 
                        value={editProfileData.email} 
                        onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800 transition-all" 
                     />
                  </div>
               </div>
               <div className="mt-12 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
                  <button 
                     type="submit" 
                     disabled={isUpdatingProfile} 
                     className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50"
                  >
                     {isUpdatingProfile ? 'Saving...' : 'Save Settings'}
                  </button>
               </div>
            </motion.form>
         </div>
      )}

    </section>
  );
}
