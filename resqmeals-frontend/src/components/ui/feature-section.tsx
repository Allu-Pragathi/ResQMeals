import { MapPin, Receipt, Trophy, Users, Bell, ShieldCheck } from 'lucide-react'

const features = [
    {
        title: "Live Food Map",
        description: "Real-time geolocation tracking to find nearest donations and simplify logistics.",
        icon: <MapPin className="h-6 w-6 text-orange-500" />,
    },
    {
        title: "Tax & Compliance",
        description: "Automated generation of 80G tax receipts and donation certificates for businesses.",
        icon: <Receipt className="h-6 w-6 text-blue-500" />,
    },
    {
        title: "Gamified Leaderboards",
        description: "Earn points, badges, and recognition as a top donor or volunteer in your city.",
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
    },
    {
        title: "Volunteer Network",
        description: "Crowdsourced pickup and delivery system connecting verified volunteers.",
        icon: <Users className="h-6 w-6 text-green-500" />,
    },
    {
        title: "Instant Alerts",
        description: "Smart notifications for NGOs when food matches their specific requirements.",
        icon: <Bell className="h-6 w-6 text-purple-500" />,
    },
    {
        title: "Food Safety Verified",
        description: "AI-assisted verification checks to ensure all donated food meets safety standards.",
        icon: <ShieldCheck className="h-6 w-6 text-indigo-500" />,
    },
]

export function FeatureSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 py-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
                <div
                    key={index}
                    className="flex flex-col group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl hover:shadow-xl transition-all duration-200"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="mb-4 bg-gray-50 dark:bg-neutral-800 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                    </div>
                    <div className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2 relative z-10">
                        {feature.title}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 relative z-10">
                        {feature.description}
                    </p>
                </div>
            ))}
        </div>
    )
}
