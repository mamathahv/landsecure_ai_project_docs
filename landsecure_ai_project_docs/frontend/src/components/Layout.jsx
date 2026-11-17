import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import http, { setToken } from '../services/api'

export default function Layout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const navigate = useNavigate()
  const location = useLocation()
  const [simulating, setSimulating] = useState(false)
  const [simMsg, setSimMsg] = useState('')

  const logout = () => {
    setToken(null)
    navigate('/login')
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const simulateAttack = async () => {
    setSimulating(true)
    setSimMsg('')
    try {
      await http.post('/activity/log', {
        event_type: 'unauthorized_attempt',
        user_email: 'attacker_test@cyber-sim.io',
        features: {
          failed_login_count: 8,
          requests_per_minute: 75,
          access_outside_normal_hours: 1,
          permission_mismatch: 1,
          records_modified_short_period: 4,
          repeated_requests_same_source: 15,
          hash_mismatch: 1,
          auth_result: 0
        },
        metadata: { simulated: true, trigger: 'quick_action_bar' }
      })
      setSimMsg('Simulated threat logged!')
      setTimeout(() => setSimMsg(''), 4000)
      // trigger page refresh/event
      window.dispatchEvent(new Event('security_event_updated'))
    } catch (e) {
      setSimMsg('Simulation error: ' + (e?.response?.data?.detail || e.message))
    } finally {
      setSimulating(false)
    }
  }

  const navGroups = [
    {
      title: 'Core Management',
      items: [
        {
          to: '/',
          label: 'Dashboard',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        },
        {
          to: '/records',
          label: 'Land Records',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          to: '/records/new',
          label: 'Add Record',
          roles: ['land_officer', 'admin'],
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'AI & Threat Defense',
      items: [
        {
          to: '/threat',
          label: 'AI Threat Predictor',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        },
        {
          to: '/security',
          label: 'Security Telemetry',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        },
        {
          to: '/alerts',
          label: 'Threat Alerts',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Web3 & Governance',
      items: [
        {
          to: '/blockchain',
          label: 'Blockchain Verify',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )
        },
        {
          to: '/audit',
          label: 'Audit History',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          to: '/users',
          label: 'User Management',
          roles: ['admin'],
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        {
          to: '/settings',
          label: 'System Settings',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        }
      ]
    }
  ]

  const roleBadgeConfig = {
    admin: { label: 'Administrator', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', avatar: 'bg-purple-600' },
    land_officer: { label: 'Land Officer', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', avatar: 'bg-emerald-600' },
    citizen: { label: 'Citizen', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', avatar: 'bg-cyan-600' }
  }

  const currentRoleCfg = roleBadgeConfig[user.role] || { label: user.role, bg: 'bg-slate-700 text-slate-300', avatar: 'bg-slate-600' }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/90 flex flex-col justify-between backdrop-blur-xl shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 p-0.5 shadow-md shadow-teal-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                LandSecure AI
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-teal-400/90">
                Security & EVM Integrity
              </div>
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navGroups.map((grp) => {
              // filter items based on user role if roles array is defined
              const visibleItems = grp.items.filter(it => !it.roles || it.roles.includes(user.role))
              if (!visibleItems.length) return null

              return (
                <div key={grp.title} className="space-y-1">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {grp.title}
                  </div>
                  {visibleItems.map(item => {
                    const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={isActive ? 'text-teal-400' : 'text-slate-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom User Card & System Status */}
        <div className="p-3 border-t border-slate-800/80 space-y-3">
          {/* Node Status Pill */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center space-x-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hardhat EVM</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-mono">Port 8545</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center space-x-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>ML Predictor</span>
              </span>
              <span className="text-cyan-400 text-[10px] font-mono">RF / KNN</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className={`w-8 h-8 rounded-lg ${currentRoleCfg.avatar} flex items-center justify-center text-white text-xs font-bold uppercase shrink-0`}>
                {user.email?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user.full_name || user.email?.split('@')[0]}</div>
                <div className="flex items-center space-x-1">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${currentRoleCfg.bg}`}>
                    {currentRoleCfg.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="text-xs text-slate-400 flex items-center space-x-1 font-mono">
              <span className="text-teal-400">landsecure</span>
              <span>/</span>
              <span className="text-white capitalize font-sans font-medium">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '').replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {simMsg && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 animate-pulse">
                {simMsg}
              </span>
            )}

            {/* Quick Action: Attack Simulation */}
            <button
              type="button"
              onClick={simulateAttack}
              disabled={simulating}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 text-xs font-medium transition-all shadow-sm"
              title="Simulates a synthetic cyber attack event to test ML anomaly prediction & alert pipelines"
            >
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{simulating ? 'Simulating...' : 'Simulate Cyber Event'}</span>
            </button>

            {/* System Status Indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline">System Secure</span>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-950/60">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
