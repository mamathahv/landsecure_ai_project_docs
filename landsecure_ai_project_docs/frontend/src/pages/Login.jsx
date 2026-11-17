import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import http, { setToken } from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const demoAccounts = [
    {
      role: 'admin',
      label: 'Administrator',
      email: 'admin@example.com',
      badge: 'Full Access',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      desc: 'Threat telemetry, alerts & audit control'
    },
    {
      role: 'land_officer',
      label: 'Land Officer',
      email: 'officer@example.com',
      badge: 'Registrar',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      desc: 'Create records & deploy blockchain hashes'
    },
    {
      role: 'citizen',
      label: 'Citizen',
      email: 'citizen@example.com',
      badge: 'Public View',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      desc: 'Search records & verify hash authenticity'
    }
  ]

  const selectDemoRole = (account) => {
    setForm({ email: account.email, password: 'password123' })
    setSelectedRole(account.role)
    setErr('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password
      }
      const res = await http.post('/auth/login', payload)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setToken(res.data.access_token)
      nav('/')
    } catch (e) {
      const detail = e?.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail.map(d => (typeof d === 'string' ? d : (d?.msg || JSON.stringify(d)))).join('; ')
        : (typeof detail === 'string' ? detail : (detail ? JSON.stringify(detail) : (e?.message || 'Authentication failed. Please verify credentials.')))
      setErr(String(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting & cyber grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
              LandSecure AI
            </div>
            <div className="text-[10px] uppercase tracking-wider text-teal-400/90 font-mono font-medium">
              EVM Blockchain & Machine Learning Guard
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2" />
            Hardhat Node :8545 Active
          </span>
          <span className="flex items-center px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" />
            ML Defense Online
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Platform Title, Highlights & Badges */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 text-xs font-medium shadow-inner">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping mr-1" />
              <span>Next-Gen Land Revenue Cyber Protection</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Intelligent <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Cyber Threat</span> Prediction
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                Securing land revenue records with dual-layer intelligence: automated anomaly detection via Random Forest & KNN algorithms paired with immutable Solidity blockchain verification.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-teal-500/40 transition-colors">
                <div className="text-teal-400 font-bold text-sm flex items-center justify-center lg:justify-start space-x-1.5 mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>ML Defense</span>
                </div>
                <div className="text-xs text-slate-400">Real-time risk scoring for suspicious operations</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-cyan-500/40 transition-colors">
                <div className="text-cyan-400 font-bold text-sm flex items-center justify-center lg:justify-start space-x-1.5 mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Blockchain</span>
                </div>
                <div className="text-xs text-slate-400">Deterministic SHA-256 hashes anchored on-chain</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-purple-500/40 transition-colors">
                <div className="text-purple-400 font-bold text-sm flex items-center justify-center lg:justify-start space-x-1.5 mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Zero-Trust</span>
                </div>
                <div className="text-xs text-slate-400">Strict cryptographic RBAC & tamper audit trails</div>
              </div>
            </div>

            {/* Quick-Fill Demo Role Switcher */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-center lg:justify-start space-x-2">
                <span>Select Demo Account for One-Click Fill:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts.map((acc) => {
                  const isSelected = selectedRole === acc.role
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => selectDemoRole(acc)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-teal-400 shadow-md shadow-teal-500/10 ring-1 ring-teal-400/50'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          {acc.icon}
                          <span className="font-semibold text-xs text-white">{acc.label}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${acc.badgeColor}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{acc.email}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Unique Authentication Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
              
              {/* Corner decorative accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-tr-2xl pointer-events-none" />

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">System Access</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                    JWT Auth
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Authenticate your credentials to access authorized land revenue registers & threat dashboards.
                </p>
              </div>

              {/* Error Alert Box */}
              {err && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{err}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="login-email">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                      placeholder="e.g. officer@example.com"
                      value={form.email}
                      onChange={e => {
                        setForm({ ...form, email: e.target.value })
                        setSelectedRole(null)
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300" htmlFor="login-password">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">Default: password123</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 relative overflow-hidden group bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:via-cyan-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating Secure Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to LandSecure</span>
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Registration and Verification Footer Link */}
              <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
                <span>New department or officer?</span>
                <Link
                  to="/register"
                  className="text-teal-400 hover:text-teal-300 font-semibold hover:underline inline-flex items-center space-x-1"
                >
                  <span>Register Account</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer System Status Bar */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span>LandSecure AI Platform v0.1.0</span>
          <span>•</span>
          <span>Solidity Contract: <code className="text-teal-400/80 font-mono">0x5FbD...0aa3</code></span>
        </div>
        <div className="text-slate-500">
          Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records
        </div>
      </footer>
    </div>
  )
}
