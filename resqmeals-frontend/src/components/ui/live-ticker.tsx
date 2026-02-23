"use client";
const events = [
    "Starbucks Mumbai just donated 40 pastries",
    "Hope NGO claimed 20kg of rice in Delhi",
    "150 meals saved in Bangalore today",
    "Spice Garden listed 5kg of curry in Chennai",
    "Green Earth NGO fed 50 families in Hyderabad",
    "Fresh Bakery Pune donated 30 loves of bread",
    "New volunteer joined from Kolkata",
    "500kg of food rescued this week!"
];

export const LiveTicker = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-700 overflow-hidden py-2 z-50 shadow-2xl">
            <div className="flex min-w-full w-max animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused] items-center">
                {/* Render items multiple times for seamless loop */}
                {[...events, ...events, ...events].map((event, index) => (
                    <div key={index} className="flex items-center mx-4 md:mx-8">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-3 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        <span className="text-xs md:text-sm font-medium text-slate-300 whitespace-nowrap tracking-wide">
                            {event}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
