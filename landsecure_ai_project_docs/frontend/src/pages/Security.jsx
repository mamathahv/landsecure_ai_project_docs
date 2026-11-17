import { useEffect, useState } from 'react'
import http from '../services/api'

export default function Security() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await http.get('/activity/events', {
        params: { limit: 50, event_type: filterType || undefined }
      })
      setItems(r.data.items)
      setTotal(r.data.total)
    } catch (e) {
      // handled
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filterType])

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Telemetry &amp; Access Logs</h1>
          <p className="text-xs text-slate-400">
            Real-time activity audit trails ingested by behavioral anomaly classifiers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="filter-event-type" className="text-xs text-slate-400">Filter Event:</label>
          <select
            id="filter-event-type"
            aria-label="Filter Event Type"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 focus:outline-none focus:border-teal-500"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All Events</option>
            <option value="unauthorized_attempt">Unauthorized Attempts</option>
            <option value="login_failed">Failed Logins</option>
            <option value="record_created">Record Creations</option>
            <option value="record_updated">Record Updates</option>
            <option value="record_tampered">Record Tampering</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Logged Security Events: <b>{total}</b></span>
          {loading && <span className="text-teal-400 font-mono text-[11px] animate-pulse">Streaming logs...</span>}
        </div>

        <div className="divide-y divide-slate-800/60">
          {items.map(e => {
            const pred = e.prediction || {}
            const isSuspicious = pred.predicted_class === 'suspicious'
            return (
              <div key={e.id} className="p-4 hover:bg-slate-800/30 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-medium ${getEventBadge(e.event_type)}`}>
                      {e.event_type}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-semibold">{e.user_email || 'System Operation'}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {e.created_at ? new Date(e.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500">AI Classification: </span>
                    <span className={`font-semibold ${isSuspicious ? 'text-red-400' : 'text-emerald-400'}`}>
                      {pred.predicted_class || 'normal'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Severity Tier: </span>
                    <span className="font-mono text-white font-bold">{pred.severity || 'LOW'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Anomaly Risk Score: </span>
                    <span className="font-mono text-teal-300">
                      {pred.score !== undefined ? `${(pred.score * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                </div>

                {e.record_id && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    Target Record ID: <span className="text-teal-400">{e.record_id}</span>
                  </div>
                )}
              </div>
            )
          })}
          {!items.length && !loading && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No telemetry events found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
