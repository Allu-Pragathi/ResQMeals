

export function LiveMapSection() {
    return (
        <div className="w-full relative h-[600px] rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">Live Donations Map</h3>
                    <p className="text-sm text-slate-500">Active in 3 Cities: Mumbai, Delhi, Bangalore</p>
                </div>
            </div>

            {/* Map Area */}
            <div className="absolute inset-0 z-0 bg-blue-100 relative overflow-hidden flex items-center justify-center">
                {/* India Map Background */}
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/India_location_map.svg/800px-India_location_map.svg.png"
                    alt="India Map"
                    className="h-[95%] w-auto object-contain opacity-70"
                />

                {/* Markers for Major Cities (Adjusted for this specific map projection) */}
                {/* Delhi */}
                <Marker top="28%" left="37%" label="Delhi" type="restaurant" />

                {/* Mumbai */}
                <Marker top="58%" left="28%" label="Mumbai" type="ngo" />

                {/* Bangalore */}
                <Marker top="78%" left="38%" label="Bangalore" type="restaurant" />
            </div>

            {/* Map Controls (Zoom buttons) */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function Marker({ top, left, label, type }: { top: string, left: string, label: string, type: 'restaurant' | 'ngo' }) {
    const color = type === 'restaurant' ? 'bg-emerald-500' : 'bg-orange-500';

    return (
        <div
            className="absolute group cursor-pointer"
            style={{ top, left }}
        >
            <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full ${color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${color} border-2 border-white shadow-md`}></span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl z-50">
                    {label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
            </div>
        </div>
    )
}

