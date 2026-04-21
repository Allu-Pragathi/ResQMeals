import { useState, useEffect } from 'react'
import { ShieldCheck, Mail, Phone, Loader2, CheckCircle2, Send, Award, Star, Bot } from 'lucide-react'
import api from '../lib/api'

const ProfileVerificationCenter = () => {
    const [user, setUser] = useState<any>(null)
    const [otp, setOtp] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [activeType, setActiveType] = useState<'EMAIL' | 'PHONE' | null>(null)
    const [cooldown, setCooldown] = useState(0)

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me')
            const latestUser = res.data.user
            localStorage.setItem('resqmeals_current_user', JSON.stringify(latestUser))
            setUser(latestUser)
            return latestUser
        } catch (err) {
            console.error("Failed to fetch user:", err)
            const savedUser = localStorage.getItem('resqmeals_current_user')
            if (savedUser) setUser(JSON.parse(savedUser))
            return savedUser ? JSON.parse(savedUser) : null
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        let timer: any;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown(c => c - 1), 1000)
        }
        return () => clearInterval(timer)
    }, [cooldown])

    const handleSendOtp = async (method: 'EMAIL' | 'PHONE') => {
        if (cooldown > 0) return;
        
        setIsSending(true)
        setActiveType(method)
        try {
            // Re-fetch user to make sure we have the latest email/phone
            const latestUser = await fetchUser()
            const target = method === 'EMAIL' ? latestUser?.email : latestUser?.phone
            
            if (!target) throw new Error(`${method === 'EMAIL' ? 'Email' : 'Phone'} is required for verification. Please add it in your profile settings.`)

            await api.post('/verify/send-otp', { method })
            setCooldown(30) // 30s resend delay
            alert(`A 6-digit verification code has been sent to your ${method === 'EMAIL' ? 'email' : 'phone'}.`)
        } catch (err: any) {
            console.error("Send OTP Error:", err);
            alert(err.response?.data?.error || err.message || 'Failed to send code. Please try again.');
        } finally {
            setIsSending(false)
        }
    }

    const handleVerify = async () => {
        setIsVerifying(true)
        try {
            const res = await api.post('/verify/confirm-otp', { 
                code: otp,
                method: activeType
            })
            
            const updatedUser = {
                ...user,
                isVerified: true,
                verificationMethod: activeType
            }
            localStorage.setItem('resqmeals_current_user', JSON.stringify(updatedUser))
            setUser(updatedUser)
            setActiveType(null)
            setOtp('')
            alert('Profile verification successful! You now have full access to platform features.');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Invalid or expired code. Please try again.');
        } finally {
            setIsVerifying(false)
        }
    }

    if (!user) return null

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10 mb-12 group transition-all duration-500 hover:shadow-2xl hover:shadow-orange-200/20">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-orange-50 to-transparent rounded-full -mr-20 -mt-20 opacity-40 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all duration-500">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                Profile Verification 
                                {user.isVerified ? (
                                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black ml-2">Verified</span>
                                ) : (
                                    <span className="flex items-center gap-1 bg-rose-100 text-rose-600 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black ml-2">Not Verified</span>
                                )}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm mt-1">Verify your account to access all platform features and trusted status.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 shadow-inner group/stat">
                            <Award className="w-4 h-4 text-orange-400 group-hover/stat:scale-110 transition-transform" />
                            <span className="text-sm font-black text-slate-800">Trusted Member</span>
                        </div>
                    </div>
                </div>

                {user.isVerified ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 animate-in zoom-in-95 duration-500">
                        <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-emerald-900">Verification Success!</h4>
                            <p className="text-emerald-700 font-medium text-sm mt-1">Verified via {user.verificationMethod}. You now have full permissions to donate, volunteer, and host events.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email Method */}
                            <button 
                                onClick={() => handleSendOtp('EMAIL')}
                                disabled={isSending}
                                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group/btn ${activeType === 'EMAIL' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-orange-500 group-hover/btn:scale-110 transition-transform">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method 01</p>
                                        <p className="text-sm font-black text-slate-900">Verify with Email (Recommended)</p>
                                    </div>
                                </div>
                                <CheckCircle2 className={`w-5 h-5 ${activeType === 'EMAIL' ? 'text-orange-500' : 'text-slate-200'}`} />
                            </button>

                            {/* Phone Method */}
                            <button 
                                onClick={() => handleSendOtp('PHONE')}
                                disabled={isSending}
                                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group/btn ${activeType === 'PHONE' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-500 group-hover/btn:scale-110 transition-transform">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method 02</p>
                                        <p className="text-sm font-black text-slate-900">Verify with Phone</p>
                                    </div>
                                </div>
                                <CheckCircle2 className={`w-5 h-5 ${activeType === 'PHONE' ? 'text-blue-500' : 'text-slate-200'}`} />
                            </button>
                        </div>

                        {activeType && (
                            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] mt-8 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                                <Bot className="absolute top-0 right-0 w-32 h-32 text-white/5 -mr-8 -mt-8 rotate-12" />
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black flex items-center gap-3">
                                            Enter 6-Digit Code
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white/60">Sent to {activeType === 'EMAIL' ? user.email : user.phone}</span>
                                        </h4>
                                        <p className="text-slate-400 text-sm mt-1">Codes expire in 5 minutes. Check your inbox/phone.</p>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex-1 min-w-[180px]">
                                            <input 
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                placeholder="••••••"
                                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-2xl font-black text-center tracking-[0.5em] focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20"
                                            />
                                            {cooldown > 0 ? (
                                                <p className="text-[10px] font-bold text-slate-500 mt-2 text-center uppercase tracking-widest">Resend in {cooldown}s</p>
                                            ) : (
                                                <button 
                                                    onClick={() => handleSendOtp(activeType)}
                                                    className="w-full text-[10px] font-bold text-orange-400 mt-2 hover:text-orange-300 uppercase tracking-widest transition-colors"
                                                >
                                                    Resend Code?
                                                </button>
                                            )}
                                        </div>
                                        <button 
                                            onClick={handleVerify}
                                            disabled={otp.length !== 6 || isVerifying}
                                            className="px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-900/40 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                                        >
                                            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileVerificationCenter
