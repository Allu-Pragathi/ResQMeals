import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { MapPin, Clock, Truck, CheckCircle2, Navigation, Phone, ExternalLink, AlertTriangle, ShieldCheck, ChevronRight, X, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface ActiveMissionTrackerProps {
    task: any;
    userLocation: number[];
    onClose: () => void;
    onVerified: () => void;
    onDelivered: () => void;
}

export default function ActiveMissionTracker({ task, userLocation, onClose, onVerified, onDelivered }: ActiveMissionTrackerProps) {
    const isToPickup = task.status === 'Accepted';
    
    // Status can be locally simulated for UI feedback before making the API call
    const [localStep, setLocalStep] = useState<'accepted' | 'on_route' | 'reached' | 'picked' | 'delivering'>(isToPickup ? 'accepted' : 'picked');
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDelivering, setIsDelivering] = useState(false);
    const [otpError, setOtpError] = useState('');

    const donorLoc = task.latitude && task.longitude ? [task.latitude, task.longitude] : [17.4350, 78.4467];
    const ngoReq = task.requests?.[0]?.ngo;
    const ngoLoc = ngoReq?.latitude && ngoReq?.longitude ? [ngoReq.latitude, ngoReq.longitude] : [17.4050, 78.5000];

    const pathCoords = isToPickup ? [userLocation, donorLoc] : [donorLoc, ngoLoc];
    const centerLoc = isToPickup ? donorLoc : ngoLoc;

    const handleVerify = async () => {
        if (!otp || otp.length < 4) {
            setOtpError('Please enter a valid 4-digit OTP');
            return;
        }
        setIsVerifying(true);
        setOtpError('');
        try {
            await api.post(`/donations/${task.id}/verify-pickup`, { otp });
            setLocalStep('picked');
            onVerified();
        } catch (err: any) {
            setOtpError(err.response?.data?.error || 'Invalid OTP. Try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDeliver = async () => {
        setIsDelivering(true);
        try {
            await api.put(`/donations/${task.id}/status`, { status: 'Delivered' });
            onDelivered();
        } catch (err: any) {
            console.error('Failed to update status', err);
            alert('Failed to mark as delivered.');
        } finally {
            setIsDelivering(false);
        }
    };

    const steps = [
        { id: 'accepted', label: 'Accepted', active: true, complete: true },
        { id: 'on_route', label: 'On Route', active: localStep === 'on_route' || localStep === 'reached' || localStep === 'picked' || localStep === 'delivering', complete: localStep === 'reached' || localStep === 'picked' || localStep === 'delivering' },
        { id: 'reached', label: 'Reached', active: localStep === 'reached' || localStep === 'picked' || localStep === 'delivering', complete: localStep === 'picked' || localStep === 'delivering' },
        { id: 'picked', label: 'Picked up', active: localStep === 'picked' || localStep === 'delivering', complete: localStep === 'delivering' },
        { id: 'delivered', label: 'Delivered', active: localStep === 'delivering', complete: false }
    ];

    return (
        <div className="bg-slate-50 min-h-[80vh] flex flex-col rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0 shadow-md relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Mission Tracker</h2>
                        <p className="text-slate-400 text-xs mt-0.5">ID: #{task.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 lg:p-4 overflow-y-auto custom-scrollbar">
                
                {/* Left Column: Map & Tracker */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* Live Tracker Bar */}
                    <div className="bg-white p-6 rounded-none lg:rounded-3xl shadow-sm border border-slate-100 shrink-0">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Mission Progress</h3>
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                            <div className="flex justify-between relative z-10">
                                {steps.map((s, i) => (
                                    <div key={s.id} className="flex flex-col items-center gap-2 w-1/5">
                                        <div className={`w-8 h-8 rounded-full border-4 shadow-sm flex items-center justify-center transition-all duration-500 ${s.complete ? 'bg-emerald-500 border-white text-white' : s.active ? 'bg-orange-500 border-white text-white ring-4 ring-orange-100 animate-pulse' : 'bg-slate-100 border-white text-slate-400'}`}>
                                            {s.complete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                                        </div>
                                        <span className={`text-[10px] font-bold text-center leading-tight ${s.active ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 min-h-[400px] bg-slate-100 relative z-0 rounded-none lg:rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                        <MapContainer center={centerLoc as any} zoom={14} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <Marker position={pathCoords[0] as any}>
                                <Popup>{isToPickup ? 'Your Location' : 'Pickup Location'}</Popup>
                            </Marker>
                            <Marker position={pathCoords[1] as any}>
                                <Popup>{isToPickup ? 'Donor Location' : 'NGO Delivery Location'}</Popup>
                            </Marker>
                            <Polyline positions={pathCoords as any} color={isToPickup ? '#f97316' : '#22c55e'} weight={6} dashArray="8, 8" />
                        </MapContainer>
                        
                        {/* Map Overlay Info */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Navigation className="w-4 h-4 text-blue-500" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Distance</p>
                                    <p className="text-sm font-black text-slate-900">{task.distance ? task.distance.toFixed(1) : '3.2'} km</p>
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Clock className="w-4 h-4 text-orange-500" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">ETA</p>
                                    <p className="text-sm font-black text-slate-900">{task.distance ? Math.ceil(task.distance * 4) : '15'} mins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Details */}
                <div className="lg:col-span-4 flex flex-col gap-4 p-4 lg:p-0">
                    
                    {/* Alerts Panel */}
                    {(isToPickup || localStep === 'picked') && (
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-start gap-3 shadow-sm">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Urgent Mission</h4>
                                <p className="text-xs text-amber-700 font-medium mt-1">Food quality decreases over time. Please complete this phase within the next 30 minutes.</p>
                            </div>
                        </div>
                    )}

                    {/* Operational Control Panel */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
                        {isToPickup && localStep !== 'reached' && localStep !== 'picked' ? (
                            <div className="space-y-6 text-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-500 border-8 border-blue-50/50">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Heading to Donor</h3>
                                    <p className="text-slate-500 text-sm mt-2">Make your way to the pickup location. Tap below when you arrive.</p>
                                </div>
                                <button 
                                    onClick={() => setLocalStep('reached')}
                                    className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xl shadow-slate-200"
                                >
                                    I Have Reached
                                </button>
                            </div>
                        ) : isToPickup && localStep === 'reached' ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                                        <ShieldCheck className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Verify Pickup</h3>
                                    <p className="text-slate-500 text-sm mt-2">Ask the donor for the 4-digit OTP to confirm food handover.</p>
                                    
                                    {/* Testing Hint */}
                                    {task.pickupOtp && (
                                        <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mt-3 inline-block">
                                            Testing Hint: Donor OTP is {task.pickupOtp}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="• • • •" 
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full text-center text-4xl font-black tracking-[1em] py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                                    />
                                    {otpError && <p className="text-red-500 text-xs font-bold text-center mt-2">{otpError}</p>}
                                </div>

                                <button 
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Confirm OTP'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 text-center">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-500 border-8 border-emerald-50/50">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Deliver to NGO</h3>
                                    <p className="text-slate-500 text-sm mt-2">Food verified. Navigate to the NGO drop-off point.</p>
                                </div>
                                <button 
                                    onClick={handleDeliver}
                                    disabled={isDelivering}
                                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                                >
                                    {isDelivering ? <><Loader2 className="w-5 h-5 animate-spin" /> Completing...</> : 'Mark as Delivered'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Details Cards */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-slate-600" /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isToPickup ? 'Pickup From' : 'Deliver To'}</p>
                                <p className="text-sm font-bold text-slate-900">{isToPickup ? task.donor?.name || 'Restaurant' : ngoReq?.name || 'Local NGO'}</p>
                                <p className="text-xs font-medium text-slate-500 leading-snug mt-1">{isToPickup ? task.location : ngoReq?.address || 'NGO Address'}</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-slate-100"></div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-slate-600" /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Food Details</p>
                                <p className="text-sm font-bold text-slate-900">{task.foodType}</p>
                                <p className="text-xs font-medium text-slate-500 mt-1">Sufficient for ~15 people</p>
                            </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="pt-2 flex gap-2">
                            <button className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group">
                                <Phone className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                <span className="text-[10px] font-bold text-slate-500">Call Contact</span>
                            </button>
                            <button className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group" onClick={() => window.open(`https://maps.google.com/?q=${isToPickup ? task.location : (ngoReq?.address || '')}`)}>
                                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                <span className="text-[10px] font-bold text-slate-500">Open Maps</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
