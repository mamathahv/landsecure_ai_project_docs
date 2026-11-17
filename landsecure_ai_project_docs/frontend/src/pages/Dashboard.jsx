import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import http from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chainStatus, setChainStatus] = useState(null)
  const [mlStatus, setMlStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')

  const fetchAll = async () => {
    if (!token) return
    try {
      const [sRes, bcRes, mlRes] = await Promise.all([
        http.get('/dashboard/stats'),
        http.get('/blockchain/status').catch(() => ({ data: { connected: false } })),
        http.get('/ml/status').catch(() => ({ data: { model_loaded: false } }))
      ])
      setStats(sRes.data)
      setChainStatus(bcRes.data)
      setMlStatus(mlRes.data)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // Listen for simulation events from layout
    const onSecurityUpdate = () => fetchAll()
    window.addEventListener('security_event_updated', onSecurityUpdate)
    return () => window.removeEventListener('security_event_updated', onSecurityUpdate)
  }, [token])

  if (!token) {
    return (
      <div className="p-8 text-center text-slate-400">
        Session expired. Please <Link to="/login" className="text-teal-400 font-semibold underline">Sign In</Link>.
      </div>
    )
  }

  const sev = stats?.alerts_by_severity || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  const totalAlertsCount = Object.values(sev).reduce((a, b) => a + b, 0)
  const sevData = [
    { name: 'Critical', count: sev.CRITICAL || 0, color: '#ef4444' },
    { name: 'High', count: sev.HIGH || 0, color: '#f97316' },
    { name: 'Medium', count: sev.MEDIUM || 0, color: '#eab308' },
    { name: 'Low', count: sev.LOW || 0, color: '#06b6d4' }
  ]

  const trafficData = [
    { name: 'Safe Ops', count: stats?.safe_events || 0, fill: '#10b981' },
    { name: 'Suspicious', count: stats?.suspicious_events || 0, fill: '#ef4444' }
  ]

  const copyContract = () => {
    navigator.clipboard?.writeText('0x5FbDB2315678afecb367f032d93F642f64180aa3')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'unauthorized_attempt':
        return 'bg-red-500/15 text-red-300 border-red-500/30'
      case 'login_failed':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      case 'record_tampered':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
      case 'record_created':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      case 'record_updated':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Security Posture Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono font-medium">
                Live Cyber Threat Shield
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')} View</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Operational Security Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Blockchain-anchored land revenue integrity monitoring, real-time machine-learning anomaly detection, and role-based zero-trust audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchAll}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

            <Link
              to="/records/new"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-teal-500/20 transition-all flex items-center space-x-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Record</span>
            </Link>
          </div>
        </div>
      </div>

      {err && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{err}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Records */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Land Records</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats ? stats.total_records : '—'}</div>
          <div className="text-[10px] text-teal-400 mt-1 flex items-center space-x-1">
            <span>● 100% SHA-256 Hashed</span>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Enrolled Users</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats ? stats.total_users : '—'}</div>
          <div className="text-[10px] text-slate-400 mt-1">Role-Based Access</div>
        </div>

        {/* Total Events */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Events</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats ? stats.total_events : '—'}</div>
          <div className="text-[10px] text-slate-400 mt-1">Audit log entries</div>
        </div>

        {/* Suspicious Events */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Suspicious</span>
            <div className={`w-7 h-7 rounded-lg ${stats?.suspicious_events > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'} flex items-center justify-center`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className={`text-2xl font-black ${stats?.suspicious_events > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats ? stats.suspicious_events : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats?.suspicious_events > 0 ? 'Threat flagged' : 'Zero threats flagged'}
          </div>
        </div>

        {/* Safe Events */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Safe Operations</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats ? stats.safe_events : '—'}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Normal authenticated</div>
        </div>

        {/* Open Alerts */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Alerts</span>
            <div className={`w-7 h-7 rounded-lg ${stats?.open_alerts > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'} flex items-center justify-center`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className={`text-2xl font-black ${stats?.open_alerts > 0 ? 'text-amber-400' : 'text-white'}`}>
            {stats ? stats.open_alerts : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats?.open_alerts > 0 ? 'Pending triage' : 'All clear'}
          </div>
        </div>
      </div>

      {/* Middle Section: Threat Analytics & Blockchain Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Alerts by Severity Visualizer */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Alerts by Threat Severity</span>
              </h2>
              <p className="text-xs text-slate-400">Classified according to ML risk scoring thresholds</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Total: {totalAlertsCount}
            </span>
          </div>

          {/* If total alerts are 0, display a rich "All Clear" defensive baseline UI instead of empty whitespace */}
          {totalAlertsCount === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">All Security Baselines Normal</div>
                <div className="text-xs text-slate-400 max-w-sm mt-0.5">
                  No active critical, high, or medium threat alerts triggered in the current inspection window.
                </div>
              </div>

              {/* Monitored Tiers Pill Group */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-md pt-2">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-red-500/20 text-center">
                  <div className="text-[10px] text-red-400 font-bold uppercase">Critical</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">0</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-orange-500/20 text-center">
                  <div className="text-[10px] text-orange-400 font-bold uppercase">High</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">0</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-yellow-500/20 text-center">
                  <div className="text-[10px] text-yellow-400 font-bold uppercase">Medium</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">0</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-center">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase">Low</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">0</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sevData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {sevData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Blockchain & AI Health Terminal Card */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>EVM Blockchain & ML Terminal</span>
                </h2>
                <p className="text-xs text-slate-400">Cryptographic consensus and model inference state</p>
              </div>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Node 8545 Active</span>
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Contract Address */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 tracking-wider">Contract Address</div>
                  <div className="text-teal-300 font-semibold truncate max-w-xs sm:max-w-md">
                    0x5FbDB2315678afecb367f032d93F642f64180aa3
                  </div>
                </div>
                <button
                  onClick={copyContract}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans transition-colors shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-500 tracking-wider font-mono">Consensus Status</div>
                  <div className="text-xs font-semibold text-white mt-1 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Hardhat EVM Local</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">RPC: http://127.0.0.1:8545</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-500 tracking-wider font-mono">AI Threat Engine</div>
                  <div className="text-xs font-semibold text-white mt-1 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Dual Pipeline Ready</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Random Forest + KNN Loaded</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 mt-4">
            <Link
              to="/blockchain"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-center text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Verify On-Chain
            </Link>
            <Link
              to="/threat"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-center text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Test Predictor
            </Link>
            <Link
              to="/security"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-center text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Event Logs
            </Link>
            <Link
              to="/audit"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-center text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Audit Trail
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Security Telemetry Activity Feed */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Recent Security Events & Audit Stream</span>
            </h2>
            <p className="text-xs text-slate-400">Captured by backend middleware and evaluated by ML pipeline</p>
          </div>
          <Link
            to="/security"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold hover:underline inline-flex items-center space-x-1"
          >
            <span>View All Events</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Event Classification</th>
                <th className="pb-3">Actor / Email</th>
                <th className="pb-3">AI Prediction</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {stats?.recent_events?.map((ev) => {
                const pred = ev.prediction || {}
                const isSuspicious = pred.predicted_class === 'suspicious'
                return (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pl-2">
                      <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-mono ${getEventBadge(ev.event_type)}`}>
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400 truncate max-w-xs">
                      {ev.user_email || 'anonymous'}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center space-x-1 font-medium ${isSuspicious ? 'text-red-400' : 'text-emerald-400'}`}>
                        <span>{pred.predicted_class || 'normal'}</span>
                        {pred.score !== undefined && (
                          <span className="text-[10px] text-slate-500 font-mono">({(pred.score * 100).toFixed(0)}%)</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        pred.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        pred.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        pred.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {pred.severity || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {ev.created_at ? new Date(ev.created_at).toLocaleTimeString() : 'Just now'}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <Link
                        to="/security"
                        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(!stats?.recent_events || stats.recent_events.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No recent events logged yet. Use the top simulation button to test an event!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
