import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Phone, Mail, Award, TrendingUp, Zap, Clock, Utensils,
  Heart, Leaf, Star, Building2, Bell, CheckCircle2, Flame, Package
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
    <section aria-label="Donor Profile Dashboard" className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- SECTION 1: PROFILE HEADER --- */}
      <div className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="h-32 w-32 rounded-[2rem] bg-orange-100 text-orange-600 flex items-center justify-center border-4 border-white shadow-xl shrink-0 overflow-hidden relative" aria-hidden="true">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Donor'}&backgroundColor=f97316&textColor=ffffff`} alt={`${user?.name || 'Donor'} Profile Avatar`} className="h-full w-full object-cover" />
           </div>
           
           <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3 mb-2">
                 {user?.name || 'Premium Donor'}
                 <ShieldCheck className="w-6 h-6 text-emerald-500" aria-hidden="true" />
              </h2>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm mb-4">
                 <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" aria-hidden="true" /> {user?.email || 'donor@example.com'}</span>
                 <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" aria-hidden="true" /> {user?.phone || '+91 98765 43210'}</span>
                 <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden="true" /> {user?.address || 'Hyderabad, India'}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2" aria-label="Verification Badges">
                 <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-100"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Phone Verified</span>
                 <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-100"><CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Location Verified</span>
                 <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-orange-100"><Star className="w-3 h-3" aria-hidden="true" /> Verified Donor</span>
              </div>
           </div>

           <button onClick={() => setIsEditingProfile(true)} aria-expanded={isEditingProfile} aria-label="Open Edit Profile Settings Form" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl shrink-0 focus:outline-none focus:ring-4 focus:ring-slate-400">
              Edit Settings
           </button>
        </div>
      </div>

      {/* --- EDIT PROFILE FORM (ACCESSIBLE) --- */}
      {isEditingProfile && (
        <form onSubmit={handleProfileUpdate} aria-label="Edit Profile Details Form" className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
           <h3 className="text-xl font-black text-slate-900 mb-6">Edit Organization Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label htmlFor="edit-name" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-widest">Name</label>
                 <input id="edit-name" value={editProfileData.name} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800" aria-required="true" />
              </div>
              <div className="space-y-2">
                 <label htmlFor="edit-email" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-widest">Email</label>
                 <input id="edit-email" type="email" value={editProfileData.email} onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800" aria-required="true" />
              </div>
              <div className="space-y-2">
                 <label htmlFor="edit-phone" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-widest">Phone</label>
                 <input id="edit-phone" type="tel" value={editProfileData.phone} onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800" aria-required="true" />
              </div>
              <div className="space-y-2">
                 <label htmlFor="edit-address" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-widest">Address</label>
                 <input id="edit-address" value={editProfileData.address} onChange={e => setEditProfileData({...editProfileData, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800" aria-required="true" />
              </div>
           </div>
           <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
              <button type="button" onClick={() => setIsEditingProfile(false)} aria-label="Cancel Editing Profile" className="px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-300">Cancel</button>
              <button type="submit" disabled={isUpdatingProfile} aria-label="Save Profile Changes" aria-busy={isUpdatingProfile} className="px-8 py-3 rounded-2xl font-black text-white bg-orange-600 hover:bg-orange-700 transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50 flex items-center gap-2">
                 {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* --- SECTION 2: TRUST SCORE --- */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-orange-500/20 group-hover:rotate-12 transition-transform duration-700" aria-hidden="true"><Award className="w-32 h-32" /></div>
              
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Trust Level</h3>
              <div className="flex items-end gap-3 mb-6">
                 <p className="text-5xl font-black text-white" aria-label={`Trust Score: ${trustScore}%`}>{trustScore}%</p>
                 <p className="text-sm font-bold text-emerald-400 mb-1" aria-label="Status: Highly Reliable">Highly Reliable</p>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={trustScore} aria-valuemin={0} aria-valuemax={100} aria-label="Trust Score Progress">
                 <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full w-[92%]"></div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Top 8% of all donors in your city.</p>

              <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Tier</p>
                    <p className="text-lg font-black text-amber-400 flex items-center gap-2"><Award className="w-5 h-5" /> Gold Status</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Next Tier</p>
                    <p className="text-sm font-bold text-slate-300">Platinum (95%)</p>
                 </div>
              </div>
           </div>

           {/* --- SECTION 7: GAMIFICATION --- */}
           <div className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" aria-hidden="true" /> Achievements</h3>
              
              <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-4 border border-orange-100 mb-6" tabIndex={0} aria-label="Achievement: 4-Week Streak! Donated consistently every week.">
                 <div className="h-12 w-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30" aria-hidden="true"><Flame className="w-6 h-6" /></div>
                 <div>
                    <p className="font-black text-slate-900">4-Week Streak!</p>
                    <p className="text-xs font-bold text-orange-700 mt-0.5">Donated consistently every week.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="text-center p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:border-orange-200 transition-colors" tabIndex={0} aria-label="Badge: Top Donor">
                    <div className="w-10 h-10 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2" aria-hidden="true"><Star className="w-5 h-5" /></div>
                    <p className="text-xs font-black text-slate-900">Top Donor</p>
                 </div>
                 <div className="text-center p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:border-blue-200 transition-colors" tabIndex={0} aria-label="Badge: Fast Responder">
                    <div className="w-10 h-10 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2" aria-hidden="true"><Clock className="w-5 h-5" /></div>
                    <p className="text-xs font-black text-slate-900">Fast Responder</p>
                 </div>
              </div>
           </div>

           {/* --- SECTION 6: PREFERENCES --- */}
           <div className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-slate-400" aria-hidden="true" /> Preferences</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600" id="pref-urgent">Urgent Notifications</span>
                    <button role="switch" aria-checked="true" aria-labelledby="pref-urgent" className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-200"><div className="absolute right-1 top-1 w-4 h-4 bg-white/70 backdrop-blur-2xl border-white/60 rounded-full"></div></button>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600" id="pref-weekly">Weekly Impact Report</span>
                    <button role="switch" aria-checked="true" aria-labelledby="pref-weekly" className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-200"><div className="absolute right-1 top-1 w-4 h-4 bg-white/70 backdrop-blur-2xl border-white/60 rounded-full"></div></button>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600" id="pref-auto">Accept Auto-Matching</span>
                    <button role="switch" aria-checked="true" aria-labelledby="pref-auto" className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-200"><div className="absolute right-1 top-1 w-4 h-4 bg-white/70 backdrop-blur-2xl border-white/60 rounded-full"></div></button>
                 </div>
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* --- SECTION 4: IMPACT SUMMARY --- */}
           <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 mb-2 flex items-center gap-2"><Heart className="w-4 h-4" aria-hidden="true" /> Human Impact</h3>
                 <p className="text-2xl font-black text-slate-900 mb-1" tabIndex={0}>You helped feed <span className="text-emerald-600">1,240 people</span>.</p>
                 <p className="text-emerald-700 font-medium" tabIndex={0}>Your surplus has directly sustained families across the city.</p>
              </div>
              <div className="flex gap-4 shrink-0">
                 <div className="bg-white/70 backdrop-blur-2xl border-white/60 p-4 rounded-2xl shadow-sm text-center min-w-[120px]" tabIndex={0} aria-label="300 kilograms of Waste Reduced">
                    <Leaf className="w-6 h-6 text-emerald-500 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-2xl font-black text-slate-900">300<span className="text-sm text-slate-500" aria-hidden="true">kg</span></p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Waste Reduced</p>
                 </div>
                 <div className="bg-white/70 backdrop-blur-2xl border-white/60 p-4 rounded-2xl shadow-sm text-center min-w-[120px]" tabIndex={0} aria-label="124 kilograms of CO2 Saved">
                    <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-2xl font-black text-slate-900">124<span className="text-sm text-slate-500" aria-hidden="true">kg</span></p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">CO₂ Saved</p>
                 </div>
              </div>
           </div>

           {/* --- SECTION 3: PERFORMANCE METRICS --- */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Performance Metrics">
              {[
                 { label: "Total Rescues", val: "45", icon: Package },
                 { label: "Success Rate", val: "98%", icon: ShieldCheck },
                 { label: "Avg. Pickup", val: "18m", icon: Clock },
                 { label: "Acceptance", val: "100%", icon: CheckCircle2 }
              ].map((m, i) => {
                 const Icon = m.icon;
                 return (
                 <div key={i} className="bg-white/70 backdrop-blur-2xl border-white/60 p-6 rounded-3xl border border-slate-100 shadow-sm text-center group hover:border-orange-200 transition-colors focus-within:border-orange-400" tabIndex={0} aria-label={`${m.label}: ${m.val}`}>
                    <Icon className="w-6 h-6 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-3xl font-black text-slate-900 mb-1">{m.val}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</p>
                 </div>
                 );
              })}
           </div>

           {/* --- SECTION 5: BEHAVIOR INSIGHTS & SECTION 8: ACTIVITY SUMMARY --- */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" aria-hidden="true" /> Behavioral Insights</h3>
                 <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100" tabIndex={0}>
                       <div className="bg-orange-100 text-orange-600 p-2 rounded-xl shrink-0" aria-hidden="true"><Utensils className="w-5 h-5" /></div>
                       <div>
                          <p className="font-black text-slate-900 text-sm">Preferred Food Type</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">You donate mostly <span className="text-orange-600">Cooked Meals</span>.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100" tabIndex={0}>
                       <div className="bg-blue-100 text-blue-600 p-2 rounded-xl shrink-0" aria-hidden="true"><Clock className="w-5 h-5" /></div>
                       <div>
                          <p className="font-black text-slate-900 text-sm">Peak Schedule</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">Highest activity recorded at <span className="text-blue-600">9:00 PM</span>.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100" tabIndex={0}>
                       <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl shrink-0" aria-hidden="true"><Building2 className="w-5 h-5" /></div>
                       <div>
                          <p className="font-black text-slate-900 text-sm">Top NGO Partner</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">Frequently matched with <span className="text-emerald-600">Hope Foundation</span>.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500" aria-hidden="true" /> Monthly Impact Trend</h3>
                 
                 <div className="flex-1 min-h-[200px] w-full" aria-label="Line chart showing monthly impact trend" role="img">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                         itemStyle={{ color: '#fb923c' }}
                         cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="value" 
                         stroke="#f97316" 
                         strokeWidth={4} 
                         fillOpacity={1} 
                         fill="url(#colorVal)" 
                         aria-hidden="true"
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </section>
  );
}
