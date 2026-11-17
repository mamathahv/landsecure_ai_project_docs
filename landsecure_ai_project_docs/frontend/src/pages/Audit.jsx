import { useState, useEffect } from 'react'
import http from '../services/api'

export default function Audit() {
  const [recordId, setRecordId] = useState('')
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [samples, setSamples] = useState([])

  useEffect(() => {
    http.get('/records', { params: { limit: 5 } }).then(r => setSamples(r.data.items || [])).catch(() => {})
  }, [])

  const load = async (idToLoad) => {
    const target = idToLoad || recordId
    if (!target) return setErr('Please specify a valid Record ID')
    setErr('')
    setLoading(true)
    try {
      const r = await http.get(`/records/${target}/history`)
      setItems(r.data.items || [])
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Immutable Audit Trail</h1>
        <p className="text-xs text-slate-400">
          Chronological version history and tamper-evident change records preserved across all modifications.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Query Record Audit Trail
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-500"
              placeholder="Paste MongoDB Record ID..."
              value={recordId}
              onChange={e => setRecordId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
            <button
              onClick={() => load()}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? 'Retrieving...' : 'Fetch History'}
            </button>
          </div>
        </div>

        {samples.length > 0 && (
          <div>
            <div className="text-[11px] text-slate-400 mb-1.5">Quick select sample records:</div>
            <div className="flex flex-wrap gap-2">
              {samples.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setRecordId(s.id)
                    load(s.id)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-teal-300 transition-colors"
                >
                  {s.survey_number}
                </button>
              ))}
            </div>
          </div>
        )}

        {err && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            {err}
          </div>
        )}

        <div className="divide-y divide-slate-800/60 pt-2">
          {items.map(v => (
            <div key={v.id || v._id} className="py-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono font-bold">
                    Revision v{v.version}
                  </span>
                  <span className="font-semibold text-white capitalize">{v.change_type}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {v.changed_at ? new Date(v.changed_at).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                Authorized By: <span className="font-mono text-slate-200">{v.changed_by}</span>
              </div>

              {v.hash && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-teal-300 break-all">
                  SHA-256: {v.hash}
                </div>
              )}

              {v.updates && (
                <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                  {JSON.stringify(v.updates, null, 2)}
                </pre>
              )}
            </div>
          ))}

          {!items.length && !loading && (
            <div className="py-8 text-center text-slate-500 text-xs">
              Select or paste a Record ID to view its revision timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
