import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    UserCog,
    LogOut,
    HandHeart,
    UtensilsCrossed,
    BarChart3,
    Home,
    MapPin,
    Bell,
    AlertCircle,
    MessageSquare,
    Trophy,
    Users
} from 'lucide-react'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import ChatWidget from '@/components/ChatWidget'

export const Logo = () => {
    return (
        <Link
            to="/"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src="/logo.png" alt="ResQMeals Logo" className="h-7 w-auto flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-black dark:text-white whitespace-pre"
            >
                ResQMeals
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to="/"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src="/logo.png" alt="ResQMeals Logo" className="h-7 w-7 flex-shrink-0" />
        </Link>
    );
};

const DashboardLayout = () => {
    const [open, setOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)

    const [user, setUser] = useState<any>(null)
    const location = useLocation()

    useEffect(() => {
        const savedUser = localStorage.getItem('resqmeals_current_user')
        if (savedUser) setUser(JSON.parse(savedUser))
    }, [location.pathname]) // Refresh on navigation to catch status updates

    // Determine dashboard type based on path
    const isDonor = location.pathname.startsWith('/donor')
    const isNGO = location.pathname.startsWith('/ngo')
    const isEvents = location.pathname.startsWith('/events')
    const isAdmin = location.pathname.startsWith('/admin')
    const isVolunteer = location.pathname.startsWith('/volunteer')

    // Define links based on role
    const getLinks = () => {
        const commonLinks = [
            {
                label: "Home",
                href: "/",
                icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
            },
        ]

        if (isDonor) {
            return [
                {
                    label: "Home",
                    href: "/donor/home",
                    icon: <Home className="text-slate-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Dashboard",
                    href: "/donor",
                    icon: <LayoutDashboard className="text-slate-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "My Donations",
                    href: "/donor/donations", 
                    icon: <UtensilsCrossed className="text-slate-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Rescue Map",
                    href: "/donor/map",
                    icon: <MapPin className="text-slate-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Profile",
                    href: "/donor/profile",
                    icon: <UserCog className="text-slate-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Analytics", 
                    href: "/donor/analytics",
                    icon: <BarChart3 className="text-slate-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        if (isNGO) {
            return [
                {
                    label: "Home",
                    href: "/ngo/home",
                    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Dashboard",
                    href: "/ngo",
                    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Available Food",
                    href: "/ngo/available",
                    icon: <HandHeart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Mission Analytics",
                    href: "/ngo/analytics",
                    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Live Operations",
                    href: "/ngo/map",
                    icon: <MapPin className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Settings & Profile",
                    href: "/ngo/profile",
                    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        if (isEvents) {
            return [
                {
                    label: "Home",
                    href: "/events/home",
                    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Dashboard",
                    href: "/events",
                    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Schedule Pickup",
                    href: "/events/schedule",
                    icon: <UtensilsCrossed className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Live Control",
                    href: "/events/control",
                    icon: <MapPin className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Impact Analytics",
                    href: "/events/analytics",
                    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Profile",
                    href: "/events/profile",
                    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        if (isVolunteer) {
            return [
                {
                    label: "Home",
                    href: "/volunteer/home",
                    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Missions",
                    href: "/volunteer/missions",
                    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Dashboard",
                    href: "/volunteer/dashboard",
                    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Profile",
                    href: "/volunteer/profile",
                    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        if (isAdmin) {
            return [
                {
                    label: "Home",
                    href: "/admin/home",
                    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Overview",
                    href: "/admin",
                    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Manage Users",
                    href: "/admin/users",
                    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        // Default fallback
        return commonLinks
    }

    const links = getLinks()

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-[#262626] w-full flex-1 mx-auto overflow-hidden",
                "h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink 
                                    key={idx} 
                                    link={link} 
                                    className="text-slate-300 hover:text-white transition-colors py-3"
                                />
                            ))}
                            

                        </div>
                    </div>
                    <div>
                        {/* Compact Verification Banner for Sidebar */}
                        {user && !user.isVerified && !location.pathname.includes('/profile') && (
                            <div className="mb-4">
                                <Link
                                    to={isNGO ? "/ngo/profile" : (isDonor ? "/donor/profile" : (isEvents ? "/events/profile" : "/volunteer/profile"))}
                                    className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-0.5 group/verify relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm shrink-0 z-10">
                                        <AlertCircle className="h-5 w-5 text-white animate-pulse" />
                                    </div>
                                    <motion.div 
                                        initial={false}
                                        animate={{ opacity: open ? 1 : 0, display: open ? 'block' : 'none' }}
                                        className="whitespace-nowrap z-10"
                                    >
                                        <p className="font-black text-xs uppercase tracking-wider">Unverified</p>
                                        <p className="text-[10px] font-medium text-orange-100 uppercase tracking-widest mt-0.5">Click to unlock</p>
                                    </motion.div>
                                </Link>
                            </div>
                        )}
                        <div className="mt-2 border-t border-neutral-200 dark:border-neutral-700 pt-2">
                            <SidebarLink
                                link={{
                                    label: "Logout",
                                    href: "/auth",
                                    icon: <LogOut className="text-slate-200 h-5 w-5 flex-shrink-0" />
                                }}
                                className="text-slate-300 hover:text-white transition-colors"
                                onClick={() => {
                                    localStorage.removeItem('resqmeals_current_user')
                                }}
                            />
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div 
                className={cn(
                    "flex flex-1 relative overflow-y-auto p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 shadow-[inset_0px_4px_20px_rgba(0,0,0,0.05)]",
                    (isVolunteer || isDonor || isNGO) ? "bg-cover bg-center bg-fixed" : "bg-[#fafafa] dark:bg-neutral-900"
                )}
                style={(isVolunteer || isDonor || isNGO) ? { backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.85) 0, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.9) 100%), url("/food-background.png")' } : undefined}
            >
                {/* Decorative Ambient Background */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-tl-2xl">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    {/* Ambient Glows */}
                    <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[40%] -left-40 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-40 left-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[150px]"></div>
                </div>

                <div className="w-full h-full relative z-10">

                    <Outlet />
                </div>


                {/* AI Chat Assistant FAB */}
                <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 group",
                            isChatOpen 
                                ? "bg-slate-900 border border-white/10 text-white scale-90" 
                                : "bg-orange-500 text-white hover:bg-orange-600 hover:scale-110 active:scale-95 shadow-orange-500/30"
                        )}
                    >
                        <div className="relative">
                           <MessageSquare className="w-6 h-6" />
                           {!isChatOpen && (
                             <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                             </span>
                           )}
                        </div>
                        <span className="font-bold text-sm">ResQ AI</span>
                    </button>
                    
                    <ChatWidget 
                        isOpen={isChatOpen} 
                        onToggle={() => setIsChatOpen(false)} 
                    />
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
