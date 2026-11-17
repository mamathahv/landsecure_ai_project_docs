import { useEffect, useState } from 'react'
import http from '../services/api'

export default function Alerts() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    try {
      const r = await http.get('/alerts', { params: { status: status || undefined, limit: 50 } })
      setItems(r.data.items)
      setTotal(r.data.total)
    } catch (e) {
      // handled
    }
  }

  useEffect(() => {
    load()
  }, [status])

  const update = async (id, st) => {
    setUpdatingId(id)
    try {
      await http.patch(`/alerts/${id}`, { status: st })
      load()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Threat Alert Triage Center</h1>
          <p className="text-xs text-slate-400">
            Automated alerts generated from high-risk ML predictions and authorization violations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="filter-alert-status" className="text-xs text-slate-400">Status:</label>
          <select
            id="filter-alert-status"
            aria-label="Filter Alert Status"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 focus:outline-none focus:border-teal-500"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Triage States</option>
            <option value="open">Open (Unresolved)</option>
            <option value="investigated">Under Investigation</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total Alerts: <b>{total}</b></span>
          <span className="text-[11px] font-mono text-slate-500">Auto-prioritized by risk score</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {items.map(a => {
            const isResolved = a.status === 'resolved'
            const isInvestigating = a.status === 'investigated'
            return (
              <div key={a.id} className="p-5 hover:bg-slate-800/30 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                      a.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                      a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                      a.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {a.severity}
                    </span>
                    <span className="font-semibold text-white text-sm">{a.event_type}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border self-start sm:self-auto ${
                    isResolved
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isInvestigating
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                  }`}>
                    ● {a.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                  <span>Actor: <b className="text-white">{a.user_email || 'anonymous'}</b></span>
                  {a.record_id && <span>Record: <b className="text-teal-400">{a.record_id}</b></span>}
                  <span className="text-slate-500">Logged: {a.created_at ? new Date(a.created_at).toLocaleString() : 'N/A'}</span>
                </div>

                {a.phone_alert && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-1.5 text-slate-300">
                    <span className="text-teal-400 font-bold flex items-center space-x-1">
                      <span>📱</span>
                      <span>Phone SMS Alert:</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      {a.phone_alert.delivery_status || 'SENT'}
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="text-white font-mono font-semibold">{a.phone_alert.recipient_phone}</span>
                    {a.phone_alert.message && (
                      <span className="text-slate-400 text-[10px] italic hidden sm:inline">
                        "{a.phone_alert.message}"
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  {!isInvestigating && !isResolved && (
                    <button
                      onClick={() => update(a.id, 'investigated')}
                      disabled={updatingId === a.id}
                      className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-medium transition-colors"
                    >
                      Mark Under Investigation
                    </button>
                  )}
                  {!isResolved && (
                    <button
                      onClick={() => update(a.id, 'resolved')}
                      disabled={updatingId === a.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors"
                    >
                      Resolve &amp; Close Alert
                    </button>
                  )}
                  {isResolved && (
                    <span className="text-xs text-slate-500 font-mono">
                      Resolved by {a.resolved_by || 'admin'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {!items.length && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No alerts in current triage state. System operational integrity is optimal!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
