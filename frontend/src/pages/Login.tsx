import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/auth'
import { ShieldCheck, User, Lock, Mail, Check } from 'lucide-react'

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
  const [rememberMe, setRememberMe] = useState(false)

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
    <div className="h-screen w-full relative bg-[#eef2f5] overflow-hidden flex flex-col items-center justify-end font-sans">

      {/* Wall / Room Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2942] to-[#2d405f] z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Desk Surface - Fixed Height Partition */}
      <div className="w-full h-[30vh] bg-[#dce1e6] relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex items-start justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

        {/* Keyboard and Mouse - Scaled and Positioned */}
        <div className="absolute top-10 sm:top-14 flex gap-8 items-center opacity-90 scale-[0.55] sm:scale-75 origin-top filter drop-shadow-2xl">
          <div
            className="w-[380px] h-[130px] bg-gradient-to-b from-[#b8c2cc] to-[#9ea7b0] rounded-lg p-2 flex flex-col gap-1.5 border-b-4 border-[#8a9299]"
            style={{ transform: 'perspective(600px) rotateX(25deg)' }}
          >
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-1.5 justify-center h-full">
                {[...Array(12)].map((_, j) => (
                  <div key={j} className="h-full flex-1 bg-[#f0f2f5] rounded-[2px] shadow-sm"></div>
                ))}
              </div>
            ))}
          </div>
          <div className="w-[70px] h-[110px] bg-gradient-to-b from-[#222] to-[#111] rounded-[30px] border-b-4 border-black relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[40%] bg-white/10"></div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-6 border border-white/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Monitor Stand - Connects Desk to Screen */}
      <div className="absolute bottom-[23vh] z-10 flex flex-col items-center scale-75 origin-bottom">
        <div
          className="w-48 h-24 bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] shadow-xl"
          style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
        ></div>
        <div className="w-64 h-3 bg-[#b5bac1] rounded-full -mt-1 shadow-lg"></div>
      </div>

      {/* Monitor Display - constrained by HEIGHT to fit viewport */}
      <div className="absolute bottom-[28vh] z-20 h-[67vh] max-w-[95vw] aspect-[16/10] bg-[#111] rounded-[16px] p-2 shadow-2xl ring-1 ring-white/10 flex flex-col transition-transform hover:scale-[1.01]">

        {/* Screen/Bezel Inner */}
        <div className="flex-1 w-full relative bg-gray-900 rounded-[8px] overflow-hidden border-b-[24px] border-black shadow-inner">

          {/* Camera Dot */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#222] rounded-full z-50 ring-1 ring-white/5"></div>

          {/* Brand Logo */}
          <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 text-white/20 text-[8px] uppercase tracking-[0.3em] font-medium z-50">GearGuard</div>

          {/* ACTUAL SCREEN CONTENT */}
          <div className="w-full h-full relative overflow-hidden bg-[#070b28] flex items-center justify-center p-4">

            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[60px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Scale the Login Card to fit the smaller screen area */}
            <div className="relative w-full max-w-[340px] md:max-w-[400px] backdrop-blur-md bg-white/5 border border-white/10 rounded-[20px] shadow-2xl p-5 scale-110 md:scale-125 origin-center">

              <div className="flex flex-col items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2 text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-widest uppercase">
                  {activeTab === 'login' ? 'Welcome' : 'Join Us'}
                </h2>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-2">
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 pl-8 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all text-[10px]"
                      />
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                    </div>
                    <div className="relative group">
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 pl-8 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all text-[10px]"
                      />
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                    </div>
                  </div>

                  <div className="flex justify-between text-[9px] text-blue-200/70">
                    <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                      <div className={`w-3 h-3 rounded border border-white/30 flex items-center justify-center ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-transparent'}`} onClick={() => setRememberMe(!rememberMe)}>
                        {rememberMe && <Check className="w-2 h-2 text-white" />}
                      </div>
                      Remember
                    </label>
                    <button type="button" className="hover:text-white">Forgot?</button>
                  </div>

                  <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-2 rounded-lg shadow-lg active:scale-95 transition-all text-xs">
                    {loading ? '...' : 'SIGN IN'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-2">
                  <div className="space-y-2">
                    <div className="relative group">
                      <input
                        type="email"
                        placeholder="Email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 pl-8 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all text-[10px]"
                      />
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Username"
                        value={signupData.username}
                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 pl-8 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all text-[10px]"
                      />
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                    </div>
                    <div className="relative group">
                      <input
                        type="password"
                        placeholder="Password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 pl-8 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all text-[10px]"
                      />
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                    </div>
                    <div className="relative group">
                      <input
                        type="password"
                        placeholder="Confirm"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 pl-8 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all text-[10px]"
                      />
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                    </div>
                  </div>
                  <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-2 rounded-lg shadow-lg active:scale-95 transition-all text-xs">
                    {loading ? '...' : 'CREATE'}
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <p className="text-white/30 text-[9px]">
                  <button onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')} className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline">
                    {activeTab === 'login' ? 'No account? Join' : 'Have account? Login'}
                  </button>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
