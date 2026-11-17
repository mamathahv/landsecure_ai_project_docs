import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import http, { setToken } from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'citizen', phone_number: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const trimmedPhone = form.phone_number?.trim()
      const payload = {
        ...form,
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phone_number: trimmedPhone ? trimmedPhone : undefined
      }
      const res = await http.post('/auth/register', payload)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setToken(res.data.access_token)
      nav('/')
    } catch (e) {
      const detail = e?.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail.map(d => (typeof d === 'string' ? d : (d?.msg || JSON.stringify(d)))).join('; ')
        : (typeof detail === 'string' ? detail : (detail ? JSON.stringify(detail) : (e?.message || 'Registration failed')))
      setErr(String(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header */}
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

        <Link
          to="/login"
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          ← Back to Login
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                RBAC Enrollment
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Register an identity for cryptographic signature attribution & role verification.
            </p>
          </div>

          {err && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start space-x-2.5">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                required
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                placeholder="e.g. Ramesh Kumar"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                placeholder="name@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-phone">
                Phone Number <span className="text-slate-500 font-normal">(10 digits, for security SMS alerts)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                maxLength={10}
                pattern="\d{10}"
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 font-mono"
                placeholder="e.g. 9876543210"
                value={form.phone_number}
                onChange={e => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-pass">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="reg-role">
                Assigned System Role
              </label>
              <select
                id="reg-role"
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="citizen" className="bg-slate-900 text-white">Citizen (Public record view & blockchain verification)</option>
                <option value="land_officer" className="bg-slate-900 text-white">Land Officer (Record CRUD & smart contract registration)</option>
                <option value="admin" className="bg-slate-900 text-white">Administrator (Threat monitoring, audits & alerts)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:via-cyan-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <span>Complete Enrollment & Login</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
            <span>Already have an account?</span>
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-6 py-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm text-[11px] text-slate-500 text-center">
        LandSecure AI Security Architecture • Zero-Trust Cryptographic Identity
      </footer>
    </div>
  )
}
