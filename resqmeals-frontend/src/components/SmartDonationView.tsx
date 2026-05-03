import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Package, CheckCircle, TrendingUp, Bot, Zap, ShieldCheck, Bike, Building, Star, BellRing, Phone, Lock, ChevronRight, Activity, Loader2, Info } from 'lucide-react';
import api from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const donorIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);"></div>`,
  className: '', iconSize: [16, 16], iconAnchor: [8, 8]
});

const ngoIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 15px rgba(16, 185, 129, 0.5); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: 900;">NGO</div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 12]
});

const volIcon = L.divIcon({
  html: `<div style="background-color: #f97316; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(249, 115, 22, 0.5); display: flex; align-items: center; justify-content: center; font-size: 12px;">🛵</div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 12]
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
            addLog("NGO_MATCH_CONFIRMED: Protocol 74 initiated.");
            setTimeout(() => {
               setTrackingState('ON_THE_WAY');
               addLog("LOGISTICS: Volunteer unit dispatched to coordinates.");
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
          addLog("EVENT: Unit arrived at destination.");
          addLog("AUTH: Awaiting OTP synchronization.");
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
          addLog("MISSION_COMPLETE: Payload delivered to endpoint.");
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
    addLog("MISSION_INIT: Scanning local NGO network...");
    
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
      
      addLog("DATA_SYNC: Payload registered in secure ledger.");
      addLog("WAIT: Broadcasting signal to authorized partners...");
    } catch (e) {
      console.warn("Backend save failed", e);
      addLog("CRITICAL_FAILURE: Network connection timed out.");
      setTrackingState('IDLE');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!activeDonationId) return;
    try {
      await api.post(`/donations/${activeDonationId}/verify-pickup`, { otp });
      setTrackingState('PICKED_UP');
      addLog("AUTH_SUCCESS: OTP validated.");
      setTimeout(() => {
        setTrackingState('IN_TRANSIT');
        addLog("LOGISTICS: Unit transitioning to NGO coordinates.");
      }, 2000);
    } catch (err: any) {
      setOtpError(true);
      addLog(`AUTH_ERROR: Invalid sequence.`);
      setTimeout(() => setOtpError(false), 2000);
    }
  };

  if (trackingState !== 'IDLE') {
    return (
      <div className="min-h-screen pb-20">
        <div className="flex justify-between items-center mb-12">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                 <p className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-widest">Live_Mission_Active</p>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Rescue Logistics</h2>
           </div>
           {trackingState === 'DELIVERED' && (
             <button onClick={() => { setTrackingState('IDLE'); setActiveDonationId(null); }} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-105 active:scale-95 transition-all">
                Plan New Rescue
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* MAP VIEW */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-sm h-[500px] relative overflow-hidden">
                 <div className="absolute inset-0 bg-slate-50 opacity-50 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                 <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-slate-100 z-10">
                    <MapContainer center={DONOR_POS} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <Marker position={DONOR_POS} icon={donorIcon} />
                      {trackingState !== 'PENDING' && <Marker position={NGO_POS} icon={ngoIcon} />}
                      {['ON_THE_WAY', 'ARRIVED', 'IN_TRANSIT', 'PICKED_UP'].includes(trackingState) && <Marker position={volPos} icon={volIcon} />}
                      <Polyline positions={[DONOR_POS, NGO_POS]} pathOptions={{ color: '#000', weight: 2, dashArray: '8, 8', opacity: 0.2 }} />
                    </MapContainer>
                 </div>

                 {/* Floating Hud */}
                 <div className="absolute bottom-10 right-10 z-20 bg-slate-900 text-white p-6 rounded-2xl shadow-2xl min-w-[240px]">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-mono text-slate-400">UNIT_STATUS</span>
                       <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xl font-black mb-1">{trackingState.replace('_', ' ')}</p>
                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                       <div>
                          <p className="text-[10px] font-mono text-slate-500">DIST_REM</p>
                          <p className="text-sm font-black">{distanceRemaining}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-mono text-slate-500">TIME_EST</p>
                          <p className="text-sm font-black">{eta}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Console Logs */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 h-48 flex flex-col font-mono">
                 <div className="flex items-center gap-2 mb-4 text-orange-500">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">System_Console_Out</span>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-2 pr-4 text-[11px] custom-scrollbar">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-4">
                         <span className="text-slate-600">[{log.time}]</span>
                         <span className="text-slate-200">{log.msg}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                 </div>
              </div>
           </div>

           {/* WORKFLOW PANEL */}
           <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 px-2">Operational_Flow</h3>
                 <div className="space-y-6">
                    {[
                       { id: 'PENDING', label: 'Partner Negotiation', sub: 'Broadcasting signal...', icon: <Bot /> },
                       { id: 'ON_THE_WAY', label: 'Unit Dispatch', sub: 'Volunteer in transit', icon: <Bike /> },
                       { id: 'PICKED_UP', label: 'Handover Sequence', sub: 'OTP Authentication', icon: <Lock /> },
                       { id: 'DELIVERED', label: 'Mission Closure', sub: 'Final delivery', icon: <CheckCircle /> },
                    ].map((step, i) => {
                       const isDone = ['ACCEPTED','ON_THE_WAY','ARRIVED','PICKED_UP','IN_TRANSIT','DELIVERED'].includes(trackingState);
                       const isActive = trackingState === step.id || (step.id === 'PENDING' && trackingState === 'PENDING');
                       return (
                          <div key={i} className={`flex items-start gap-5 p-4 rounded-3xl border transition-all ${isActive ? 'bg-orange-50 border-orange-200' : 'bg-transparent border-transparent'}`}>
                             <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                {step.icon}
                             </div>
                             <div>
                                <p className={`text-sm font-black ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{step.sub}</p>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

              <AnimatePresence mode="wait">
                 {trackingState === 'ARRIVED' && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl">
                       <h4 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-6">Handover_Protocol</h4>
                       <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">Confirm pickup by entering the 4-digit code provided by the logistics unit.</p>
                       <div className="space-y-4">
                          <input 
                             type="text" maxLength={4} placeholder="0000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                             className={`w-full bg-white/5 border border-white/10 text-white font-black text-3xl tracking-[0.5em] text-center rounded-2xl py-5 outline-none focus:bg-white/10 transition-all ${otpError ? 'border-red-500 bg-red-500/10' : ''}`}
                          />
                          <button onClick={verifyOtp} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-500 transition-colors">
                             Authorize_Pickup
                          </button>
                       </div>
                    </motion.div>
                 )}

                 {trackingState === 'DELIVERED' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-600 text-white rounded-[2.5rem] p-10 text-center shadow-2xl">
                       <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <TrendingUp className="w-8 h-8" />
                       </div>
                       <h3 className="text-2xl font-black mb-2">Rescue Succeeded</h3>
                       <p className="text-sm font-bold text-emerald-100 mb-8">Payload successfully distributed to the target community.</p>
                       <div className="bg-black/10 p-6 rounded-3xl border border-white/10">
                          <p className="text-[10px] font-mono text-emerald-200 mb-2">IMPACT_METRIC</p>
                          <p className="text-4xl font-black">{formData.quantity} MEALS</p>
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
    <div className="min-h-screen pb-20">
      <div className="w-full">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <span className="h-px w-8 bg-slate-900"></span>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-900">Rescue_Planning_Unit</span>
               </div>
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Plan Rescue</h2>
            </div>
            <div className="bg-slate-100 px-6 py-3 rounded-xl border border-slate-200">
               <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1">Session_ID</p>
               <p className="text-xs font-mono font-black text-slate-900">RM-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Planning Form */}
            <div className="lg:col-span-7">
               <form onSubmit={handlePublish} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 px-1">Payload_Category</label>
                        <div className="grid grid-cols-3 gap-2">
                           {['Veg', 'Non-Veg', 'Vegan'].map(cat => (
                              <button key={cat} type="button" onClick={() => setFormData({...formData, category: cat})} className={`py-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${formData.category === cat ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                                 {cat}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 px-1">Payload_Shelf_Life</label>
                        <div className="relative">
                           <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input required type="number" placeholder="Hours" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 px-1">Payload_Description</label>
                     <input required placeholder="Specify food items and condition..." value={formData.foodDesc} onChange={e => setFormData({...formData, foodDesc: e.target.value})} className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl font-bold text-sm outline-none focus:border-slate-900 transition-all shadow-sm" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 px-1">Unit_Quantity</label>
                        <div className="flex gap-2">
                           <input required type="number" placeholder="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="flex-1 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm outline-none focus:border-slate-900" />
                           <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="bg-slate-50 border border-slate-200 px-4 rounded-xl font-black text-[10px] uppercase outline-none">
                              <option value="meals">Meals</option>
                              <option value="kg">Kg</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 px-1">Dispatch_Radius</label>
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
                           <input type="range" min="1" max="50" value={formData.radius} onChange={e => setFormData({...formData, radius: parseInt(e.target.value)})} className="flex-1 accent-slate-900" />
                           <span className="text-[10px] font-mono font-black text-slate-900 w-8">{formData.radius}km</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 px-1">Pickup_Point</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all" />
                     </div>
                  </div>

                  <button type="submit" disabled={isSubmitting || !formData.foodDesc || !formData.quantity} className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-orange-600/20 hover:bg-orange-500 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                     {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Initiate_Rescue_Sequence <ChevronRight className="w-4 h-4" /></>}
                  </button>
               </form>
            </div>

            {/* Constraints & Rules */}
            <div className="lg:col-span-5 space-y-8">
               <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-orange-500 mb-10 flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4" /> Operational_Constraints
                  </h3>
                  <div className="space-y-10">
                     {[
                        { title: "Manual Validation", desc: "Partners must manually verify payload suitability before dispatch.", icon: <Building className="text-emerald-400" /> },
                        { title: "OTP Synchronization", desc: "Secure token exchange required at pickup endpoint.", icon: <Lock className="text-amber-400" /> },
                        { title: "Live Telemetry", desc: "Real-time unit tracking enabled upon partner acceptance.", icon: <Activity className="text-blue-400" /> }
                     ].map((item, i) => (
                        <div key={i} className="flex gap-5">
                           <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              {item.icon}
                           </div>
                           <div>
                              <p className="font-black text-sm mb-1">{item.title}</p>
                              <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="mt-12 pt-8 border-t border-white/5">
                     <div className="flex items-start gap-3 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                        <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-200/60 font-medium leading-relaxed uppercase tracking-wider">Plan stays in PENDING state until an authorized NGO unit accepts the mission.</p>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
