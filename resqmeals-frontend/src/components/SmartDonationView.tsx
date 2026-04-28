import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Package, CheckCircle, Navigation, TrendingUp, Sparkles, Loader2, Bot, Zap, ArrowRight, ShieldCheck, Bike, Building, Star, BellRing, Phone, Lock } from 'lucide-react';
import api from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const donorIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  className: '', iconSize: [20, 20], iconAnchor: [10, 10]
});

const ngoIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">🏢</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14]
});

const volIcon = L.divIcon({
  html: `<div style="background-color: #f97316; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">🛵</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14]
});

const DONOR_POS: [number, number] = [17.4381, 78.3953];
const NGO_POS: [number, number] = [17.4550, 78.4110];
const VOL_START_POS: [number, number] = [17.4200, 78.3800];

type TrackingState = 'IDLE' | 'PENDING' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';

interface DonationViewProps {
  user: any;
  donations: any[];
  onAddDonation: (don: any) => void;
}

export default function SmartDonationView({ user, donations, onAddDonation }: DonationViewProps) {
  const [formData, setFormData] = useState({
    category: 'Veg', foodDesc: '', quantity: '', unit: 'meals', expiry: '', location: user?.address || 'Madhapur, Hyderabad', radius: 5
  });

  const [trackingState, setTrackingState] = useState<TrackingState>('IDLE');
  const [activeDonationId, setActiveDonationId] = useState<string | null>(null);
  
  const [volPos, setVolPos] = useState<[number, number]>(VOL_START_POS);
  const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [distanceRemaining, setDistanceRemaining] = useState('2.4 km');
  const [eta, setEta] = useState('12 mins');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), msg }]);
  };

  useEffect(() => {
    const desc = formData.foodDesc.toLowerCase();
    if (desc.includes('chicken') || desc.includes('meat') || desc.includes('egg') || desc.includes('fish')) {
      if (formData.category !== 'Non-Veg') setFormData(prev => ({ ...prev, category: 'Non-Veg' }));
    } else if (desc.includes('vegan') || desc.includes('plant')) {
      if (formData.category !== 'Vegan') setFormData(prev => ({ ...prev, category: 'Vegan' }));
    }
  }, [formData.foodDesc]);

  // Backend Polling for NGO Approval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (trackingState === 'PENDING' && activeDonationId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/donations/${activeDonationId}`);
          if (res.data.donation.status === 'Accepted') {
            clearInterval(interval);
            setTrackingState('ACCEPTED');
            addLog("SUCCESS: NGO Accepted your donation request.");
            addLog("System assigning nearest volunteer...");
            setTimeout(() => {
               setTrackingState('ON_THE_WAY');
               addLog("Volunteer assigned. On the way to pickup location.");
            }, 3000);
          }
        } catch (err) {
          console.warn("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [trackingState, activeDonationId]);

  // Live Map Movement Simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (trackingState === 'ON_THE_WAY') {
      let step = 0;
      const totalSteps = 100;
      interval = setInterval(() => {
        step++;
        const lat = VOL_START_POS[0] + ((DONOR_POS[0] - VOL_START_POS[0]) * (step / totalSteps));
        const lng = VOL_START_POS[1] + ((DONOR_POS[1] - VOL_START_POS[1]) * (step / totalSteps));
        setVolPos([lat, lng]);
        
        const remainingKm = (2.4 * (1 - step/totalSteps)).toFixed(1);
        setDistanceRemaining(`${Math.max(0.1, parseFloat(remainingKm))} km`);
        setEta(`${Math.max(1, Math.ceil(12 * (1 - step/totalSteps)))} mins`);

        if (step >= totalSteps) {
          clearInterval(interval);
          setTrackingState('ARRIVED');
          addLog("Volunteer arrived at your location.");
          addLog("Awaiting OTP Verification.");
        }
      }, 100);
    } 
    else if (trackingState === 'IN_TRANSIT') {
      let step = 0;
      const totalSteps = 150;
      interval = setInterval(() => {
        step++;
        const lat = DONOR_POS[0] + ((NGO_POS[0] - DONOR_POS[0]) * (step / totalSteps));
        const lng = DONOR_POS[1] + ((NGO_POS[1] - DONOR_POS[1]) * (step / totalSteps));
        setVolPos([lat, lng]);
        
        const remainingKm = (3.1 * (1 - step/totalSteps)).toFixed(1);
        setDistanceRemaining(`${Math.max(0.1, parseFloat(remainingKm))} km`);
        setEta(`${Math.max(1, Math.ceil(15 * (1 - step/totalSteps)))} mins`);

        if (step >= totalSteps) {
          clearInterval(interval);
          setTrackingState('DELIVERED');
          addLog("Donation successfully delivered to NGO!");
          api.patch(`/donations/${activeDonationId}/status`, { status: 'Delivered' });
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [trackingState]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTrackingState('PENDING');
    setLogs([]);
    addLog("System matching logic initiated...");
    addLog(`Broadcasting to NGOs within ${formData.radius}km radius...`);
    
    try {
      const finalData = {
        foodType: `[${formData.category}] ${formData.foodDesc}`,
        quantity: `${formData.quantity} ${formData.unit}`,
        category: formData.category,
        expiry: formData.expiry,
        location: formData.location,
        radius: formData.radius
      };
      const response = await api.post('/donations', finalData);
      onAddDonation(response.data.donation);
      setActiveDonationId(response.data.donation.id);
      
      addLog("Donation securely logged.");
      addLog("STATUS: PENDING. Waiting for an NGO partner to review and accept...");
      addLog("(Open the NGO Dashboard in another window to accept this request)");
    } catch (e) {
      console.warn("Backend save failed", e);
      addLog("ERROR: Failed to connect to backend.");
      setTrackingState('IDLE');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!activeDonationId) return;
    try {
      const res = await api.post(`/donations/${activeDonationId}/verify-pickup`, { otp });
      setTrackingState('PICKED_UP');
      addLog("OTP Verified successfully. Status updated to PICKED_UP.");
      setTimeout(() => {
        setTrackingState('IN_TRANSIT');
        addLog("Volunteer in transit to NGO.");
      }, 2000);
    } catch (err: any) {
      setOtpError(true);
      addLog(`OTP Error: ${err.response?.data?.error || 'Invalid OTP'}`);
      setTimeout(() => setOtpError(false), 2000);
    }
  };

  if (trackingState !== 'IDLE') {
    return (
      <div className="min-h-screen font-sans text-slate-800">
        <div className="mb-6 flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                {(trackingState !== 'DELIVERED' && trackingState !== 'ARRIVED') && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-4 w-4 ${trackingState === 'DELIVERED' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
              </span>
              Live Rescue Mission Tracker
            </h1>
            <p className="text-slate-500 font-bold mt-1">Real-time GPS dispatch & delivery system.</p>
          </div>
          {trackingState === 'DELIVERED' && (
            <button onClick={() => { setTrackingState('IDLE'); setFormData({ ...formData, foodDesc: '', quantity: '' }); setVolPos(VOL_START_POS); setActiveDonationId(null); }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-colors">
              Start New Mission
            </button>
          )}
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: MAP & LOGS */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="bg-white/70 backdrop-blur-2xl border-white/60 p-2 rounded-[2rem] shadow-xl border border-slate-100 flex-1 min-h-[400px] relative z-0 overflow-hidden">
              <MapContainer center={DONOR_POS} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '1.8rem', zIndex: 1 }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                
                <Marker position={DONOR_POS} icon={donorIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
                
                {(trackingState !== 'PENDING') && (
                  <Marker position={NGO_POS} icon={ngoIcon}>
                    <Popup>Assigned NGO</Popup>
                  </Marker>
                )}

                {['ON_THE_WAY', 'ARRIVED', 'IN_TRANSIT', 'PICKED_UP'].includes(trackingState) && (
                  <Marker position={volPos} icon={volIcon}>
                    <Popup>Volunteer</Popup>
                  </Marker>
                )}

                <Polyline positions={[VOL_START_POS, DONOR_POS]} pathOptions={{ color: '#94a3b8', dashArray: '5, 10', weight: 3 }} />
                <Polyline positions={[DONOR_POS, NGO_POS]} pathOptions={{ color: '#f97316', dashArray: trackingState === 'IN_TRANSIT' ? '0' : '5, 10', weight: 4 }} />
              </MapContainer>

              <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 min-w-[200px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Live Status</p>
                <p className="text-xl font-black text-orange-600 mb-3">{trackingState.replace('_', ' ')}</p>
                {(trackingState === 'ON_THE_WAY' || trackingState === 'IN_TRANSIT') && (
                  <div className="flex justify-between items-center bg-orange-50 p-2 rounded-xl">
                    <span className="text-xs font-bold text-orange-800">ETA: {eta}</span>
                    <span className="text-xs font-bold text-orange-800">{distanceRemaining}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl h-48 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <BellRing className="w-24 h-24" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> System Activity Logs
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-4 custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className="text-slate-200">{log.msg}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* RIGHT: TRACKING WORKFLOW */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Timeline */}
            <div className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Mission Timeline</h4>
              
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                {[
                  { id: 'PENDING', label: 'Waiting for NGO response', icon: <Bot className="w-4 h-4" />, done: ['ACCEPTED','ON_THE_WAY','ARRIVED','PICKED_UP','IN_TRANSIT','DELIVERED'].includes(trackingState) || trackingState === 'PENDING' },
                  { id: 'ACCEPTED', label: 'NGO accepted your donation', icon: <Building className="w-4 h-4" />, done: ['ON_THE_WAY','ARRIVED','PICKED_UP','IN_TRANSIT','DELIVERED'].includes(trackingState) || trackingState === 'ACCEPTED' },
                  { id: 'ON_THE_WAY', label: 'Volunteer on the way', icon: <Bike className="w-4 h-4" />, done: ['ARRIVED','PICKED_UP','IN_TRANSIT','DELIVERED'].includes(trackingState) || trackingState === 'ON_THE_WAY' },
                  { id: 'PICKED_UP', label: 'Secure Pickup (OTP)', icon: <Package className="w-4 h-4" />, done: ['IN_TRANSIT','DELIVERED'].includes(trackingState) || trackingState === 'PICKED_UP' },
                  { id: 'DELIVERED', label: 'Delivered successfully', icon: <CheckCircle className="w-4 h-4" />, done: trackingState === 'DELIVERED' },
                ].map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-colors duration-500 ${step.done ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {step.icon}
                    </div>
                    <div>
                      <p className={`font-black text-sm ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                      {step.id === trackingState && <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1 animate-pulse">In Progress</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {trackingState === 'PENDING' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-yellow-50 border border-yellow-200 rounded-[2rem] p-8 text-center">
                  <div className="h-16 w-16 bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Building className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-yellow-900 mb-2">Awaiting NGO Approval</h4>
                  <p className="text-sm font-medium text-yellow-800">Your donation is locked. Waiting for a nearby NGO to review and accept the rescue mission.</p>
                </motion.div>
              )}

              {trackingState === 'ON_THE_WAY' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                      <Bike className="w-5 h-5" /> Volunteer En Route
                    </h4>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black animate-pulse">LIVE</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="avatar" /></div>
                    <div>
                      <p className="font-black text-slate-900">Arjun K.</p>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> 4.9 Rating</p>
                    </div>
                    <button className="ml-auto h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors"><Phone className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              )}

              {trackingState === 'ARRIVED' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-orange-600 text-white rounded-[2rem] p-8 shadow-xl shadow-orange-500/30">
                  <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-5 h-5" /> Secure Handover
                  </h4>
                  <p className="font-bold text-orange-100 mb-6 text-sm">Volunteer has arrived. Ask the volunteer for the 4-digit pickup OTP to confirm.</p>
                  
                  <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-2 block">Enter Volunteer's OTP</label>
                    <div className="flex gap-4">
                      <input 
                        type="text" maxLength={4} placeholder="••••" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        className={`w-full bg-white text-slate-900 font-black text-2xl tracking-[0.5em] text-center rounded-2xl py-3 outline-none ${otpError ? 'ring-4 ring-red-500' : 'focus:ring-4 focus:ring-white/50'}`}
                      />
                      <button onClick={verifyOtp} className="px-6 bg-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors">Verify</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {trackingState === 'DELIVERED' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500 text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-500/30 text-center">
                  <div className="h-20 w-20 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/20">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-2">Mission Accomplished!</h3>
                  <p className="font-bold text-emerald-100 mb-6 text-sm">Your generous donation just made a huge impact.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/10 p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] uppercase font-black tracking-widest text-emerald-200 mb-1">Meals Saved</p>
                      <p className="text-3xl font-black">{formData.quantity}</p>
                    </div>
                    <div className="bg-black/10 p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] uppercase font-black tracking-widest text-emerald-200 mb-1">Success Rate</p>
                      <p className="text-3xl font-black">100%</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <div className="mb-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Post Surplus Food</h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Fill details. The system strictly waits for NGO approval before taking any action.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-2xl border-white/60 rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <form onSubmit={handlePublish} className="space-y-8">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">Food Category</label>
                <div className="flex gap-4">
                  {['Veg', 'Non-Veg', 'Vegan'].map(cat => (
                    <button key={cat} type="button" onClick={() => setFormData({...formData, category: cat})} className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.category === cat ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">What are you donating?</label>
                <input required placeholder="E.g. 50 plates of vegetable biryani..." value={formData.foodDesc} onChange={e => setFormData({...formData, foodDesc: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white px-6 py-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Quantity</label>
                  <div className="flex bg-slate-50 rounded-[1.5rem] p-1 shadow-inner focus-within:ring-2 focus-within:ring-orange-500">
                    <input required type="number" min="1" placeholder="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-transparent px-4 py-4 outline-none font-black text-slate-800" />
                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="bg-white text-slate-700 px-4 rounded-xl font-bold text-xs border border-slate-200 outline-none">
                      <option value="meals">Meals</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Good for (Hours)</label>
                  <div className="relative">
                     <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input required type="number" step="0.5" placeholder="E.g. 4" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white pl-14 pr-4 py-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pickup Location</label>
                  <div className="relative">
                     <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white pl-14 pr-4 py-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-inner" />
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                  <div className="flex justify-between items-center px-1 mb-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Discovery Radius</label>
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-[10px] font-black">{formData.radius} KM</span>
                  </div>
                  <input type="range" min="1" max="50" value={formData.radius} onChange={e => setFormData({...formData, radius: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !formData.foodDesc || !formData.quantity || !formData.expiry} className="w-full bg-[#f97316] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Post Food (Requires NGO Approval)</>}
              </button>
            </form>
          </motion.div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-10 text-orange-400"><ShieldCheck className="w-6 h-6" /> Strict Policy Enforced</h3>
            <div className="space-y-8">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20"><Building className="w-5 h-5 text-emerald-400" /></div>
                <div><p className="font-bold text-sm text-slate-300">No auto-accept.</p><p className="text-xs text-slate-500">NGOs must review and approve.</p></div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20"><Bike className="w-5 h-5 text-blue-400" /></div>
                <div><p className="font-bold text-sm text-slate-300">No early dispatch.</p><p className="text-xs text-slate-500">Volunteers assigned only after approval.</p></div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20"><Lock className="w-5 h-5 text-orange-400" /></div>
                <div><p className="font-bold text-sm text-slate-300">Secure OTP Handover.</p><p className="text-xs text-slate-500">Real validation required to proceed.</p></div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/10 text-center">
              <p className="text-xs font-bold text-orange-400">Your donation will sit in PENDING state until an NGO clicks "Accept" in their dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
