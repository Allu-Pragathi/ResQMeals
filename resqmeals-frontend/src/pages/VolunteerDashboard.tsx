import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { MapPin, Clock, Trophy, Truck, CheckCircle, Bell, User, Mail, Phone, Loader2, UserCog, AlertTriangle, CheckCircle2, ArrowRight, Bot, Zap, Filter, Search, ChevronDown, Navigation, PhoneCall, Info, TrendingUp, Medal, Star, Target, Award, Brain, BarChart3, ChevronRight, ShieldCheck, Lock, LogOut, Sliders, BellRing, Calendar, Camera, Check, Shield, Home, UtensilsCrossed, MessageSquare } from 'lucide-react'
import ProfileVerificationCenter from '../components/ProfileVerificationCenter'
import VerificationGate from '../components/VerificationGate'
import ActiveMissionTracker from '../components/ActiveMissionTracker'
import { useSocket } from '../contexts/SocketContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, RadialBarChart, RadialBar, LineChart, Line, ScatterChart, Scatter, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
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
    const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'veg' | 'non-veg' | 'reward'>('all')
    const [activeSort, setActiveSort] = useState<'smart' | 'nearest' | 'reward'>('smart')
    const [activeTimeFilter, setActiveTimeFilter] = useState<'weekly' | 'monthly' | 'all-time'>('weekly')
    const { socket, notifications } = useSocket()
    const [showNotifications, setShowNotifications] = useState(false)

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
    const isMissions = location.pathname.includes('missions')
    const isAnalytics = location.pathname.includes('analytics')
    const isLeaderboard = location.pathname.includes('leaderboard')
    const isHistory = location.pathname.includes('history')
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

    // Socket.io Integration
    useEffect(() => {
        if (!socket) return;
        const handleStatusUpdate = (data: { id: string, status: string }) => {
            fetchMissions();
        };
        socket.on('status:updated', handleStatusUpdate);
        return () => {
            socket.off('status:updated', handleStatusUpdate);
        };
    }, [socket]);


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

    const handleAcceptMission = async (id: string) => {
        try {
            await api.patch(`/donations/${id}/status`, { status: 'On the Way' });
            
            if (!claimedMissions.includes(id)) {
                const updatedClaimed = [...claimedMissions, id];
                setClaimedMissions(updatedClaimed);
                localStorage.setItem('resqmeals_claimed_missions', JSON.stringify(updatedClaimed));
            }
            setActiveTab('my-tasks');
            alert('Mission successfully assigned to you! Please head to the donor location to retrieve the food.');
            fetchMissions();
        } catch (err: any) {
            console.error('Failed to accept mission', err);
            alert('Failed to assign mission. It may have already been taken.');
        }
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

    let openMissions = donations.filter(d => ['Pending', 'Accepted'].includes(d.status) && !claimedMissions.includes(d.id))
    
    // Filtering
    if (activeFilter === 'urgent') {
        openMissions = openMissions.filter(d => d.distance !== null && d.distance <= 5)
    } else if (activeFilter === 'veg') {
        openMissions = openMissions.filter(d => d.foodType?.toLowerCase().includes('veg') && !d.foodType?.toLowerCase().includes('non-veg'))
    } else if (activeFilter === 'non-veg') {
        openMissions = openMissions.filter(d => d.foodType?.toLowerCase().includes('non-veg'))
    }

    // Sorting
    if (activeSort === 'nearest') {
        openMissions.sort((a, b) => (a.distance !== null ? a.distance : 999) - (b.distance !== null ? b.distance : 999))
    } else if (activeSort === 'reward') {
        openMissions.sort((a, b) => {
            const rewardA = a.distance !== null && a.distance <= 5 ? 100 : 50;
            const rewardB = b.distance !== null && b.distance <= 5 ? 100 : 50;
            return rewardB - rewardA;
        })
    } else if (activeSort === 'smart') {
        openMissions.sort((a, b) => {
            const scoreA = (a.distance !== null && a.distance <= 5 ? 100 : 0) - (a.distance || 0) * 10;
            const scoreB = (b.distance !== null && b.distance <= 5 ? 100 : 0) - (b.distance || 0) * 10;
            return scoreB - scoreA;
        })
    }
    const myMissions = donations.filter(d => 
        (claimedMissions.includes(d.id) && ['Accepted', 'On the Way', 'Picked'].includes(d.status)) || 
        d.status === 'Picked' || d.status === 'On the Way'
    )

    if (isHome) {
        const liveUserPoints = 1250 + (myMissions.length * 50) + (donations.filter(d => d.status === 'Delivered').length * 100);
        const totalCompleted = donations.filter(d => d.status === 'Delivered').length + 124;
        const hoursVolunteered = (totalCompleted * 0.75).toFixed(1);
        const nearbyCount = openMissions.length;

        return (
            <div className="space-y-6 animate-in fade-in duration-700 pb-12 w-full">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                            <Home className="w-4 h-4" /> Welcome Back
                        </p>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">
                            Mission Control Center
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Ready to make a difference today? Here is your overview.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/volunteer/missions')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-500 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                            View Available Missions <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <Trophy className="w-8 h-8 text-orange-500 mb-4" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Points</p>
                            <h3 className="text-4xl font-black text-slate-900">{liveUserPoints}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <Truck className="w-8 h-8 text-emerald-500 mb-4" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Missions Completed</p>
                            <h3 className="text-4xl font-black text-slate-900">{totalCompleted}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <Clock className="w-8 h-8 text-blue-500 mb-4" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hours Volunteered</p>
                            <h3 className="text-4xl font-black text-slate-900">{hoursVolunteered}h</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <MapPin className="w-8 h-8 text-purple-500 mb-4" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nearby Missions</p>
                            <h3 className="text-4xl font-black text-slate-900">{nearbyCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none"><Target className="w-64 h-64" /></div>
                        <h2 className="text-2xl font-black mb-2 relative z-10">Ready to Rescue?</h2>
                        <p className="text-slate-300 font-medium mb-8 max-w-sm relative z-10">There are {nearbyCount} active food rescues waiting in your area right now. Hop online and start making an impact.</p>
                        <button onClick={() => navigate('/volunteer/missions')} className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-orange-500/30 hover:bg-orange-400 hover:-translate-y-1 transition-all relative z-10">
                            Start Exploring
                        </button>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Weekly Milestone</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-bold text-slate-500">Current Progress</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">12 <span className="text-base text-slate-400 font-medium">/ 15 rescues</span></p>
                                </div>
                                <div className="text-orange-600 font-black">80%</div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 w-[80%] rounded-full relative">
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mt-2">Just 3 more rescues to earn the <strong className="text-slate-700">Weekend Warrior</strong> badge!</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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

    // 6. Reward Points Trend
    const rewardTrendData = [
        { day: 'Mon', pts: 45 },
        { day: 'Tue', pts: 52 },
        { day: 'Wed', pts: 48 },
        { day: 'Thu', pts: 70 },
        { day: 'Fri', pts: 65 },
        { day: 'Sat', pts: 90 },
        { day: 'Sun', pts: 85 },
    ];

    // 7. Response Time Analysis (mins)
    const responseTimeData = [
        { name: '0-5m', count: 12, fill: '#f97316' },
        { name: '5-10m', count: 25, fill: '#fb923c' },
        { name: '10-15m', count: 18, fill: '#fdba74' },
        { name: '15-20m', count: 8, fill: '#fed7aa' },
        { name: '20m+', count: 4, fill: '#ffedd5' },
    ];

    // 8. Impact Forecast (Scatter)
    const impactForecastData = [
        { x: 10, y: 15, z: 200 },
        { x: 15, y: 25, z: 260 },
        { x: 20, y: 30, z: 400 },
        { x: 25, y: 45, z: 280 },
        { x: 30, y: 50, z: 500 },
        { x: 35, y: 70, z: 600 },
    ];

    // 9. Skill / Capability Distribution (Radar)
    const skillDistributionData = [
        { subject: 'Speed', A: 120, fullMark: 150 },
        { subject: 'Reliability', A: 98, fullMark: 150 },
        { subject: 'Distance', A: 86, fullMark: 150 },
        { subject: 'Volume', A: 99, fullMark: 150 },
        { subject: 'Communication', A: 85, fullMark: 150 },
        { subject: 'Handling', A: 65, fullMark: 150 },
    ];

    // 5. Active Operations KPIs
    const totalCompleted = donations.filter(d => d.status === 'Delivered').length + 124;
    const activeMission = myMissions.find(d => ['Accepted', 'On the Way', 'Picked'].includes(d.status));
    const hoursVolunteered = (totalCompleted * 0.75).toFixed(1);

    const COLORS = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];






    const renderMapOverlay = () => {
        if (!activeMapTask) return null;

        const userLoc = user?.latitude ? [user.latitude, user.longitude] : [17.3850, 78.4867];

        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-center animate-in fade-in">
                <ActiveMissionTracker 
                    task={activeMapTask}
                    userLocation={userLoc}
                    onClose={() => setActiveMapTask(null)}
                    onVerified={() => {
                        setTrackingDonationId(activeMapTask.id);
                        fetchMissions();
                    }}
                    onDelivered={() => {
                        setActiveMapTask(null);
                        fetchMissions();
                        alert('Delivery marked as complete! Thank you for your service.');
                    }}
                />
            </div>
        );
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
                            
                            {/* Notification Bell */}
                            <div className="relative">
                              <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition-all relative group"
                              >
                                <Bell className="w-5 h-5 group-hover:rotate-[15deg] transition-transform" />
                                {notifications.length > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white shadow-sm"></span>}
                              </button>
                              
                              {showNotifications && (
                                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-[100] animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-slate-900">Notifications</h4>
                                    {notifications.length > 0 && <span className="text-[10px] font-bold text-slate-400">{notifications.length} new</span>}
                                  </div>
                                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {notifications.length === 0 ? (
                                       <div className="text-center py-4 text-sm text-slate-500 font-medium">No new alerts</div>
                                    ) : (
                                      notifications.map((notif, idx) => (
                                        <div key={idx} className="p-3 bg-orange-50 rounded-xl text-xs font-bold text-slate-700 border border-orange-100/50">
                                          {notif.message}
                                          <p className="text-[9px] font-medium text-slate-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
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
                isAnalytics ? (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Impact Analytics</h1>
                            <p className="text-slate-500 mt-2 font-medium">Deep dive into your contribution and operational efficiency.</p>
                        </header>
                        
                        <div className="space-y-8">
                             {/* KPIs specifically for analytics */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rescue Success Rate</p>
                                     <h3 className="text-3xl font-black text-emerald-600">99.2%</h3>
                                 </div>
                                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Dispatch Latency</p>
                                     <h3 className="text-3xl font-black text-blue-600">8.4m</h3>
                                 </div>
                                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reward Multiplier</p>
                                     <h3 className="text-3xl font-black text-orange-600">1.5x</h3>
                                 </div>
                             </div>

                             {/* Charts Area */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" /> Delivery Volume Trend</h3>
                                     <div className="h-[250px] w-full">
                                         <ResponsiveContainer width="100%" height="100%">
                                             <AreaChart data={deliveriesData}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                 <XAxis dataKey="week" hide />
                                                 <YAxis hide />
                                                 <Tooltip />
                                                 <Area type="monotone" dataKey="deliveries" stroke="#f97316" fill="#fed7aa" />
                                             </AreaChart>
                                         </ResponsiveContainer>
                                     </div>
                                 </div>
                                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Award className="w-4 h-4 text-indigo-500" /> Capability Profile</h3>
                                     <div className="h-[250px] w-full">
                                         <ResponsiveContainer width="100%" height="100%">
                                             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillDistributionData}>
                                                 <PolarGrid />
                                                 <PolarAngleAxis dataKey="subject" />
                                                 <Radar name="Performance" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                             </RadarChart>
                                         </ResponsiveContainer>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                ) : isLeaderboard ? (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Volunteer Leaderboard</h1>
                            <p className="text-slate-500 mt-2 font-medium">See how you rank against the top heroes in your community.</p>
                        </header>
                        
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-black text-xl">#4</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Current Rank</p>
                                        <h2 className="text-xl font-black">Pragathi Allu</h2>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Points</p>
                                    <h2 className="text-3xl font-black text-orange-400">14.2k</h2>
                                </div>
                            </div>
                            
                            <div className="p-0">
                                {leaderboardData.map((v, i) => (
                                    <div key={i} className={`flex items-center justify-between p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors ${v.isMe ? 'bg-orange-50/50' : ''}`}>
                                        <div className="flex items-center gap-6">
                                            <span className={`text-2xl font-black w-8 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-300'}`}>{i + 1}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">{v.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-900">{v.name} {v.isMe && <span className="ml-2 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">You</span>}</p>
                                                    <p className="text-xs font-medium text-slate-500">Completed {150 - i * 10} missions</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Score</p>
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-sm font-bold text-slate-700">{95 - i}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <p className="text-lg font-black text-slate-900">{v.pts} <span className="text-[10px] text-slate-400 uppercase">pts</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : isHistory ? (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Mission History</h1>
                            <p className="text-slate-500 mt-2 font-medium">A complete archive of your successful food rescues.</p>
                        </header>
                        
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div key={item} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-orange-200 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900">Rescued {10 + item * 5}kg Surplus Meal</h4>
                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                                                <MapPin className="w-3 h-3" /> Restaurant Oasis • <Clock className="w-3 h-3" /> May {4 - item}, 2026
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-slate-900">+150 pts</div>
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Successfully Delivered</div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Load More History</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {isAvailable ? (
                        <div className="space-y-6">
                            {/* Filter & Sorting Bar */}
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filters:</span>
                                    </div>
                                    <button onClick={() => setActiveSort('nearest')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${activeSort === 'nearest' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700'}`}>Nearest</button>
                                    <button onClick={() => setActiveFilter(activeFilter === 'urgent' ? 'all' : 'urgent')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${activeFilter === 'urgent' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700'}`}>Urgent</button>
                                    <button onClick={() => setActiveSort('reward')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${activeSort === 'reward' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700'}`}>Highest Reward</button>
                                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                    <button onClick={() => setActiveFilter(activeFilter === 'veg' ? 'all' : 'veg')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${activeFilter === 'veg' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-slate-200 hover:border-green-200 hover:bg-green-50 text-slate-700'}`}>Veg</button>
                                    <button onClick={() => setActiveFilter(activeFilter === 'non-veg' ? 'all' : 'non-veg')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${activeFilter === 'non-veg' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-700'}`}>Non-Veg</button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort by:</span>
                                    <button onClick={() => setActiveSort('smart')} className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors border ${activeSort === 'smart' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                        <Bot className={`w-4 h-4 ${activeSort === 'smart' ? 'text-emerald-400' : 'text-slate-400'}`} /> Smart Recommendation
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-slate-200 mt-8">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('open')}
                                        className={`pb-4 px-1 text-sm font-black border-b-2 transition-colors uppercase tracking-widest flex items-center gap-2 ${activeTab === 'open' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Nearby Missions
                                        {activeTab === 'open' && <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-[10px]">{openMissions.length}</span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('my-tasks')}
                                        className={`pb-4 px-1 text-sm font-black border-b-2 transition-colors uppercase tracking-widest flex items-center gap-2 ${activeTab === 'my-tasks' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        My Active Missions
                                        {activeTab === 'my-tasks' && <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-[10px]">{myMissions.length}</span>}
                                    </button>
                                </nav>
                            </div>

                            {/* Mission Lists */}
                            <div className="mt-6">
                                {isLoading ? (
                                    <div className="py-12 text-center flex justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    </div>
                                ) : activeTab === 'open' ? (
                                    <div className="space-y-6">
                                        {/* Dynamic Alerts */}
                                        {openMissions.filter(t => t.distance !== null && t.distance <= 3 && t.expiry?.toLowerCase().includes('min')).length > 0 && (
                                            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0"><AlertTriangle className="w-5 h-5" /></div>
                                                <div className="flex-1">
                                                    <p className="text-red-800 font-bold">Urgent Pickups Nearby</p>
                                                    <p className="text-red-600 text-sm">{openMissions.filter(t => t.distance !== null && t.distance <= 3 && t.expiry?.toLowerCase().includes('min')).length} urgent pickups within 3km expiring soon!</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Recommended Mission */}
                                        {openMissions.length > 0 && (
                                            <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                                                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                                                    <Bot className="w-48 h-48" />
                                                </div>
                                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1"><Bot className="w-3 h-3" /> AI Recommended</span>
                                                            <span className="bg-orange-600/50 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Top Match</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black mb-1">{[...openMissions].sort((a, b) => {
                                                            const scoreA = (a.distance !== null && a.distance <= 5 ? 100 : 0) - (a.distance || 0) * 10;
                                                            const scoreB = (b.distance !== null && b.distance <= 5 ? 100 : 0) - (b.distance || 0) * 10;
                                                            return scoreB - scoreA;
                                                        })[0].foodType}</h3>
                                                        <div className="flex items-center gap-4 text-sm font-medium text-white/90">
                                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {[...openMissions].sort((a,b)=>((a.distance||99)-(b.distance||99)))[0].distance?.toFixed(1) || 'Nearby'} km away</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-orange-200" /> {[...openMissions][0].expiry || 'Expiring soon'}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const topTask = [...openMissions].sort((a, b) => {
                                                                const scoreA = (a.distance !== null && a.distance <= 5 ? 100 : 0) - (a.distance || 0) * 10;
                                                                const scoreB = (b.distance !== null && b.distance <= 5 ? 100 : 0) - (b.distance || 0) * 10;
                                                                return scoreB - scoreA;
                                                            })[0];
                                                            handleAcceptMission(topTask.id);
                                                        }}
                                                        className="bg-white text-orange-600 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Start Mission <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">All Available Missions ({openMissions.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {openMissions.length === 0 ? (
                                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-slate-300" /></div>
                                                <h3 className="text-lg font-bold text-slate-900">No missions found</h3>
                                                <p className="text-slate-500 mt-1">There are no available rescue missions in your area right now.</p>
                                            </div>
                                        ) : openMissions.map((task) => {
                                            const priority = (task.distance !== null && task.distance <= 3) ? 'Urgent' : (task.distance !== null && task.distance <= 8) ? 'Medium' : 'Low';
                                            const isUrgent = priority === 'Urgent';
                                            const isExpired = false; // Add real expiry logic if backend supports it
                                            
                                            return (
                                                <div key={task.id} className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${isExpired ? 'border-slate-200 opacity-60' : 'border-slate-100 hover:border-orange-200'}`}>
                                                    <div>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${priority === 'Urgent' ? 'bg-red-50 text-red-600' : priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                                {priority === 'Urgent' ? <><AlertTriangle className="w-3 h-3" /> Urgent</> : priority === 'Medium' ? <><Info className="w-3 h-3" /> Medium</> : <><Clock className="w-3 h-3" /> Low</>}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold">
                                                                <Trophy className="w-3.5 h-3.5" /> +{priority === 'Urgent' ? '100' : priority === 'Medium' ? '75' : '50'} pts
                                                            </div>
                                                        </div>
                                                        
                                                        <h3 className="text-xl font-black text-slate-900 mb-1">{task.foodType}</h3>
                                                        <p className="text-sm font-medium text-slate-500 mb-6">{task.donor?.name || 'Restaurant Donor'}</p>
                                                        
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                                <span>{task.distance !== null ? `${task.distance.toFixed(1)} km away` : 'Nearby'} • {task.distance !== null ? `${Math.ceil(task.distance * 3)} min drive` : '15 min drive'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                                                <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
                                                                <span className={`${isExpired ? 'text-red-600 font-black line-through' : 'text-amber-600 font-bold'}`}>{isExpired ? 'Expired' : `Expires in ${priority === 'Urgent' ? '25 mins' : '2 hours'}`}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <VerificationGate role="volunteer">
                                                        <button 
                                                            disabled={isExpired || !isAvailable}
                                                            onClick={() => {
                                                                if (window.confirm(`🚀 ACCEPT MISSION: ${task.foodType}\n\n📍 Distance: ${task.distance ? task.distance.toFixed(1) : '3'} km\n⏳ Expiry: ${priority === 'Urgent' ? '25 mins' : '2 hours'}\n🎁 Reward: +${priority === 'Urgent' ? '100' : priority === 'Medium' ? '75' : '50'} points\n\nAre you sure you want to commit to this rescue?`)) {
                                                                    handleAcceptMission(task.id);
                                                                }
                                                            }}
                                                            className={`w-full py-3.5 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${isExpired || !isAvailable ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-orange-500 shadow-slate-200'}`}
                                                        >
                                                            {isExpired ? 'Mission Expired' : !isAvailable ? 'Go Online to Accept' : 'Accept Mission'}
                                                        </button>
                                                    </VerificationGate>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {myMissions.length === 0 ? (
                                            <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-orange-300" /></div>
                                                <h3 className="text-lg font-bold text-slate-900">No active missions</h3>
                                                <p className="text-slate-500 mt-1">Head to the 'Nearby Missions' tab to accept a new task.</p>
                                            </div>
                                        ) : myMissions.map((task) => (
                                            <div key={task.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700"><Truck className="w-48 h-48" /></div>
                                                
                                                {/* Left Side: Details */}
                                                <div className="flex-1 relative z-10">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${task.status === 'Picked' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {task.status === 'Picked' ? 'On Route to NGO' : 'Heading to Pickup'}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-400">• Mission #{task.id.slice(0,6).toUpperCase()}</span>
                                                    </div>
                                                    
                                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{task.foodType}</h3>
                                                    <p className="text-slate-500 mb-6 max-w-lg">
                                                        {task.status === 'Picked' 
                                                            ? 'You have picked up the food. Please proceed directly to the NGO dropping point.' 
                                                            : 'Travel to the donor location. You will need to verify the OTP from the donor to confirm pickup.'}
                                                    </p>
                                                    
                                                    {/* Expandable Details */}
                                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4 max-w-lg">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex items-start gap-3">
                                                                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Donor Contact</p>
                                                                    <p className="text-sm font-semibold text-slate-900">{task.donor?.name || 'Restaurant Manager'}</p>
                                                                    <p className="text-xs text-orange-600 font-medium mt-0.5 cursor-pointer hover:underline">+91 98765 43210</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup Instructions</p>
                                                                    <p className="text-xs font-medium text-slate-700 leading-snug">Please enter through the back kitchen door.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</p>
                                                                <p className="text-sm font-semibold text-slate-900">{task.location}</p>
                                                                <button 
                                                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.location)}`, '_blank')}
                                                                    className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1 hover:text-blue-800 transition-colors"
                                                                >
                                                                    Open in Google Maps <ArrowRight className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {task.status === 'Accepted' && (
                                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Lock className="w-4 h-4 text-amber-600" />
                                                                    <span className="text-sm font-bold text-amber-800">OTP required at pickup</span>
                                                                </div>
                                                                {task.pickupOtp && <span className="text-sm font-black text-amber-700 tracking-widest bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">PIN: {task.pickupOtp}</span>}
                                                            </div>
                                                        )}
                                                        {['Picked', 'Delivered'].includes(task.status) && (
                                                            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                    <span className="text-sm font-bold text-emerald-800">Pickup Confirmed ✅</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-emerald-600">OTP Verified</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Side: Status Tracker & Actions */}
                                                <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between relative z-10 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                                                    <div className="space-y-6 mb-8">
                                                        <div className="relative pl-6">
                                                            <div className="absolute left-2.5 top-2.5 bottom-[-1.5rem] w-0.5 bg-emerald-500"></div>
                                                            <div className="absolute left-1 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                                                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">Accepted</p>
                                                            <p className="text-xs font-medium text-slate-500">Mission Confirmed</p>
                                                        </div>
                                                        <div className="relative pl-6">
                                                            <div className={`absolute left-2.5 top-2.5 bottom-[-1.5rem] w-0.5 ${task.status === 'Picked' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                            <div className={`absolute left-1 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${task.status === 'Picked' ? 'bg-emerald-500' : 'bg-blue-500 ring-4 ring-blue-50 animate-pulse'}`}></div>
                                                            <p className={`text-sm font-bold leading-none mb-1 ${task.status === 'Picked' ? 'text-slate-900' : 'text-blue-600'}`}>On the Way</p>
                                                            <p className="text-xs font-medium text-slate-500">Heading to pickup</p>
                                                        </div>
                                                        <div className="relative pl-6">
                                                            <div className="absolute left-2.5 top-2.5 bottom-[-1.5rem] w-0.5 bg-slate-200 hidden"></div>
                                                            <div className={`absolute left-1 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${task.status === 'Picked' ? 'bg-blue-500 ring-4 ring-blue-50 animate-pulse' : 'bg-slate-200'}`}></div>
                                                            <p className={`text-sm font-bold leading-none mb-1 ${task.status === 'Picked' ? 'text-blue-600' : 'text-slate-400'}`}>Picked & Verified</p>
                                                            <p className="text-xs font-medium text-slate-400">OTP Confirmed</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 mt-4 lg:mt-0">
                                                        <button 
                                                            onClick={() => setActiveMapTask(task)}
                                                            className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-black flex items-center justify-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all hover:-translate-y-1"
                                                        >
                                                            <Navigation className="w-5 h-5" />
                                                            Open Built-in Tracker
                                                        </button>
                                                        {task.status === 'Accepted' && (
                                                            <button 
                                                                onClick={() => setActiveMapTask(task)} // Opens Tracker which has OTP verify
                                                                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm transition-all"
                                                            >
                                                                <Lock className="w-5 h-5" />
                                                                Enter OTP & Pick Up
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-orange-200 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 mt-8 max-w-4xl mx-auto shadow-sm">
                            <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-orange-50">
                                <Truck className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-3">You are currently offline</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg font-medium">
                                Go online to view nearby rescue missions, access smart recommendations, and manage your active deliveries.
                            </p>
                            <button
                                onClick={() => setIsAvailable(true)}
                                className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-200/50 text-lg hover:-translate-y-1 hover:shadow-orange-300"
                            >
                                Go Online Now
                            </button>
                        </div>
                    )}
                </>
            )) : (
                <div className="space-y-6 animate-in fade-in duration-700 pb-12 w-full">
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
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShieldCheck className="w-64 h-64" /></div>

                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                <h2 className="text-3xl font-black text-slate-900">{user?.name || 'Volunteer Hero'}</h2>
                                <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm mt-1">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-2">
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
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
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
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                                    <Shield className="w-5 h-5 text-blue-500" /> Identity Verification
                                </h3>
                                <ProfileVerificationCenter />
                            </div>

                            {/* Availability Section */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-purple-500" /> Availability Slots
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isAvailable ? 'Online' : 'Offline'}</span>
                                        <button 
                                            onClick={() => setIsAvailable(!isAvailable)} 
                                            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            aria-label={isAvailable ? "Go offline" : "Go online"}
                                            aria-pressed={isAvailable}
                                            role="switch"
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Availability slots">
                                    <button aria-pressed="true" className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-orange-500 bg-orange-50 text-orange-700 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                                        <Clock className="w-5 h-5 mb-2" /> Morning
                                        <span className="text-[10px] font-medium opacity-80 mt-1">8 AM - 12 PM</span>
                                    </button>
                                    <button aria-pressed="false" className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                                        <Clock className="w-5 h-5 mb-2" /> Afternoon
                                        <span className="text-[10px] font-medium opacity-80 mt-1">12 PM - 4 PM</span>
                                    </button>
                                    <button aria-pressed="true" className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-orange-500 bg-orange-50 text-orange-700 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                                        <Clock className="w-5 h-5 mb-2" /> Evening
                                        <span className="text-[10px] font-medium opacity-80 mt-1">4 PM - 9 PM</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            
                            {/* AI Insights */}
                            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 shadow-sm relative overflow-hidden">
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
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
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
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <BellRing className="w-5 h-5 text-amber-500" /> Notifications
                                </h3>
                                <div className="space-y-3">
                                    <button role="switch" aria-checked="true" className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Urgent Alerts</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Expiring food within 5km</p>
                                        </div>
                                        <div className="w-10 h-5 bg-orange-500 rounded-full relative shrink-0"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                    </button>
                                    <button role="switch" aria-checked="true" className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Mission Updates</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Status changes & OTPs</p>
                                        </div>
                                        <div className="w-10 h-5 bg-orange-500 rounded-full relative shrink-0"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                    </button>
                                    <button role="switch" aria-checked="false" className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Platform News</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Monthly impact reports</p>
                                        </div>
                                        <div className="w-10 h-5 bg-slate-200 rounded-full relative shrink-0"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                                    </button>
                                </div>
                            </div>

                            {/* Security & Danger Zone */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <Lock className="w-5 h-5 text-slate-600" /> Security
                                </h3>
                                <div className="space-y-3">
                                    <button aria-label="Change Password" className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                                        Change Password <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button aria-label="Logout from all devices" className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                        Logout from all devices <LogOut className="w-4 h-4 opacity-50" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default VolunteerDashboard
