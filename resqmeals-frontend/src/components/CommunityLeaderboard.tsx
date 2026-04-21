import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, TrendingUp, Users } from 'lucide-react';

const CommunityLeaderboard = () => {
  const topDonors = [
    { name: "Taj Mahal Palace", meals: 1240, level: 14, growth: "+12%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taj" },
    { name: "Oberoi Bengaluru", meals: 980, level: 12, growth: "+8%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oberoi" },
    { name: "ITC Maurya", meals: 850, level: 11, growth: "+15%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ITC" },
    { name: "JW Marriott", meals: 720, level: 9, growth: "+5%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JW" },
    { name: "The Park", meals: 640, level: 8, growth: "+10%", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Park" },
  ];

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-600 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          Local Leaderboard
        </h3>
        <div className="px-4 py-2 bg-slate-50 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest border border-slate-100">
          Regional / Q2
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {topDonors.map((donor, idx) => (
          <motion.div
            key={donor.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-[1.75rem] border ${idx === 0 ? 'bg-orange-50 border-orange-100 shadow-sm ring-1 ring-orange-500/10' : 'bg-white border-transparent hover:bg-slate-50 transition-colors'}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={donor.avatar} alt={donor.name} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm" />
                {idx === 0 && (
                   <div className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1 border-2 border-white shadow-lg">
                      <Award className="w-3 h-3" />
                   </div>
                )}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm leading-tight">{donor.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Level {donor.level} Champion</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">{donor.meals.toLocaleString()}</p>
              <p className={`text-[10px] font-black uppercase tracking-tighter mt-0.5 ${idx === 0 ? 'text-orange-600' : 'text-emerald-500'}`}>{donor.growth}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 group cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Users className="w-5 h-5" />
             </div>
             <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Global Ranking</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Top 10% Contributor</p>
             </div>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderboard;
