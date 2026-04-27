import sys

filepath = r'c:\Users\praga\Downloads\ResQMeals\resqmeals-frontend\src\pages\VolunteerDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if ') : (' in line and 'section className="bg-white rounded-3xl p-8 md:p-12' in lines[i+1]:
        start_idx = i
        break

if start_idx == -1:
    print('Could not find start idx.')
    sys.exit(1)

end_idx = -1
for i in range(start_idx, len(lines)):
    if '            )}' in lines[i] and '        </div>' in lines[i+1]:
        end_idx = i
        break

if end_idx == -1:
    print('Could not find end idx.')
    sys.exit(1)

new_content = """            ) : (
                <div className="space-y-6 animate-in fade-in duration-700 pb-12 max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                                <User className="w-4 h-4" /> Volunteer Identity
                            </p>
                            <h1 className="text-3xl font-black text-slate-900 mt-1">
                                Profile & Settings
                            </h1>
                        </div>
                    </header>

                    {/* Profile Hero & Trust Score */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShieldCheck className="w-64 h-64" /></div>
                        
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative group">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left z-10">
                            <h2 className="text-3xl font-black text-slate-900">{user?.name || 'Volunteer Hero'}</h2>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                                <MapPin className="w-4 h-4" /> Hyderabad, TS • <span className="text-orange-600 font-bold">Elite Courier</span>
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center md:text-left">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                        <span className="text-2xl font-black text-slate-900">92<span className="text-sm text-slate-400 font-medium">/100</span></span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center md:text-left">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Rescues</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <Truck className="w-6 h-6 text-orange-500" />
                                        <span className="text-2xl font-black text-slate-900">{myMissions.length + 124}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center md:text-left">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Meals Delivered</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <Award className="w-6 h-6 text-blue-500" />
                                        <span className="text-2xl font-black text-slate-900">1,250</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Performance Metrics */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Performance Metrics
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1"><span>Completion Rate</span><span className="text-slate-900">98%</span></div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[98%] rounded-full"></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1"><span>On-Time Delivery</span><span className="text-slate-900">95%</span></div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[95%] rounded-full"></div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1"><span>Avg. Pickup Time</span><span className="text-slate-900">4.2m</span></div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[85%] rounded-full"></div></div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Section */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                                    <Shield className="w-5 h-5 text-blue-500" /> Identity Verification
                                </h3>
                                <ProfileVerificationCenter />
                            </div>

                            {/* Availability Section */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-purple-500" /> Availability Slots
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isAvailable ? 'Online' : 'Offline'}</span>
                                        <button 
                                            onClick={() => setIsAvailable(!isAvailable)} 
                                            className={`w-12 h-6 rounded-full transition-colors relative ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            aria-label="Toggle Online Status"
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-orange-500 bg-orange-50 text-orange-700 font-bold transition-all">
                                        <Clock className="w-5 h-5 mb-2" /> Morning
                                        <span className="text-[10px] font-medium opacity-80 mt-1">8 AM - 12 PM</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all">
                                        <Clock className="w-5 h-5 mb-2" /> Afternoon
                                        <span className="text-[10px] font-medium opacity-80 mt-1">12 PM - 4 PM</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-orange-500 bg-orange-50 text-orange-700 font-bold transition-all">
                                        <Clock className="w-5 h-5 mb-2" /> Evening
                                        <span className="text-[10px] font-medium opacity-80 mt-1">4 PM - 9 PM</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            
                            {/* AI Insights */}
                            <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Brain className="w-24 h-24 text-orange-500" /></div>
                                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 relative z-10">
                                    <Brain className="w-5 h-5 text-orange-500" /> Smart Insights
                                </h3>
                                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-3 relative z-10">
                                    <div className="mt-0.5"><Zap className="w-4 h-4 text-amber-500" /></div>
                                    <p className="text-sm font-semibold text-slate-700 leading-snug">You perform best in <span className="text-slate-900 font-black">evening missions</span>. Consider keeping your evening slots open!</p>
                                </div>
                            </div>

                            {/* Location & Radius Settings */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <Sliders className="w-5 h-5 text-slate-600" /> Location Preferences
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Default City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="text" value="Hyderabad" readOnly className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                            <span>Service Radius</span>
                                            <span className="text-orange-600">5 km</span>
                                        </div>
                                        <input type="range" min="1" max="20" defaultValue="5" className="w-full accent-orange-500" />
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                            <span>1 km</span><span>20 km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Preferences */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <BellRing className="w-5 h-5 text-amber-500" /> Notifications
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Urgent Alerts</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Expiring food within 5km</p>
                                        </div>
                                        <div className="w-10 h-5 bg-orange-500 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Mission Updates</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Status changes & OTPs</p>
                                        </div>
                                        <div className="w-10 h-5 bg-orange-500 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Platform News</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Monthly impact reports</p>
                                        </div>
                                        <div className="w-10 h-5 bg-slate-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                                    </label>
                                </div>
                            </div>

                            {/* Security & Danger Zone */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <Lock className="w-5 h-5 text-slate-600" /> Security
                                </h3>
                                <div className="space-y-3">
                                    <button className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors text-left flex justify-between items-center">
                                        Change Password <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors text-left flex justify-between items-center">
                                        Logout from all devices <LogOut className="w-4 h-4 opacity-50" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
"""

lines = lines[:start_idx] + new_content.splitlines(keepends=True) + lines[end_idx+1:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Updated volunteer profile successfully.')
