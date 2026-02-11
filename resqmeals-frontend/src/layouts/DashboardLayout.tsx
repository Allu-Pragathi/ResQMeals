import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    UserCog,
    Settings,
    LogOut,
    HandHeart,
    UtensilsCrossed,
    BarChart3,
    Home
} from 'lucide-react'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

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
    const location = useLocation()

    // Determine dashboard type based on path
    const isDonor = location.pathname.startsWith('/donor')
    const isNGO = location.pathname.startsWith('/ngo')
    const isAdmin = location.pathname.startsWith('/admin')

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
                ...commonLinks,
                {
                    label: "Dashboard",
                    href: "/donor",
                    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "My Donations",
                    href: "/donor/donations", // Ideally these would exist
                    icon: <UtensilsCrossed className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
                {
                    label: "Profile",
                    href: "/donor/profile",
                    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        if (isNGO) {
            return [
                ...commonLinks,
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
                    label: "Profile",
                    href: "/ngo/profile",
                    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },
            ]
        }

        if (isAdmin) {
            return [
                ...commonLinks,
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
                "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
                "h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="mt-2 border-t border-neutral-200 dark:border-neutral-700 pt-2">
                            <SidebarLink
                                link={{
                                    label: "Logout",
                                    href: "/auth",
                                    icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                }}
                            />
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-y-auto bg-white dark:bg-neutral-900 p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700">
                <div className="w-full h-full">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
