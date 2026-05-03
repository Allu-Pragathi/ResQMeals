import { ShieldAlert, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface VerificationGateProps {
    role: 'donor' | 'ngo' | 'events' | 'volunteer'
    children: React.ReactNode
}

const VerificationGate = ({ role, children }: VerificationGateProps) => {
    const savedUser = localStorage.getItem('resqmeals_current_user')
    const user = savedUser ? JSON.parse(savedUser) : null
    
    if (user?.isVerified) {
        return <>{children}</>
    }

    // Otherwise, show the barrier UI
    return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-10 text-center relative overflow-hidden group">
                {/* Visual Elements */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-50 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="h-20 w-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-inner group-hover:rotate-6 transition-transform">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Verification Required</h3>
                    
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        To maintain a safe and trusted community, you must verify your identity before performing this action.
                    </p>
                    
                    <div className="w-full space-y-4">
                        <Link 
                            to={`/${role}/profile`}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
                        >
                            Complete Verification
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Usually takes less than 2 minutes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerificationGate
