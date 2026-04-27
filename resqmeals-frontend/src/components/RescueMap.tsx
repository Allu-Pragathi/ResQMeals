import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Filter, Navigation, Activity, Clock, Building, ShieldCheck, HeartPulse, SlidersHorizontal, Map as MapIcon, Zap, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM ICONS ---
const createIcon = (color: string, emoji: string, size = 28) => L.divIcon({
  html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: ${size/2}px;">${emoji}</div>`,
  className: '', iconSize: [size, size], iconAnchor: [size/2, size/2]
});

const donorIcon = createIcon('#3b82f6', '📍', 24);
const volIcon = createIcon('#f97316', '🛵', 32);

const ngoIcons = {
  'Accepting': createIcon('#10b981', '🏢', 28),
  'Busy': createIcon('#eab308', '🏢', 28),
  'Full': createIcon('#ef4444', '🏢', 28),
};

const DONOR_POS: [number, number] = [17.4381, 78.3953];
const START_VOL_POS: [number, number] = [17.4200, 78.3800];

const mockNGOs = [
  { id: 1, name: 'Hope Foundation', pos: [17.4550, 78.4110], status: 'Accepting', capacity: '45%', distance: 2.4 },
  { id: 2, name: 'FoodBank Hyd', pos: [17.4320, 78.4150], status: 'Busy', capacity: '85%', distance: 3.1 },
  { id: 3, name: 'Robin Hood Army', pos: [17.4250, 78.3800], status: 'Full', capacity: '100%', distance: 4.2 },
  { id: 4, name: 'No Food Waste', pos: [17.4480, 78.3850], status: 'Accepting', capacity: '20%', distance: 1.8 },
];

const demandZones = [
  { pos: [17.4450, 78.4000] as [number, number], radius: 1200, color: '#ef4444', intensity: 'High Demand' }, // Red
  { pos: [17.4250, 78.4100] as [number, number], radius: 1500, color: '#eab308', intensity: 'Medium Demand' }, // Yellow
  { pos: [17.4500, 78.3800] as [number, number], radius: 1800, color: '#22c55e', intensity: 'Low Demand' }, // Green
];

