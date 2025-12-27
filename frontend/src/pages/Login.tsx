import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/auth'
import { ShieldCheck, User, Lock, Mail, ChevronRight } from 'lucide-react'

type TabType = 'login' | 'signup'

export default function Login() {
  const [activeTab, setActiveTab] = useState<TabType>('login')

  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Signup state
  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(username, password)
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Login failed'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupData.email)) {
      alert('Please enter a valid email address')
      return
    }

    // Password validation (8 characters)
    if (signupData.password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await authApi.register({
        email: signupData.email,
        username: signupData.username,
        password: signupData.password,
        role: 'USER'
      })
      alert('Account created successfully! Please login.')
      setSignupData({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      })
      setActiveTab('login')
    } catch (err: any) {
      console.error('Signup error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Registration failed'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#070b28] font-sans flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-cyan-500/10 rounded-full blur-[80px]"></div>

      {/* Main Glass Card */}
      <div className="relative w-full max-w-[450px] backdrop-blur-xl bg-white/5 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-12 transition-all duration-500 hover:border-white/20">

        {/* Glow inner */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-[0.2em] mb-2 uppercase">
            {activeTab === 'login' ? 'Login' : 'Sign Up'}
          </h1>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Form Section */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center text-white/60 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="mr-2 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-0" />
                Remember me
              </label>
              <button type="button" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative py-4 rounded-full bg-gradient-to-r from-[#ff8c42] via-[#ff5d5d] to-[#ff5d5d] text-white font-bold text-lg shadow-[0_10px_20px_rgba(255,93,93,0.3)] hover:shadow-[0_15px_25px_rgba(255,93,93,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        <div className="mt-10 text-center">
          <p className="text-white/40 text-sm">
            {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              className="text-blue-400 hover:text-blue-300 font-bold ml-1 underline decoration-2 underline-offset-4"
            >
              {activeTab === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

