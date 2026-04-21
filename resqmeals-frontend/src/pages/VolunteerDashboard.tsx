import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { MapPin, Clock, Trophy, Truck, CheckCircle, Bell, User, Mail, Phone, Loader2, UserCog } from 'lucide-react'
import ProfileVerificationCenter from '../components/ProfileVerificationCenter'
import VerificationGate from '../components/VerificationGate'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix generic map marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to calculate distance in KM
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const VolunteerDashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [isAvailable, setIsAvailable] = useState(true)
    const [activeTab, setActiveTab] = useState<'open' | 'my-tasks'>('open')

    const [donations, setDonations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [trackingDonationId, setTrackingDonationId] = useState<string | null>(null)
    const [claimedMissions, setClaimedMissions] = useState<string[]>(() => {
        const saved = localStorage.getItem('resqmeals_claimed_missions');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeMapTask, setActiveMapTask] = useState<any>(null)

    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editProfileData, setEditProfileData] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        password: ''
    })
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

    const isProfile = location.pathname.includes('profile')
    const isLeaderboard = location.pathname.includes('leaderboard')
    const isHome = location.pathname.endsWith('/home') || location.pathname === '/volunteer' || location.pathname === '/volunteer/'

    const fetchMissions = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/donations')
            
            // Enrich donations with distance if user coordinates exist
            let processedDonations = res.data.donations.map((d: any) => ({ ...d, distance: null }));
            const currentUser = localStorage.getItem('resqmeals_current_user');
            if (currentUser) {
                const parsedUser = JSON.parse(currentUser);
                if (parsedUser.latitude && parsedUser.longitude) {
                    processedDonations = processedDonations.map((d: any) => ({
                        ...d,
                        distance: d.latitude && d.longitude 
                            ? getDistance(parsedUser.latitude, parsedUser.longitude, d.latitude, d.longitude)
                            : null
                    }));
                }
            }

            setDonations(processedDonations)
        } catch (err) {
            console.error('Failed to fetch missions', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Live Tracking effect
    useEffect(() => {
        let watchId: number | null = null;

        if (trackingDonationId) {
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            await api.patch(`/donations/${trackingDonationId}/location`, {
                                latitude,
                                longitude
                            });
                        } catch (err) {
                            console.error('Failed to update tracking location', err);
                        }
                    },
                    (error) => console.error('Geolocation tracking error', error),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [trackingDonationId]);

    useEffect(() => {
        const saved = localStorage.getItem('resqmeals_current_user')
        if (saved) {
            const parsed = JSON.parse(saved);
            setUser(parsed);
            setEditProfileData({
                name: parsed.name || '',
                email: parsed.email || '',
                address: parsed.address || '',
                phone: parsed.phone || '+91 98765 00000',
                password: ''
            })
        }
        // One unified fetch
        fetchMissions()
    }, [])


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

    const handleAcceptMission = (id: string) => {
        if (!claimedMissions.includes(id)) {
            const updatedClaimed = [...claimedMissions, id];
            setClaimedMissions(updatedClaimed);
            localStorage.setItem('resqmeals_claimed_missions', JSON.stringify(updatedClaimed));
        }
        setActiveTab('my-tasks');
        alert('Mission successfully assigned to you! Please head to the donor location to retrieve the food.');
    }

    const handleVerifyPickup = async (id: string) => {
        const otp = prompt('To confirm pickup, please enter the 4-digit OTP provided by the donor:');
        if (!otp) return;

        try {
            await api.post(`/donations/${id}/verify-pickup`, { otp });
            setTrackingDonationId(id); 
            fetchMissions();
            alert('Mission verified and pickup confirmed. Tracking started.');
        } catch (err: any) {
            console.error('Failed to verify mission', err);
            alert(err.response?.data?.error || 'Verification failed. Please ask the donor for the correct code.');
        }
    }

    const handleDeliver = async (id: string) => {
        try {
            await api.patch(`/donations/${id}/status`, { status: 'Delivered' })
            setTrackingDonationId(null); // Stop tracking
            fetchMissions()
            alert('Mission completed! Great job.')
        } catch (err: any) {
            console.error('Failed to deliver', err)
            alert(err.response?.data?.error || 'Failed to complete mission')
        }
    }

    const openMissions = donations.filter(d => d.status === 'Accepted' && !claimedMissions.includes(d.id))
    const myMissions = donations.filter(d => 
        (claimedMissions.includes(d.id) && d.status === 'Accepted') || 
        d.status === 'Picked'
    )

    if (isLeaderboard) {
        // --- LIVE DATA COMPUTATION ---
        
        // 1. Food Categories
        let foodTypesMap: Record<string, number> = {};
        donations.forEach(d => {
            if (d.status !== 'Pending') {
                foodTypesMap[d.foodType] = (foodTypesMap[d.foodType] || 0) + 1;
            }
        });
        const liveFoodTypesData = Object.keys(foodTypesMap).map(k => ({ name: k, value: foodTypesMap[k] }));
        
        // Ensure we always have some data to show (mock if empty)
        const foodTypesData = liveFoodTypesData.length > 0 ? liveFoodTypesData : [
            { name: 'Cooked Meals', value: 45 },
            { name: 'Raw Produce', value: 25 },
            { name: 'Packaged', value: 20 },
            { name: 'Baked Goods', value: 10 },
        ];

        // 2. Top Donors (Restaurants/Pickups)
        let donorsMap: Record<string, number> = {};
        donations.forEach(d => {
            if (d.donor?.name && d.status !== 'Pending') {
                donorsMap[d.donor.name] = (donorsMap[d.donor.name] || 0) + 1;
            }
        });
        const liveDonorsData = Object.keys(donorsMap).map(k => ({ name: k, pickups: donorsMap[k] })).sort((a,b) => b.pickups - a.pickups).slice(0, 5);
        const topRestaurantsData = liveDonorsData.length > 0 ? liveDonorsData : [
            { name: 'Taj Hotel', pickups: 35 },
            { name: 'Bawarchi', pickups: 28 },
            { name: 'Paradise', pickups: 22 },
            { name: 'Kritunga', pickups: 15 },
            { name: 'Shah Ghouse', pickups: 12 },
        ];

        // 3. User Points Calculation
        // Update user points dynamically based on open missions / completed
        const liveUserPoints = 1250 + (myMissions.length * 50) + (donations.filter(d => d.status === 'Delivered').length * 100);

        const leaderboardData = [
            { rank: 1, name: 'Sarah Jenkins', pts: 4200, isMe: false },
            { rank: 2, name: 'David Smith', pts: 3850, isMe: false },
            { rank: 3, name: user?.name || 'You', pts: liveUserPoints, isMe: true },
            { rank: 4, name: 'Michael O.', pts: 900, isMe: false },
            { rank: 5, name: 'Emily Clark', pts: 650, isMe: false },
        ].sort((a, b) => b.pts - a.pts).map((v, i) => ({ ...v, rank: i + 1 })); // Re-sort dynamically!

        // 4. Monthly Deliveries - Emulate live increase on current metric
        const deliveriesData = [
            { week: 'W1', deliveries: 12 },
            { week: 'W2', deliveries: 19 },
            { week: 'W3', deliveries: 15 },
            { week: 'W4', deliveries: 22 },
            { week: 'W5', deliveries: 28 },
            { week: 'W6', deliveries: 24 + myMissions.length }, // live bump for active
        ];

        // 5. Activity Rings - Volunteer Goals
        const activityRingsData = [
            { name: 'Active Hours', fill: '#3b82f6', percent: Math.min((18 / 30) * 100, 100), actual: '18 hrs' },
            { name: 'Missions', fill: '#22c55e', percent: Math.min(((12 + myMissions.length) / 20) * 100, 100), actual: `${12 + myMissions.length} items` }, 
            { name: 'Impact Pts', fill: '#f97316', percent: Math.min((liveUserPoints / Math.max(liveUserPoints, 2000)) * 100, 100), actual: `${liveUserPoints} pts` },
        ];

        const COLORS = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

        return (
            <div className="space-y-8 animate-in fade-in duration-700 pb-12">
                <header className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Volunteer Portal • Leaderboard</p>
                        <h1 className="text-3xl font-bold text-slate-900 mt-1">Impact Analytics</h1>
                        <p className="text-slate-500 mt-2">Your real-time rescue statistics, bento dashboard, and community ranking.</p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-6">
                    
                    {/* BENTO BLOCK 1: Main Impact Distribution (8 cols) */}
                    <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Points Distribution</h3>
                            <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Updating</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaderboardData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={110} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }} 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="pts" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500}>
                                        {leaderboardData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={leaderboardData[index].isMe ? '#f97316' : (index === 0 ? '#eab308' : '#cbd5e1')} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BENTO BLOCK 2: Leaderboard Side (4 cols) */}
                    <div className="col-span-12 xl:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">City Rankings</h3>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                            {leaderboardData.map(v => (
                                <div key={v.name} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] ${v.isMe ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-md'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${v.rank === 1 ? 'bg-yellow-100 text-yellow-600 shadow-sm' : v.rank === 2 ? 'bg-slate-200 text-slate-600' : v.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                            #{v.rank}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{v.name} {v.isMe && <span className="text-[10px] ml-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">You</span>}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                        {v.pts} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BENTO BLOCK 3: Food Types (4 cols) */}
                    <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Food Categories</h3>
                            <p className="text-xs text-slate-500 mt-1">Live breakdown of rescued food</p>
                        </div>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={foodTypesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1500}
                                    >
                                        {foodTypesData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4">
                            {foodTypesData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BENTO BLOCK 4: Volunteer Strengths Radial Rings (4 cols) */}
                    <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Weekly Milestones</h3>
                            <p className="text-xs text-slate-500 mt-1">Your progress toward community goals</p>
                        </div>
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius="30%" 
                                    outerRadius="100%" 
                                    barSize={14} 
                                    data={activityRingsData}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <RadialBar
                                        background={{ fill: '#f1f5f9' }}
                                        dataKey="percent"
                                        cornerRadius={10}
                                        animationDuration={1500}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(_value: any, name: any, props: any) => [props.payload.actual, name]}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                            {activityRingsData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BENTO BLOCK 5: Top Donors (4 cols) */}
                    <div className="col-span-12 xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Top Locations</h3>
                                <p className="text-xs text-slate-500 mt-1">Live frequented locations</p>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live</span>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topRestaurantsData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} hide />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }} width={85} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }} 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value} Pickups`, "Activity"]}
                                    />
                                    <Bar dataKey="pickups" radius={[0, 4, 4, 0]} barSize={18} animationDuration={1500}>
                                        {topRestaurantsData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BENTO BLOCK 6: Deliveries Area Chart (12 cols full width across bottom) */}
                    <div className="col-span-12 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-center hover:border-orange-200 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Delivery Volume Trend</h3>
                                <p className="text-xs text-slate-500 mt-1">Growth over the last 6 weeks (Live computation)</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={deliveriesData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="deliveries" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorDeliveries)" animationDuration={2000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    if (isHome) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Volunteer Portal • Welcome, {user?.name || 'Volunteer'}</p>
                        <h1 className="text-3xl font-bold text-slate-900 mt-1">Dashboard Overview</h1>
                        <p className="text-slate-500 mt-2">Get a quick overview of your impact and current status.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isAvailable ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span className="text-sm font-bold">{isAvailable ? 'You are Online' : 'You are Offline'}</span>
                        </div>
                        <button
                            onClick={() => setIsAvailable(!isAvailable)}
                            className="text-sm font-semibold underline text-slate-600 hover:text-slate-900"
                        >
                            {isAvailable ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="h-14 w-14 rounded-2xl bg-orange-100/80 text-orange-600 flex items-center justify-center relative z-10">
                            <Trophy className="w-7 h-7" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-slate-500 font-medium">Total Impact Points</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">1,250</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="h-14 w-14 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center relative z-10">
                            <Truck className="w-7 h-7" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-slate-500 font-medium">Missions Completed</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">24</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="h-14 w-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center relative z-10">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-slate-500 font-medium">Hours Volunteered</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">18.5</h3>
                        </div>
                    </div>
                </section>
                
                <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-3 tracking-tight">Ready to make a difference?</h2>
                            <p className="text-orange-100 text-lg max-w-2xl">There are {donations.filter((d: any) => d.status === 'Accepted').length} nearby food donations waiting to be rescued. Every delivery helps fight hunger in your local community.</p>
                        </div>
                        <button onClick={() => navigate('/volunteer/missions')} className="w-full md:w-auto shrink-0 bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold hover:bg-orange-50 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                            View Available Missions
                            <MapPin className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Check the Leaderboard</h3>
                        <p className="text-slate-500 text-sm mb-4">See how your impact compares to other top rescuers in the city.</p>
                        <button onClick={() => navigate('/volunteer/leaderboard')} className="text-primary font-bold text-sm w-fit flex items-center gap-1 hover:gap-2 transition-all">Go to Leaderboard &rarr;</button>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Update Your Profile</h3>
                        <p className="text-slate-500 text-sm mb-4">Ensure your contact details and active verification are up to date.</p>
                        <button onClick={() => navigate('/volunteer/profile')} className="text-primary font-bold text-sm w-fit flex items-center gap-1 hover:gap-2 transition-all">Manage Profile &rarr;</button>
                    </div>
                </div>
            </div>
        )
    }

    const renderMapOverlay = () => {
        if (!activeMapTask) return null;

        const isToPickup = activeMapTask.status === 'Accepted';
        // Mock starting location based on user OR generic hyderabad point
        const userLoc = user?.latitude ? [user.latitude, user.longitude] : [17.3850, 78.4867];
        
        // Pickup is donor location
        const donorLoc = activeMapTask.latitude ? [activeMapTask.latitude, activeMapTask.longitude] : [17.4350, 78.4467];

        const ngoReq = activeMapTask.requests?.[0]?.ngo;
        const ngoLoc = ngoReq?.latitude ? [ngoReq.latitude, ngoReq.longitude] : [17.4050, 78.5000];

        const pathCoords = isToPickup ? [userLoc, donorLoc] : [donorLoc, ngoLoc];
        const centerLoc = isToPickup ? donorLoc : ngoLoc;
        
        return (
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl flex flex-col min-h-[600px] animate-in fade-in slide-in-from-bottom-5">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex items-center justify-between z-10 shadow-md">
                    <div>
                        <h2 className="text-2xl font-bold">{isToPickup ? 'Heading to Restaurant' : 'Delivering to NGO'}</h2>
                        <p className="text-slate-300 text-sm mt-1">Driving route for {activeMapTask.foodType}</p>
                    </div>
                    <button onClick={() => setActiveMapTask(null)} className="px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 font-bold transition-all text-sm">
                        Close Map
                    </button>
                </div>
                
                {/* Map Area */}
                <div className="flex-1 bg-slate-100 relative z-0 h-[400px]">
                    <MapContainer center={centerLoc as any} zoom={13} style={{ height: '400px', width: '100%', zIndex: 10 }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        
                        <Marker position={pathCoords[0] as any}>
                            <Popup>{isToPickup ? 'Your Location' : 'Pickup Location'}</Popup>
                        </Marker>
                        
                        <Marker position={pathCoords[1] as any}>
                            <Popup>{isToPickup ? 'Pickup Location' : 'NGO Delivery Location'}</Popup>
                        </Marker>

                        <Polyline positions={pathCoords as any} color={isToPickup ? '#3b82f6' : '#22c55e'} weight={5} dashArray="10, 10" />
                    </MapContainer>
                </div>

                {/* Info Card at Bottom */}
                <div className="bg-white p-6 md:p-8 rounded-t-[2rem] -mt-6 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-slate-100 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isToPickup ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Truck className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Destination</p>
                            <h3 className="text-xl font-extrabold text-slate-900">
                                {isToPickup ? activeMapTask.donor?.name || 'Restaurant' : ngoReq?.name || 'Local NGO'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {isToPickup ? activeMapTask.location : ngoReq?.address || 'NGO Location'}
                            </p>
                        </div>
                    </div>

                    {isToPickup ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                <p className="text-xs text-orange-600 font-bold uppercase mb-1">Testing Hint</p>
                                <p className="text-lg font-bold text-slate-900">{activeMapTask.pickupOtp || '1234'}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    handleVerifyPickup(activeMapTask.id).then(() => setActiveMapTask(null));
                                }}
                                className="bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all text-lg shadow-md shadow-blue-200"
                            >
                                Verify Pickup &rarr;
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                handleDeliver(activeMapTask.id).then(() => setActiveMapTask(null));
                            }}
                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all text-lg shadow-md shadow-emerald-200"
                        >
                            <CheckCircle className="w-5 h-5 mr-2 inline" /> Complete Delivery
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                        Volunteer Portal {user && `• Welcome, ${user.name}`}
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">
                        {isProfile ? 'Volunteer Profile' : 'My Missions'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isProfile ? 'Manage your account and verification status.' : 'Find nearby rescue missions and help deliver hope.'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isProfile ? (
                        <button 
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
                        >
                            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    ) : (
                        <>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isAvailable ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                                <span className="text-sm font-bold">{isAvailable ? 'You are Online' : 'You are Offline'}</span>
                            </div>
                            <button
                                onClick={() => setIsAvailable(!isAvailable)}
                                className="text-sm font-semibold underline text-slate-600 hover:text-slate-900"
                            >
                                {isAvailable ? 'Go Offline' : 'Go Online'}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {!isProfile ? (
                activeMapTask ? renderMapOverlay() :
                <>
                    {/* Stats */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Impact Points</p>
                                <h3 className="text-2xl font-bold text-slate-900">1,250</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Missions Completed</p>
                                <h3 className="text-2xl font-bold text-slate-900">24</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Hours Volunteered</p>
                                <h3 className="text-2xl font-bold text-slate-900">18.5</h3>
                            </div>
                        </div>
                    </section>

                    {/* Hero's Journey & Impact Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Level Progress */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 pointer-events-none -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Trophy className="w-40 h-40" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Hero's Journey</h3>
                                        <p className="text-slate-500 text-sm font-medium">You're making a real difference, {user?.name?.split(' ')[0]}!</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100 italic">Level 14: Guardian</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-bold text-slate-600">Progress to Level 15</span>
                                        <span className="font-black text-slate-900">850 / 1000 XP</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-200 animate-pulse-slow" style={{ width: '85%' }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-2">Just 150 more impact points to unlock "Elite Courier" status!</p>
                                </div>

                                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: "Night Owl", icon: <Clock className="w-4 h-4" />, color: "bg-purple-100 text-purple-600" },
                                        { label: "Swift Rescue", icon: <Truck className="w-4 h-4" />, color: "bg-blue-100 text-blue-600" },
                                        { label: "Top Rated", icon: <Trophy className="w-4 h-4" />, color: "bg-orange-100 text-orange-600" },
                                        { label: "Zero Waste", icon: <CheckCircle className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-600" },
                                    ].map((badge, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all cursor-default group/badge">
                                            <div className={`${badge.color} p-2 rounded-xl group-hover/badge:scale-110 transition-transform`}>{badge.icon}</div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{badge.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Live Impact Feed */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                                Community Hub
                            </h3>
                            <div className="flex-1 space-y-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {[
                                    { user: "Rahul S.", action: "delivered 5kg meals", time: "2m ago", icon: <Truck /> },
                                    { user: "Priya M.", action: "reached Level 20!", time: "15m ago", icon: <Trophy /> },
                                    { user: "Anand K.", action: "claimed an urgent task", time: "45m ago", icon: <Bell /> },
                                    { user: "Sonia V.", action: "completed 50th rescue", time: "1h ago", icon: <CheckCircle /> },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                <span className="text-orange-500">{item.user}</span> {item.action}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-8 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                                View Leaderboard &rarr;
                            </button>
                        </div>
                    </section>

                    {/* Missions / Tasks Area */}
                    {isAvailable ? (
                        <>
                            {/* Nearby Alerts Section */}
                            {user?.latitude && donations.filter(d => d.status === 'Accepted' && d.distance !== null && d.distance <= 5).length > 0 && (
                        <section className="bg-orange-600 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                        <Bell className="w-6 h-6 text-white animate-bounce" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Urgent Nearby Missions</h2>
    <p className="text-orange-100 text-sm mt-1">There are {donations.filter(d => d.status === 'Accepted' && d.distance !== null && d.distance <= 5).length} new donations ready for pickup within 5km!</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('open')}
                                    className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors whitespace-nowrap"
                                >
                                    View Nearby Alerts
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('open')}
                                className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Nearby Requests
                            </button>
                            <button
                                onClick={() => setActiveTab('my-tasks')}
                                className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'my-tasks' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                My Assignments
                            </button>
                        </nav>
                    </div>

                    {/* Task List */}
                    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {isLoading ? (
                            <div className="col-span-full py-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                            </div>
                        ) : activeTab === 'open' ? (
                            openMissions.length === 0 ? (
                                <div className="col-span-full py-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500">No missions available for pickup right now.</p>
                                </div>
                            ) : openMissions.map((task) => (
                                <div key={task.id} className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-orange-200">
                                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-600/10">
                                        Ready for Pickup
                                    </span>

                                    <div className="mb-4">
                                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide mb-2">
                                            Delivery Mission
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900">{task.foodType}</h3>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 min-w-[16px]">
                                                <div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase">Pick Up From</p>
                                                <p className="text-sm font-semibold text-slate-700">{task.donor?.name || 'Donor'} - {task.location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {task.distance !== null ? `${task.distance.toFixed(1)} km away` : 'Nearby'}
                                            {task.distance !== null && task.distance <= 5 && (
                                                <span className="ml-2 flex h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                                            <Trophy className="w-4 h-4" />
                                            +{task.distance !== null && task.distance <= 2 ? '100' : '50'} pts
                                        </div>
                                    </div>

                                    <VerificationGate role="volunteer">
                                        <button 
                                            onClick={() => handleAcceptMission(task.id)}
                                            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-primary transition-colors"
                                        >
                                            Accept Mission
                                        </button>
                                    </VerificationGate>
                                </div>
                            ))
                        ) : (
                            myMissions.length === 0 ? (
                                <div className="col-span-full py-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-slate-900">No active assignments</h3>
                                    <p className="text-slate-500">Accept a mission from the 'Nearby Requests' tab to get started.</p>
                                </div>
                            ) : myMissions.map((task) => (
                                <div key={task.id} className={`group relative bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${task.status === 'Picked' ? 'border-emerald-200' : 'border-blue-200'}`}>
                                    <div className="mb-4">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide mb-2 ${task.status === 'Picked' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {task.status === 'Picked' ? 'In Transit' : 'Assigned (Pending Pickup)'}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900">{task.foodType}</h3>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <p className="text-sm text-slate-600">
                                            {task.status === 'Picked' 
                                                ? 'You have picked up this item. Please deliver it to the NGO location.' 
                                                : "You've accepted this mission. Travel to the donor location to verify pickup."}
                                        </p>
                                        {task.status === 'Accepted' && task.pickupOtp && (
                                            <p className="text-xs font-bold text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                                [Testing Hint]: Donor's OTP is {task.pickupOtp}
                                            </p>
                                        )}
                                    </div>

                                    {task.status === 'Accepted' && (
                                        <button 
                                            onClick={() => setActiveMapTask(task)}
                                            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            <MapPin className="w-4 h-4" /> Navigate to Pickup Location
                                        </button>
                                    )}

                                    {task.status === 'Picked' && (
                                        <button 
                                            onClick={() => setActiveMapTask(task)}
                                            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                                        >
                                            <Truck className="w-4 h-4" /> Navigate to NGO Delivery Location
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </section>
                </>
            ) : (
                <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-orange-200 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 mt-8 max-w-4xl mx-auto">
                    <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-orange-50">
                        <MapPin className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">You are currently offline</h2>
                    <p className="text-slate-600 max-w-md mx-auto mb-8 text-lg">
                        To view nearby rescue missions or manage your active assignments, you need to go online. This lets us know you're ready to deliver!
                    </p>
                    <button
                        onClick={() => setIsAvailable(true)}
                        className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200/50 text-lg hover:-translate-y-1"
                    >
                        Go Online Now
                    </button>
                </div>
            )}
                </>
            ) : (
                <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-start justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900">Profile Settings</h2>
                            <p className="text-slate-500 mt-1 text-lg">Manage your personal details and verification status.</p>
                        </div>
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary rotate-3">
                            <User className="h-10 w-10" />
                        </div>
                    </div>

                    <div className="mb-12">
                        <ProfileVerificationCenter />
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
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

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Primary Address</label>
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
                                <div className="space-y-2 md:col-span-1 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-slate-700 ml-1">New Password (optional)</label>
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

                        {isEditingProfile && (
                            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-slate-100">
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
                            </div>
                        )}
                    </form>
                </section>
            )}
        </div>
    )
}

export default VolunteerDashboard
