import { useState, useEffect } from 'react'
import api from '../../lib/api'

export function LiveMapSection({ isEdgeToEdge = false }: { isEdgeToEdge?: boolean } = {}) {
    const [markers, setMarkers] = useState<any[]>([])
    const [zoom, setZoom] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
        setZoom(1.5) // Auto zoom slightly for better detail in fullscreen
    }

    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                const res = await api.get('/donations')
                if (res.data.donations && res.data.donations.length > 0) {
                    setMarkers(res.data.donations)
                } else {
                    // Fallback realistic sample data
                    setMarkers([
                        { id: '1', latitude: 28.6139, longitude: 77.2090, foodType: '50 Buffet Meals', donor: { name: 'Spice Garden Restaurant' }, status: 'live' },
                        { id: '2', latitude: 19.0760, longitude: 72.8777, foodType: '120 Baked Goods', donor: { name: 'Taj Hotel' }, status: 'picked_up' },
                        { id: '3', latitude: 12.9716, longitude: 77.5946, foodType: '30 Groceries', donor: { name: 'FreshMart' }, status: 'live' },
                        { id: '4', latitude: 13.0827, longitude: 80.2707, foodType: '80 Meals', donor: { name: 'Southern Spice' }, status: 'live' },
                        { id: '5', latitude: 17.3850, longitude: 78.4867, foodType: '45 Biryani Packs', donor: { name: 'Hyderabadi Kitchen' }, status: 'picked_up' },
                    ])
                }
            } catch (err) {
                console.error('Failed to fetch map data', err)
                // Fallback realistic sample data
                setMarkers([
                    { id: '1', latitude: 28.6139, longitude: 77.2090, foodType: '50 Buffet Meals', donor: { name: 'Spice Garden Restaurant' }, status: 'live' },
                    { id: '2', latitude: 19.0760, longitude: 72.8777, foodType: '120 Baked Goods', donor: { name: 'Taj Hotel' }, status: 'picked_up' },
                    { id: '3', latitude: 12.9716, longitude: 77.5946, foodType: '30 Groceries', donor: { name: 'FreshMart' }, status: 'live' },
                    { id: '4', latitude: 13.0827, longitude: 80.2707, foodType: '80 Meals', donor: { name: 'Southern Spice' }, status: 'live' },
                    { id: '5', latitude: 17.3850, longitude: 78.4867, foodType: '45 Biryani Packs', donor: { name: 'Hyderabadi Kitchen' }, status: 'picked_up' },
                ])
            }
        }
        fetchMarkers()
    }, [])

    // Calibrated projection for the new premium map image
    const project = (lat: number, lng: number) => {
        // Delhi: 28.6, 77.2 -> ~15% top, 45% left
        // Bangalore: 12.9, 77.6 -> ~75% top, 47% left
        // Mumbai: 19.0, 72.8 -> ~55% top, 30% left
        const top = 15 + (28.6 - lat) * 4.2
        const left = 45 + (lng - 77.2) * 2.8
        return { top: `${top}%`, left: `${left}%` }
    }

    return (
        <div className={`
            ${isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen rounded-none' : `relative w-full ${isEdgeToEdge ? 'h-full rounded-none border-x-0 border-y' : 'h-[600px] rounded-2xl border'} border-slate-200`}
            transition-all duration-500 ease-in-out overflow-hidden shadow-2xl bg-slate-50
        `}>
            {/* Top Bar */}
            <div className={`absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between ${isFullscreen || isEdgeToEdge ? 'py-8 px-10' : ''}`}>
                <div>
                    <h3 className={`font-bold text-slate-900 ${isFullscreen || isEdgeToEdge ? 'text-3xl' : 'text-lg'}`}>Live Rescue Operations</h3>
                    <p className="text-sm text-slate-500">Currently showing {markers.length} active rescues across India</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Service Cities</span>
                    </div>
                    <div className="flex items-center gap-2 md:flex hidden">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 blink"></div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Donations</span>
                    </div>
                    {isFullscreen && (
                        <button 
                            onClick={toggleFullscreen}
                            className="ml-4 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
                        >
                            Exit Fullscreen
                        </button>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="absolute inset-0 z-0 bg-slate-100/50 overflow-hidden cursor-grab active:cursor-grabbing">
                <div 
                    className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center relative"
                    style={{ transform: `scale(${zoom})` }}
                >
                    {/* India Map Background */}
                    <img
                        src="/india-map-premium.png"
                        alt="India Map"
                        className="h-[100%] w-full object-cover opacity-80 mix-blend-multiply pointer-events-none"
                    />

                {/* Service Cities (Static) */}
                <Marker top="15%" left="45%" label="Service Hub: Delhi" type="ngo" />
                <Marker top="55%" left="30%" label="Service Hub: Mumbai" type="ngo" />
                <Marker top="75%" left="47%" label="Service Hub: Bangalore" type="ngo" />

                {/* Live Markers */}
                {markers.map((item) => {
                    if (!item.latitude || !item.longitude) return null;
                    const pos = project(item.latitude, item.longitude);
                    return (
                        <Marker 
                            key={item.id} 
                            top={pos.top} 
                            left={pos.left} 
                            label={`${item.donor?.name || 'Restaurant'}`} 
                            subLabel={`${item.foodType}`}
                            type="restaurant" 
                            status={item.status || 'live'}
                        />
                    )
                })}
                </div>
            </div>

            {/* Map Controls (Zoom buttons) */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                {!isFullscreen && (
                    <button 
                        onClick={toggleFullscreen}
                        className="w-10 h-10 bg-orange-500 text-white rounded-lg shadow-lg border border-orange-400 flex items-center justify-center hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 mb-2"
                        title="View Fullscreen"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                )}
                <button 
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                    title="Zoom In"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                    title="Zoom Out"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function Marker({ top, left, label, subLabel, type, status }: { top: string, left: string, label: string, subLabel?: string, type: 'restaurant' | 'ngo', status?: string }) {
    const isLive = status !== 'picked_up';
    const color = type === 'restaurant' ? (isLive ? 'bg-orange-500' : 'bg-blue-500') : 'bg-emerald-500';

    return (
        <div
            className="absolute group cursor-pointer z-10 hover:z-50"
            style={{ top, left }}
        >
            <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                {isLive && <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full ${color} opacity-75`}></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${color} border-2 border-white shadow-md`}></span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max p-3 bg-white border border-slate-100 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-2xl z-50">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-slate-900 text-sm">{label}</span>
                            {status && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isLive ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {isLive ? 'Live Rescue' : 'In Transit'}
                                </span>
                            )}
                        </div>
                        {subLabel && <span className="text-slate-500 text-xs font-medium">{subLabel}</span>}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-white"></div>
                </div>
            </div>
        </div>
    )
}

