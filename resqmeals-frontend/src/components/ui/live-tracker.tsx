import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { MapPin, Truck, ExternalLink, Navigation } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Helper to calculate distance in KM
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export function LiveTrackingCard({ donationId }: { donationId: string }) {
    const [donation, setDonation] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [distance, setDistance] = useState<number | null>(null)

    const fetchStatus = async () => {
        try {
            const res = await api.get(`/donations/${donationId}`)
            const data = res.data.donation
            setDonation(data)
            
            if (data.latitude && data.longitude && data.currentLat && data.currentLng) {
                const d = getDistance(data.latitude, data.longitude, data.currentLat, data.currentLng);
                setDistance(d);
            }
        } catch (err) {
            console.error('Failed to fetch live status', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 5000) // Poll every 5s
        return () => clearInterval(interval)
    }, [donationId])

    if (isLoading && !donation) return <div className="animate-pulse h-32 bg-slate-100 rounded-3xl" />
    if (!donation || (donation.status !== 'Accepted' && donation.status !== 'Picked')) return null

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 border border-orange-200 shadow-xl shadow-orange-500/10 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Navigation className="w-24 h-24 rotate-45" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 p-2 rounded-xl text-white">
                            <Truck className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">Live Tracking</h3>
                            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Rescue in Progress</p>
                        </div>
                    </div>
                    <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                        <p className="text-xs font-bold text-orange-700">{donation.status === 'Picked' ? 'Picked Up & En Route' : 'Assigned - Driver Navigating'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Carrier Distance</p>
                        <p className="text-xl font-black text-slate-900">{distance ? `${distance.toFixed(1)} km` : 'Calculating...'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Arrival</p>
                        <p className="text-xl font-black text-slate-900">{distance ? `${Math.ceil(distance * 3)} mins` : '--'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="truncate">{donation.location}</span>
                    </div>
                    <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${donation.latitude},${donation.longitude}`, '_blank')}
                        className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-colors shadow-lg"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
