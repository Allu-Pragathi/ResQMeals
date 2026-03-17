import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export function DonorMap({ donorLocation }: { donorLocation?: string }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]">
            <div className="relative z-10 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Live Rescue Network
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Visualizing active NGOs and volunteers near {donorLocation || 'your location'}.
                </p>
            </div>

            <div className="absolute inset-0 z-0 bg-slate-50 flex items-center justify-center opacity-40">
                <img
                    src="/india-map.svg"
                    alt="India Map"
                    className="h-[120%] w-auto object-contain"
                />
            </div>

            {/* Simulated Live Markers */}
            <div className="absolute inset-0 z-10">
                {/* Donor Marker */}
                <Marker top="45%" left="50%" label="Your Location" type="donor" />

                {/* NGO Markers */}
                <Marker top="35%" left="42%" label="FoodBridge NGO" type="ngo" />
                <Marker top="55%" left="58%" label="HopeAid Foundation" type="ngo" />
                <Marker top="40%" left="60%" label="City Kitchen" type="ngo" />

                {/* Volunteer Markers */}
                <Marker top="30%" left="55%" label="Volunteer: Rahul" type="volunteer" />
                <Marker top="60%" left="45%" label="Volunteer: Priya" type="volunteer" />
                <Marker top="50%" left="35%" label="Volunteer: Amit" type="volunteer" />
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                    Your Restaurant
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                    Active NGOs
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                    Nearby Volunteers
                </div>
            </div>
        </div>
    )
}

function Marker({ top, left, label, type }: { top: string, left: string, label: string, type: 'donor' | 'ngo' | 'volunteer' }) {
    const color = type === 'donor' ? 'bg-primary' : type === 'ngo' ? 'bg-blue-500' : 'bg-emerald-500';

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="absolute group cursor-pointer"
            style={{ top, left }}
        >
            <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full ${color} opacity-20`}></span>
                <div className={`relative h-4 w-4 rounded-full ${color} border-2 border-white shadow-lg`}></div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl z-50">
                    {label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
            </div>
        </motion.div>
    )
}