export default function RescueMap({ user }: { user: any }) {
  const [activeDispatch, setActiveDispatch] = useState<boolean>(false);
  const [volPos, setVolPos] = useState<[number, number]>(START_VOL_POS);
  const [eta, setEta] = useState('12 mins');
  
  // Filters
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredNGOs = mockNGOs.filter(n => filterStatus === 'All' || n.status === filterStatus);
  const bestMatch = mockNGOs.find(n => n.status === 'Accepting' && n.distance === 1.8);

  // Live Tracking Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeDispatch) {
      let step = 0;
      const totalSteps = 200;
      setVolPos(START_VOL_POS);
      
      interval = setInterval(() => {
        step++;
        const lat = START_VOL_POS[0] + ((DONOR_POS[0] - START_VOL_POS[0]) * (step / totalSteps));
        const lng = START_VOL_POS[1] + ((DONOR_POS[1] - START_VOL_POS[1]) * (step / totalSteps));
        setVolPos([lat, lng]);
        
        setEta(`${Math.max(1, Math.ceil(12 * (1 - step/totalSteps)))} mins`);

        if (step >= totalSteps) {
          clearInterval(interval);
          setActiveDispatch(false);
          alert("Volunteer has arrived!");
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeDispatch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <MapIcon className="w-8 h-8 text-orange-500" /> Live Rescue Radar
          </h2>
          <p className="text-slate-500 font-medium mt-1">Real-time geospatial intelligence for food redistribution.</p>
        </div>
        <button 
          onClick={() => setActiveDispatch(!activeDispatch)}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center gap-2 ${activeDispatch ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-orange-600 text-white shadow-orange-500/30 hover:bg-orange-700'}`}
        >
          {activeDispatch ? <><Activity className="w-4 h-4 animate-pulse" /> Stop Dispatch</> : <><PlayCircle className="w-4 h-4" /> Simulate Dispatch</>}
        </button>
      </div>

      <div className="relative h-[700px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-50 z-0">
        <MapContainer center={DONOR_POS} zoom={13.5} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={false}>
          {/* Using a clean, light map style for SaaS feel */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          {/* Heatmap Overlay */}
          {showHeatmap && demandZones.map((zone, i) => (
             <Circle key={`zone-${i}`} center={zone.pos} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15, stroke: false }}>
                <Popup>
                  <p className="font-black text-sm">{zone.intensity}</p>
                </Popup>
             </Circle>
          ))}

          {/* Donor 5KM Radius */}
          {showRadius && (
            <Circle center={DONOR_POS} radius={5000} pathOptions={{ color: '#3b82f6', weight: 1, dashArray: '5, 10', fillOpacity: 0.03 }} />
          )}

          {/* Donor Location */}
          <Marker position={DONOR_POS} icon={donorIcon}>
            <Popup><div className="font-bold text-center">Your Location<br/><span className="text-[10px] text-slate-400">Hub</span></div></Popup>
          </Marker>

          {/* NGOs */}
          {filteredNGOs.map(ngo => (
            <Marker key={ngo.id} position={ngo.pos as [number, number]} icon={ngoIcons[ngo.status as keyof typeof ngoIcons]}>
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <h4 className="font-black text-slate-900 text-sm mb-1">{ngo.name}</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ngo.status === 'Accepting' ? 'bg-emerald-100 text-emerald-700' : ngo.status === 'Busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {ngo.status}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{ngo.distance} km</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800" style={{ width: ngo.capacity }}></div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Capacity: {ngo.capacity}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Best Match Line */}
          {bestMatch && !activeDispatch && (
             <Polyline positions={[DONOR_POS, bestMatch.pos as [number, number]]} pathOptions={{ color: '#10b981', weight: 3, dashArray: '5, 8' }} />
          )}

          {/* Live Dispatch Tracking */}
          {activeDispatch && (
             <>
               <Marker position={volPos} icon={volIcon}>
                 <Popup><div className="font-bold text-orange-600 text-center">Arjun K. <br/><span className="text-xs text-slate-500">ETA: {eta}</span></div></Popup>
               </Marker>
               <Polyline positions={[volPos, DONOR_POS]} pathOptions={{ color: '#f97316', weight: 4 }} />
             </>
          )}

        </MapContainer>

        {/* --- FLOATING OVERLAYS --- */}

        {/* Top Left: Active Status */}
        {activeDispatch && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 left-6 z-[1000] bg-white/70 backdrop-blur-2xl border-white/60 p-4 rounded-2xl shadow-xl border border-orange-100 w-64">
            <div className="flex items-center gap-3 mb-3">
               <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
               </div>
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">Live Mission</p>
            </div>
            <h4 className="font-black text-slate-900 text-lg">Volunteer En Route</h4>
            <div className="flex justify-between items-center mt-3 bg-orange-50 p-2 rounded-xl">
               <span className="text-xs font-bold text-orange-800 flex items-center gap-1"><Clock className="w-3 h-3" /> ETA</span>
               <span className="text-sm font-black text-orange-600">{eta}</span>
            </div>
          </motion.div>
        )}

        {/* Top Right: Filter Panel */}
        <div className="absolute top-6 right-6 z-[1000] bg-white/70 backdrop-blur-2xl border-white/60 p-5 rounded-2xl shadow-xl border border-slate-100 w-72">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
             <SlidersHorizontal className="w-4 h-4" /> Map Controls
          </h4>
          
          <div className="space-y-4">
             <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">NGO Status</p>
               <div className="grid grid-cols-2 gap-2">
                 {['All', 'Accepting', 'Busy', 'Full'].map(s => (
                   <button key={s} onClick={() => setFilterStatus(s)} className={`py-1.5 text-xs font-bold rounded-lg transition-colors border ${filterStatus === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white/70 backdrop-blur-2xl border-white/60 text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                     {s}
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-2">
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-xs font-bold text-slate-700 flex items-center gap-2"><Activity className="w-4 h-4 text-rose-500" /> Demand Heatmap</span>
                 <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} className="accent-orange-500 w-4 h-4" />
               </label>
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-xs font-bold text-slate-700 flex items-center gap-2"><Navigation className="w-4 h-4 text-blue-500" /> 5KM Radius Limit</span>
                 <input type="checkbox" checked={showRadius} onChange={e => setShowRadius(e.target.checked)} className="accent-orange-500 w-4 h-4" />
               </label>
             </div>
          </div>
        </div>

        {/* Bottom Left: Legend */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/70 backdrop-blur-2xl border-white/60 p-4 rounded-2xl shadow-xl border border-slate-100 flex gap-6">
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Entities</p>
             <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs font-bold">Donor</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs font-bold">NGO</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-xs font-bold">Volunteer</span></div>
             </div>
          </div>
          <div className="border-l border-slate-200 pl-6">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Demand Zones</p>
             <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div><span className="text-xs font-bold">High</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div><span className="text-xs font-bold">Med</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div><span className="text-xs font-bold">Low</span></div>
             </div>
          </div>
        </div>

        {/* Bottom Right: Intelligence Output */}
        {bestMatch && !activeDispatch && (
           <div className="absolute bottom-6 right-6 z-[1000] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 w-72">
             <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-widest">Best Match Found</h4>
             </div>
             <p className="text-sm font-bold">{bestMatch.name}</p>
             <p className="text-xs text-slate-400 mt-1">{bestMatch.distance} km away • Accepting Food</p>
           </div>
        )}

      </div>
    </div>
  );
}
