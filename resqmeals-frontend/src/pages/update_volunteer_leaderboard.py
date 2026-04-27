import sys

filepath = r'c:\Users\praga\Downloads\ResQMeals\resqmeals-frontend\src\pages\VolunteerDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if 'if (isLeaderboard) {' in line:
        start_idx = i
        break

if start_idx == -1:
    print('Could not find start idx.')
    sys.exit(1)

# Find the end of `if (isLeaderboard)` block
# Since we know `if (isLeaderboard) { ... }` ends right before `if (isHome) {` (which we removed, wait!)
# The block ends around line 500, followed by `    const renderMapOverlay = () => {`.
end_idx = -1
for i in range(start_idx, len(lines)):
    if 'const renderMapOverlay = () => {' in lines[i]:
        end_idx = i - 1
        break

while end_idx > start_idx and lines[end_idx].strip() == '':
    end_idx -= 1

if end_idx == -1:
    print('Could not find end idx.')
    sys.exit(1)

print(f'Replacing lines {start_idx} to {end_idx}')

new_content = """    if (isLeaderboard) {
        // --- LIVE DATA COMPUTATION ---
        
        // 1. Food Categories
        let foodTypesMap: Record<string, number> = {};
        donations.forEach(d => {
            if (d.status !== 'Pending') {
                foodTypesMap[d.foodType] = (foodTypesMap[d.foodType] || 0) + 1;
            }
        });
        const liveFoodTypesData = Object.keys(foodTypesMap).map(k => ({ name: k, value: foodTypesMap[k] }));
        const foodTypesData = liveFoodTypesData.length > 0 ? liveFoodTypesData : [
            { name: 'Cooked Meals', value: 45 },
            { name: 'Raw Produce', value: 25 },
            { name: 'Packaged', value: 20 },
            { name: 'Baked Goods', value: 10 },
        ];

        // 2. Top Locations (Heatmap Alternative)
        let donorsMap: Record<string, number> = {};
        donations.forEach(d => {
            if (d.donor?.name && d.status !== 'Pending') {
                donorsMap[d.donor.name] = (donorsMap[d.donor.name] || 0) + 1;
            }
        });
        const liveDonorsData = Object.keys(donorsMap).map(k => ({ name: k, pickups: donorsMap[k] })).sort((a,b) => b.pickups - a.pickups).slice(0, 5);
        const topRestaurantsData = liveDonorsData.length > 0 ? liveDonorsData : [
            { name: 'Banjara Hills', pickups: 35 },
            { name: 'Jubilee Hills', pickups: 28 },
            { name: 'Madhapur', pickups: 22 },
            { name: 'Gachibowli', pickups: 15 },
            { name: 'Kondapur', pickups: 12 },
        ];

        // 3. User Points Calculation
        const liveUserPoints = 1250 + (myMissions.length * 50) + (donations.filter(d => d.status === 'Delivered').length * 100);

        const leaderboardData = [
            { rank: 1, name: 'Sarah Jenkins', pts: 4200, isMe: false },
            { rank: 2, name: 'David Smith', pts: 3850, isMe: false },
            { rank: 3, name: user?.name || 'You', pts: liveUserPoints, isMe: true },
            { rank: 4, name: 'Michael O.', pts: 900, isMe: false },
            { rank: 5, name: 'Emily Clark', pts: 650, isMe: false },
        ].sort((a, b) => b.pts - a.pts).map((v, i) => ({ ...v, rank: i + 1 }));

        const myRankInfo = leaderboardData.find(v => v.isMe) || { rank: 3, pts: liveUserPoints };
        const nextRankUser = leaderboardData.find(v => v.rank === myRankInfo.rank - 1);
        const ptsToNextRank = nextRankUser ? nextRankUser.pts - myRankInfo.pts + 10 : 0;

        // 4. Monthly Deliveries 
        const deliveriesData = [
            { week: 'W1', deliveries: 12 },
            { week: 'W2', deliveries: 19 },
            { week: 'W3', deliveries: 15 },
            { week: 'W4', deliveries: 22 },
            { week: 'W5', deliveries: 28 },
            { week: 'W6', deliveries: 24 + myMissions.length },
        ];

        const COLORS = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

        return (
            <div className="space-y-6 animate-in fade-in duration-700 pb-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> Impact Analytics
                        </p>
                        <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-3">
                            Leaderboard & Performance 
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Updating
                            </span>
                        </h1>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                        <button className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg shadow-sm">Weekly</button>
                        <button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold rounded-lg transition-colors">Monthly</button>
                        <button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold rounded-lg transition-colors">All-time</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Top 3 Metric Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Personal Performance */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Trophy className="w-24 h-24" /></div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Current Rank</h3>
                                <div className="flex items-end gap-3 mb-2">
                                    <h2 className="text-4xl font-black text-slate-900">#{myRankInfo.rank}</h2>
                                    <span className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg mb-1 border border-emerald-100">
                                        <TrendingUp className="w-3 h-3 mr-1" /> +1 this week
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-orange-600 flex items-center gap-1.5 mt-4">
                                    <Star className="w-4 h-4" /> {myRankInfo.pts.toLocaleString()} Total Points
                                </p>
                            </div>

                            {/* Next Milestone */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> Next Milestone</h3>
                                <div className="mb-4">
                                    <h2 className="text-2xl font-black text-white">{ptsToNextRank > 0 ? `${ptsToNextRank} points` : 'You are #1!'}</h2>
                                    <p className="text-sm font-medium text-slate-300">{ptsToNextRank > 0 ? `to reach Top ${myRankInfo.rank - 1}` : 'Keep up the great work!'}</p>
                                </div>
                                <button onClick={() => navigate('/volunteer/missions')} className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20">
                                    View Suggested Missions
                                </button>
                            </div>

                            {/* Performance Breakdown */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Volunteer Score</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="10" strokeDasharray="250 283" strokeLinecap="round" className="animate-pulse-slow" />
                                        </svg>
                                        <span className="absolute text-xl font-black text-slate-900">92</span>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1"><span>Speed</span><span className="text-emerald-600">95%</span></div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[95%] rounded-full"></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1"><span>Reliability</span><span className="text-blue-600">98%</span></div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[98%] rounded-full"></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Smart Insights & Achievements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-orange-500" /> AI Insights
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white p-3.5 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-3">
                                        <div className="mt-0.5"><Zap className="w-4 h-4 text-amber-500" /></div>
                                        <p className="text-sm font-semibold text-slate-700">You perform best in <span className="text-slate-900 font-black">evening missions</span> (6 PM - 9 PM).</p>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-3">
                                        <div className="mt-0.5"><MapPin className="w-4 h-4 text-blue-500" /></div>
                                        <p className="text-sm font-semibold text-slate-700">You accept <span className="text-slate-900 font-black">80%</span> of all nearby tasks within 3km.</p>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-3">
                                        <div className="mt-0.5"><Truck className="w-4 h-4 text-emerald-500" /></div>
                                        <p className="text-sm font-semibold text-slate-700">Your delivery speed is faster than <span className="text-slate-900 font-black">75%</span> of volunteers.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Medal className="w-5 h-5 text-blue-500" /> Achievements
                                    </h3>
                                    <button className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm opacity-100">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                                        <span className="text-[10px] font-black uppercase text-center text-slate-700 leading-tight">First<br/>Rescue</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm opacity-100">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                                        <span className="text-[10px] font-black uppercase text-center text-slate-700 leading-tight">Night<br/>Owl</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm opacity-50 grayscale">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Award className="w-5 h-5" /></div>
                                        <span className="text-[10px] font-black uppercase text-center text-slate-700 leading-tight">Elite<br/>Courier</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1"><span>Next: Elite Courier</span><span>24/50</span></div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-[48%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Points Distribution */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Top 5 Points Distribution</h3>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={leaderboardData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} width={90} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="pts" radius={[0, 4, 4, 0]} barSize={16}>
                                                {leaderboardData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={leaderboardData[index].isMe ? '#f97316' : '#cbd5e1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Weekly Trend */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Delivery Volume Trend</h3>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={deliveriesData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="deliveries" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorDeliveries)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Leaderboard List */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" /> Global Ranking
                                </h3>
                                <button className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg">View Top 100</button>
                            </div>
                            <div className="space-y-3 flex-1">
                                {leaderboardData.map(v => (
                                    <div key={v.name} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${v.isMe ? 'bg-orange-50 border-orange-200 shadow-sm scale-[1.02]' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${v.rank === 1 ? 'bg-yellow-100 text-yellow-600 shadow-sm' : v.rank === 2 ? 'bg-slate-200 text-slate-600' : v.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {v.rank}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                                    {v.name} 
                                                    {v.isMe && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">{v.rank === 1 ? 'Hero status' : v.isMe ? 'Rising star' : 'Active volunteer'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-700 text-sm">{v.pts.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Locations Heatmap List */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-500" /> Top Hotspots
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Areas with most completed rescues</p>
                                </div>
                            </div>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topRestaurantsData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} hide />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} width={80} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="pickups" radius={[0, 4, 4, 0]} barSize={12}>
                                            {topRestaurantsData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Food Categories */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                            <div className="mb-2">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-emerald-500" /> Food Rescued
                                </h3>
                            </div>
                            <div className="h-[150px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={foodTypesData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {foodTypesData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-2">
                                {foodTypesData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
"""

new_lines = new_content.splitlines(keepends=True)
if not new_lines[-1].endswith('\n'):
    new_lines[-1] += '\n'

lines = lines[:start_idx] + new_lines + lines[end_idx+1:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Update successful.')
