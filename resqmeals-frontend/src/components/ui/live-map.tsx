// React imports removed as they are not currently used in this static version
// We need to add the leaflet CSS in index.html or import it here if we install the types
// For this MVP we will use an iframe or a simple image placeholder, 
// BUT to impress the user, let's create a "simulated" interactive map using CSS and images
// or a very simple leaflet implementation if we had the package.
// Let's stick to a high-quality "Live Map" visualization using a static image with pulsing markers.

export function LiveMapSection() {
    return (
        <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-white relative">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-neutral-100">
                <h3 className="font-bold text-lg text-primary">Our Reach Across India</h3>
                <p className="text-sm text-slate-600 mb-2">Delivering services in these key locations</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium">Active in 5 Major Cities</span>
                </div>
            </div>

            {/* 
        Ideally we would use an actual Map library like 'react-leaflet' or 'mapbox-gl' here.
        Using a high-quality dark map texture to simulate a digital map interface.
       */}
            <div className="relative aspect-video w-full bg-blue-50/30 group overflow-hidden flex items-center justify-center">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/India_map_blank.svg/800px-India_map_blank.svg.png"
                    alt="Service Locations Map"
                    className="h-[110%] w-auto object-contain -mt-8 opacity-90 hover:scale-105 transition-all duration-700"
                />

                {/* Animated Markers simulating live data across India */}
                {/* Delhi (North) */}
                <Marker top="30%" left="35%" label="Delhi: Fresh Bread Pickup" type="food" delay="0s" />
                {/* Mumbai (West) */}
                <Marker top="60%" left="25%" label="Mumbai: Wedding Surplus" type="food" delay="1s" />
                {/* Bangalore (South) */}
                <Marker top="80%" left="35%" label="Bangalore: Volunteer Van" type="volunteer" delay="2s" />
                {/* Kolkata (East) */}
                <Marker top="48%" left="65%" label="Kolkata: Restaurant Donation" type="food" delay="3s" />
                {/* Hyderabad (Central South) */}
                <Marker top="65%" left="40%" label="Hyderabad: Event Leftovers" type="food" delay="1.5s" />
            </div>
        </div>
    );
}

function Marker({ top, left, label, type, delay }: { top: string, left: string, label: string, type: 'food' | 'volunteer', delay: string }) {
    const color = type === 'food' ? 'bg-orange-500' : 'bg-green-500';

    return (
        <div
            className="absolute group cursor-pointer"
            style={{ top, left, animationDelay: delay }}
        >
            <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full ${color} opacity-75`} style={{ animationDuration: '3s', animationDelay: delay }}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${color} border-2 border-white shadow-md`}></span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1 bg-black/80 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {label}
                </div>
            </div>
        </div>
    )
}
