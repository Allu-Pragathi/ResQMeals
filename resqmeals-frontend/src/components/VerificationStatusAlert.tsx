import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const VerificationStatusAlert = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [user, setUser] = useState<any>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const checkVerification = () => {
            const userStr = localStorage.getItem('resqmeals_current_user')
            if (userStr) {
                const userData = JSON.parse(userStr)
                setUser(userData)
                // Show if NOT verified
                setIsVisible(!userData.isVerified)
            }
        }

        checkVerification()
        // Check periodically or on focus
        const interval = setInterval(checkVerification, 5000)
        return () => clearInterval(interval)
    }, [])

    if (!isVisible || !user) return null

    const rolePath = user.role?.toLowerCase() || 'donor'

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className="fixed top-24 right-6 z-[60] w-80"
            >
                <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-orange-100 relative overflow-hidden group">
                    {/* Ambient Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all duration-700"></div>
                    
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 shadow-sm">
                            <ShieldAlert className="h-6 w-6 animate-pulse" />
                        </div>

                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">
                            Verify Your Account
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            Complete your email or phone verification to start receiving live food rescue notifications and mission alerts.
                        </p>

                        <button
                            onClick={() => navigate(`/${rolePath}/profile`)}
                            className="w-full bg-orange-600 text-white font-black py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group/btn text-sm"
                        >
                            Verify in Profile
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
                            <ShieldCheck className="h-3 w-3" />
                            Secure 256-bit Verification
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default VerificationStatusAlert
