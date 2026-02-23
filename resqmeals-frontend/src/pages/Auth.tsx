import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, User, MapPin } from 'lucide-react'
import axios from 'axios'
import RoleSelector from '../components/RoleSelector'

const Auth = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState('Donor')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setPassword('')
    setRole('Donor')
  }

  const handleForgotPassword = () => {
    const input = prompt('Please enter your email to reset password:')
    if (input) alert(`Password reset link sent to ${input}`)
  }

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (!pass) return 0
    if (pass.length > 6) score += 1
    if (pass.length > 10) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }

  const strength = getPasswordStrength(password)

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, reverse geocode here. For now, use coords.
          setAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`)
        },
        () => {
          setError('Could not access location. Please enter manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Live Backend Login Logic
        const response = await axios.post('http://localhost:8000/api/auth/login', {
          email,
          password
        })

        const { token, user } = response.data

        // Save live token and user to local storage (replacing mock data)
        localStorage.setItem('resqmeals_token', token)
        localStorage.setItem('resqmeals_current_user', JSON.stringify(user))

        navigate(`/${user.role.toLowerCase()}`)
      } else {
        // Live Backend Signup Logic
        if (strength < 3) {
          setError('Please choose a stronger password')
          setIsLoading(false)
          return
        }

        const response = await axios.post('http://localhost:8000/api/auth/register', {
          email,
          password,
          role: role.toUpperCase(),
          name,
          address
        })

        const { token, user } = response.data

        // Save live token and user to local storage
        localStorage.setItem('resqmeals_token', token)
        localStorage.setItem('resqmeals_current_user', JSON.stringify(user))

        navigate(`/${user.role.toLowerCase()}`)
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError('A network error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding & Quote */}
      {/* Left Side - Branding & Quote */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Logo Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900" /> {/* Dark base */}
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2670&auto=format&fit=crop"
            alt="Community Food Sharing"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ResQMeals Logo" className="h-12 w-12 object-contain bg-white/10 backdrop-blur-md rounded-xl p-1.5" />
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">ResQMeals</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <blockquote className="text-3xl font-bold leading-tight mb-6 drop-shadow-lg font-serif italic">
            "We make a living by what we get, but we make a life by what we give."
          </blockquote>
          <p className="text-lg text-slate-300 font-medium drop-shadow-md">
            Join a community of changemakers ensuring no food goes to waste and no one goes hungry.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © {new Date().getFullYear()} ResQMeals Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isLogin ? 'Enter your details to access your dashboard' : 'Join us to start your journey'}
            </p>
          </div>

          {/* Social Logins (Visual Only) */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Facebook</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Role Selector */}
          {!isLogin && (
            <div className="bg-slate-50 p-1 rounded-xl">
              <RoleSelector value={role} onChange={setRole} />
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder={role === 'NGO' ? 'Organization Name' : 'John Doe'}
                      type="text"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                        placeholder="City, Region"
                        type="text"
                        required={!isLogin}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={getLocation}
                      className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      title="Use Current Location"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {!isLogin && password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <div className="flex gap-1 h-1.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-full rounded-full flex-1 transition-all duration-300 ${i < strength
                          ? strength < 3 ? 'bg-red-400' : strength < 4 ? 'bg-yellow-400' : 'bg-green-500'
                          : 'bg-slate-200'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 text-right font-medium">
                    {strength < 3 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
              </div>

              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-primary hover:text-primaryDark hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primaryDark hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={toggleAuthMode}
              className="text-sm font-bold text-primary hover:underline uppercase tracking-wide"
            >
              {isLogin ? 'Sign up for free' : 'Log in to existing account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
