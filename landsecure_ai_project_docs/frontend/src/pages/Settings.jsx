import { useState, useEffect } from 'react'
import http from '../services/api'

export default function Settings() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '')
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [testingAlert, setTestingAlert] = useState(false)
  const [msg, setMsg] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    http.get('/users/me/profile')
      .then(res => {
        if (res.data) {
          setUser(prev => ({ ...prev, ...res.data }))
          if (res.data.phone_number) setPhoneNumber(res.data.phone_number)
        }
      })
      .catch(() => {})
  }, [])

  const check = async () => {
    setLoading(true)
    try {
      const r = await http.get('/health')
      setHealth(r.data)
    } catch (e) {
      setHealth({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePhone = async (e) => {
    e.preventDefault()
    setMsg('')
    setErr('')
    setTestResult(null)
    setSavingPhone(true)
    try {
      const r = await http.patch('/users/me/profile', { phone_number: phoneNumber.trim() || null })
      setUser(r.data)
      localStorage.setItem('user', JSON.stringify({ ...user, ...r.data }))
      setMsg('Phone number altered & updated successfully! Security event phone_number_altered logged in telemetry.')
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setSavingPhone(false)
    }
  }

  const handleTestAlert = async () => {
    setMsg('')
    setErr('')
    setTestResult(null)
    setTestingAlert(true)
    try {
      const r = await http.post('/users/me/test-phone-alert')
      setTestResult(r.data)
      setMsg('Phone SMS alert dispatched! Check the Threat Alert Triage Center for real-time status.')
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setTestingAlert(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Architecture &amp; Settings</h1>
        <p className="text-xs text-slate-400">
          Runtime diagnostics, smart contract pointers, and account authorization details.
        </p>
      </div>

      {/* Phone Number Alteration & Security Alert Configuration Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Security Phone Alerts &amp; Profile Alteration</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Active SMS Gateway
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure or alter your emergency phone number for instant SMS alerts on high/critical cyber threats.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-500">Current Linked: </span>
            <span className="text-xs font-mono font-bold text-white">
              {user?.phone_number ? `+91-${user.phone_number}` : 'None (Alerts Unlinked)'}
            </span>
          </div>
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-200 text-xs flex items-center space-x-2">
            <span>✓</span>
            <span>{msg}</span>
          </div>
        )}

        {err && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
            <span>⚠</span>
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePhone} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-8 space-y-1">
            <label htmlFor="user-phone-input" className="block text-xs font-medium text-slate-300">
              Alter Phone Number <span className="text-slate-500 font-normal">(10 digits)</span>
            </label>
            <input
              id="user-phone-input"
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="sm:col-span-4 flex items-center space-x-2">
            <button
              type="submit"
              disabled={savingPhone}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              {savingPhone ? 'Altering...' : 'Save & Alter Phone'}
            </button>
          </div>
        </form>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400">
            High &amp; Critical severity anomalies dispatch instant SMS alerts to this number.
          </div>
          <button
            type="button"
            onClick={handleTestAlert}
            disabled={testingAlert || !user?.phone_number}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 text-xs font-medium transition-colors disabled:opacity-40"
          >
            {testingAlert ? 'Dispatching Test...' : 'Send Test Phone Alert'}
          </button>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
            <div className="text-teal-400 font-bold">● SMS Dispatch Confirmed</div>
            <div>Recipient: +91-{testResult.recipient_phone}</div>
            <div className="text-slate-400 text-[11px]">{testResult.message}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Session Identity */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Active Session Security Profile
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Identity Email:</span>
              <span className="font-mono text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alert Phone:</span>
              <span className="font-mono text-teal-300">{user?.phone_number ? `+91-${user.phone_number}` : 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Authorized Role:</span>
              <span className="font-mono text-teal-400 capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Token Algorithm:</span>
              <span className="font-mono text-slate-300">HS256 (HMAC-SHA256)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Token Duration:</span>
              <span className="font-mono text-slate-300">60 Minutes</span>
            </div>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Service Endpoints &amp; Nodes
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">FastAPI Backend:</span>
              <span className="font-mono text-emerald-400">http://127.0.0.1:8000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hardhat EVM Chain:</span>
              <span className="font-mono text-cyan-400">http://127.0.0.1:8545</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MongoDB Database:</span>
              <span className="font-mono text-indigo-400">mongodb://127.0.0.1:27017</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Interactive Swagger:</span>
              <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline font-mono">
                /docs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Live Health Probe */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Full-Stack Health Probe</h2>
            <p className="text-xs text-slate-400">Ping database and verify backend responsiveness</p>
          </div>
          <button
            onClick={check}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Probing...' : 'Run Diagnostics'}
          </button>
        </div>

        {health && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
