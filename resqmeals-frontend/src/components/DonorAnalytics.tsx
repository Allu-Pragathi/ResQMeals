import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, Zap, Target, Award, Droplets, Trees, Leaf, Wind } from 'lucide-react';

interface DonorAnalyticsProps {
  donations: any[];
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#eab308'];

const DonorAnalytics: React.FC<DonorAnalyticsProps> = ({ donations }) => {
  // Process data for Pie Chart (Food Type Distribution)
  const donationByType = donations.reduce((acc: any, curr: any) => {
    acc[curr.foodType] = (acc[curr.foodType] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(donationByType).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => (b.value as number) - (a.value as number)).slice(0, 6);

  // If no real data, use some interesting mock data for demonstration
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Cooked Meals', value: 45 },
    { name: 'Vegetables', value: 25 },
    { name: 'Fruits', value: 15 },
    { name: 'Bakery', value: 10 },
    { name: 'Dairy', value: 5 },
  ];

  // Distribution by Status for Another View
  const statusData = [
    { name: 'Completed', value: donations.filter(d => d.status === 'Delivered').length || 12 },
    { name: 'In Progress', value: donations.filter(d => ['Accepted', 'Picked'].includes(d.status)).length || 5 },
    { name: 'Pending', value: donations.filter(d => d.status === 'Pending').length || 3 },
  ];

  // Weekly Trend Data
  const weeklyImpact = [
    { day: 'Mon', count: 12, weight: 45 },
    { day: 'Tue', count: 19, weight: 72 },
    { day: 'Wed', count: 15, weight: 60 },
    { day: 'Thu', count: 22, weight: 85 },
    { day: 'Fri', count: 30, weight: 110 },
    { day: 'Sat', count: 25, weight: 95 },
    { day: 'Sun', count: 18, weight: 68 },
  ];

  return (
    <div className="space-y-10 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Advanced Analytics</h2>
          <p className="text-slate-500 font-medium text-lg mt-1">Deep dive into your donation patterns and social impact metrics.</p>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="px-4 py-2 bg-primary/10 rounded-xl text-primary font-black text-xs uppercase tracking-widest border border-primary/20">
            Real-time Data
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest border border-slate-200">
            v2.4 Engine
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pie Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
              <PieIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Category Distribution</h3>
          </div>
          
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-bold text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary category</p>
              <p className="text-lg font-black text-slate-900 mt-1">{displayPieData[0].name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Diversification</p>
              <p className="text-lg font-black text-primary mt-1">High</p>
            </div>
          </div>
        </motion.div>

        {/* Bar Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Weekly Performance</h3>
            </div>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-600 focus:ring-2 focus:ring-primary/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyImpact}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Sustainability Scorecard - New Premium Feature */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group"
      >
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none group-hover:bg-white/20 transition-all duration-1000"></div>
         
         <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center xl:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-8 mx-auto xl:mx-0 shadow-lg">
                    <Leaf className="w-4 h-4" />
                    Environmental ROI Protocol
                </div>
                <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-[1.1]">
                    Your Sustainability <br />
                    <span className="text-orange-100">Scorecard.</span>
                </h3>
                <p className="text-lg text-orange-50 font-medium opacity-90 leading-relaxed">
                   Every kg of food you save has a ripple effect on our planet. We've calculated your real-time contribution to a greener earth.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full xl:w-auto">
                {[
                    { label: "Water Saved", value: "45,200 L", detail: "Freshwater conservation", icon: <Droplets className="w-7 h-7" />, delay: 0.1 },
                    { label: "Trees Saved", value: "12 Trees", detail: "Oxygen production equiv.", icon: <Trees className="w-7 h-7" />, delay: 0.2 },
                    { label: "CO2 Credits", value: "34.5 kg", detail: "Carbon footprint reduced", icon: <Wind className="w-7 h-7" />, delay: 0.3 }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: item.delay }}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] hover:bg-white/20 transition-all shadow-xl group/item"
                    >
                        <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover/item:scale-110 transition-transform">
                            {item.icon}
                        </div>
                        <p className="text-3xl font-black mb-1">{item.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 mb-2">{item.label}</p>
                        <p className="text-xs font-medium text-orange-50/70">{item.detail}</p>
                    </motion.div>
                ))}
            </div>
         </div>
      </motion.div>

      {/* Advanced Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: "Peak Efficiency", 
            value: "14:00 - 16:00", 
            detail: "Highest pickup success rate", 
            icon: <Zap className="w-5 h-5" />, 
            color: "from-amber-400 to-orange-500",
            delay: 0.2
          },
          { 
            title: "Response Latency", 
            value: "12.4 Min", 
            detail: "NGO acceptance average", 
            icon: <Target className="w-5 h-5" />, 
            color: "from-blue-400 to-indigo-500",
            delay: 0.3
          },
          { 
            title: "Social ROI", 
            value: "x4.2", 
            detail: "Community value delivered", 
            icon: <Award className="w-5 h-5" />, 
            color: "from-emerald-400 to-teal-500",
            delay: 0.4
          }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: card.delay }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group"
          >
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors mb-6">
              {card.icon}
            </div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{card.title}</h4>
            <p className="text-3xl font-black text-slate-900 mb-2">{card.value}</p>
            <p className="text-sm font-medium text-slate-500">{card.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DonorAnalytics;
